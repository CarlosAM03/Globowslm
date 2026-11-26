import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import {
  ConflictException, ForbiddenException, HttpException, Inject, Injectable, NotFoundException,
  UnauthorizedException, UnprocessableEntityException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import sharp from "sharp";
import { API_CONFIG, type ApiConfig } from "../config.js";
import { DatabaseService } from "../database.js";
import { hashToken, newToken, tokenPattern } from "../auth/credentials.js";
import type { Authenticated } from "../auth/auth.service.js";
import { Prisma, type Media } from "../generated/prisma/client.js";
import { MediaStorage } from "../storage.js";
import { formats, isMime, MiB, rangeFor, saveUpload, validateMedia, type MediaMime } from "./files.js";

const minute = 60_000;
const select = {
  id: true, originalName: true, mime: true, size: true, width: true, height: true,
  duration: true, alt: true, title: true, status: true, version: true, createdAt: true,
} satisfies Prisma.MediaSelect;

@Injectable()
export class MediaService {
  private readonly variants = new Map<string, Buffer>();
  private readonly resizing = new Map<string, Promise<Buffer>>();

  constructor(
    private readonly db: DatabaseService,
    private readonly storage: MediaStorage,
    @Inject(API_CONFIG) readonly config: ApiConfig,
  ) {}

  async list(page: number, type?: "image" | "video") {
    const pageSize = 20;
    const where = type ? { mime: { startsWith: `${type}/` } } : {};
    const [items, total] = await this.db.$transaction([
      this.db.media.findMany({
        where, select, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
      }),
      this.db.media.count({ where }),
    ]);
    return { items, total, page, pageSize, limitsMiB: { image: 15, video: this.config.videoLimitMiB } };
  }

  async get(id: string) {
    const asset = await this.db.media.findUnique({ where: { id }, select });
    if (!asset) throw new NotFoundException();
    return asset;
  }

  async uploadTicket(session: Authenticated, mime: string, size: number, filename: string) {
    if (!isMime(mime)) throw new HttpException("Formato no permitido", 415);
    if (size > this.limit(mime)) throw new HttpException("Carga demasiado grande", 413);
    if (filename === "." || filename === ".." || /[\\/:\p{Cc}]/u.test(filename)) throw new UnprocessableEntityException();
    const now = new Date();
    const expiresAt = new Date(now.valueOf() + 5 * minute);
    const token = newToken();
    await this.db.$transaction([
      this.db.uploadTicket.deleteMany({ where: { expiresAt: { lte: now } } }),
      this.db.uploadTicket.create({ data: {
        tokenHash: hashToken(token), sessionId: session.sessionId, ownerId: session.owner.id,
        expectedMime: mime, maxBytes: size, originalName: filename, expiresAt,
      } }),
    ]);
    return { token, expiresAt: expiresAt.toISOString() };
  }

  async previewTicket(session: Authenticated, mediaId: string) {
    const asset = await this.get(mediaId);
    if (!["READY", "RETIRED"].includes(asset.status)) throw new NotFoundException();
    const now = new Date();
    const expiresAt = new Date(now.valueOf() + 2 * minute);
    const token = newToken();
    await this.db.$transaction([
      this.db.mediaPreviewTicket.deleteMany({ where: { expiresAt: { lte: now } } }),
      this.db.mediaPreviewTicket.create({ data: { tokenHash: hashToken(token), mediaId, sessionId: session.sessionId, expiresAt } }),
    ]);
    return { token, expiresAt: expiresAt.toISOString() };
  }

  async upload(request: Request, requestId: string) {
    if (request.get("Origin") !== this.config.appOrigin) throw new ForbiddenException();
    const token = request.get("Authorization")?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
    if (!token) throw new UnauthorizedException();
    const now = new Date();
    const where = { tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: now }, session: this.activeSession(now) };
    const ticket = await this.db.$transaction(async (tx) => {
      const candidate = await tx.uploadTicket.findFirst({ where });
      if (!candidate) throw new UnauthorizedException();
      const claimed = await tx.uploadTicket.updateMany({ where, data: { usedAt: now } });
      if (claimed.count !== 1) throw new UnauthorizedException();
      return candidate;
    });
    const mime = request.get("Content-Type") ?? "";
    if (!isMime(mime) || mime !== ticket.expectedMime) throw new HttpException("Tipo diferente al autorizado", 415);
    if (ticket.maxBytes > this.limit(mime)) throw new HttpException("Carga demasiado grande", 413);
    const length = request.get("Content-Length");
    if (length && Number(length) > ticket.maxBytes) throw new HttpException("Carga demasiado grande", 413);

    const id = randomUUID();
    const storageKey = `${id}.${formats[mime].extension}`;
    const tmp = this.storage.file(`${id}.tmp`);
    let stored = false;
    try {
      const hash = await saveUpload(request, tmp, ticket.maxBytes);
      const metadata = await validateMedia(tmp, mime);
      await this.storage.write(storageKey, tmp, mime, hash.size);
      stored = true;
      return await this.db.$transaction(async (tx) => {
        const asset = await tx.media.create({
          data: { id, storageKey, originalName: ticket.originalName, mime, ...hash, ...metadata, status: "READY" },
          select,
        });
        await this.audit(tx, ticket.ownerId, id, requestId, "UPLOAD", ["file"]);
        return asset;
      });
    } catch (error) {
      if (stored) {
        const persisted = await this.db.media.findUnique({ where: { id }, select: { id: true } }).catch(() => undefined);
        if (persisted === null) await this.storage.remove(storageKey).catch(() => {});
      }
      throw error;
    } finally {
      await rm(tmp, { force: true });
    }
  }

  async update(id: string, input: { version: number; title: string; alt: string; retire?: boolean }, actorId: string, requestId: string) {
    return this.mutate(async (tx) => {
      const asset = await tx.media.findUnique({ where: { id } });
      if (!asset) throw new NotFoundException();
      if (asset.version !== input.version || !["READY", "RETIRED"].includes(asset.status)) throw new ConflictException();
      if (input.retire) await this.assertNoReferences(tx, id);
      const updated = await tx.media.update({
        where: { id, version: input.version },
        data: { title: input.title, alt: input.alt, version: { increment: 1 }, ...(input.retire && { status: "RETIRED" }) },
        select,
      });
      await this.audit(tx, actorId, id, requestId, input.retire ? "RETIRE_MEDIA" : "EDIT_MEDIA", ["title", "alt", ...(input.retire ? ["status"] : [])]);
      return updated;
    });
  }

  async remove(id: string, version: number, actorId: string, requestId: string) {
    const asset = await this.mutate(async (tx) => {
      const current = await tx.media.findUnique({ where: { id } });
      if (!current) throw new NotFoundException();
      if (current.version !== version) throw new ConflictException();
      await this.assertNoReferences(tx, id);
      if (current.status === "DELETING") return current;
      return tx.media.update({ where: { id, version }, data: { version: { increment: 1 }, status: "DELETING" } });
    });
    await this.storage.remove(asset.storageKey);
    await this.db.$transaction(async (tx) => {
      const removed = await tx.media.deleteMany({ where: { id, status: "DELETING" } });
      if (removed.count) await this.audit(tx, actorId, id, requestId, "DELETE_MEDIA", ["file"]);
    });
    return { deleted: true };
  }

  async publicAsset(id: string) {
    const row = await this.db.media.findFirst({
      where: { id, status: "READY", revisionRefs: { some: { revision: { publishedFor: { isNot: null } } } } },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async previewAsset(id: string, token: string | undefined) {
    if (!token || !tokenPattern.test(token)) throw new UnauthorizedException();
    const now = new Date();
    const row = await this.db.mediaPreviewTicket.findFirst({
      where: {
        tokenHash: hashToken(token), mediaId: id, expiresAt: { gt: now }, session: this.activeSession(now),
        media: { status: { in: ["READY", "RETIRED"] } },
      },
      include: { media: true },
    });
    if (!row) throw new UnauthorizedException();
    return row.media;
  }

  async send(asset: Media, req: Request, res: Response, width?: number) {
    const mime = asset.mime;
    if (!isMime(mime)) throw new NotFoundException();
    if (width && !mime.startsWith("image/")) throw new NotFoundException();
    if (width) {
      if (await this.storage.size(asset.storageKey) !== asset.size) throw new NotFoundException();
      const key = `${asset.sha256}:${width}`;
      const bytes = this.variants.get(key) ?? await this.resize(key, asset, width);
      if (bytes) {
        res.status(200).set({
          "Content-Type": "image/webp", "Content-Length": String(bytes.byteLength),
          "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
        });
        res.end(req.method === "HEAD" ? undefined : bytes);
        return;
      }
    }

    const range = rangeFor(req.get("Range"), asset.size);
    const head = req.method === "HEAD";
    if ((head || range === false) && await this.storage.size(asset.storageKey) !== asset.size) throw new NotFoundException();
    const stream = head || range === false ? null : await this.storage.read(asset.storageKey, asset.size, range ?? undefined);
    if (!head && range !== false && !stream) throw new NotFoundException();
    res.set({
      "Cache-Control": "no-store", "Referrer-Policy": "no-referrer",
      "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff",
    });
    if (range === false) {
      res.set("Content-Range", `bytes */${asset.size}`);
      res.status(416).end();
      return;
    }
    res.set("Content-Type", mime as MediaMime);
    if (range) {
      res.status(206).set({
        "Content-Range": `bytes ${range.start}-${range.end}/${asset.size}`,
        "Content-Length": String(range.end - range.start + 1),
      });
    } else {
      res.status(200).set("Content-Length", String(asset.size));
    }
    if (!stream) {
      res.end();
      return;
    }
    await pipeline(stream, res);
  }

  private resize(key: string, asset: Media, width: number) {
    const pending = this.resizing.get(key);
    if (pending) return pending;
    if (this.resizing.size >= 2) return null;
    const result = (async () => {
      const input = await this.storage.read(asset.storageKey, asset.size);
      if (!input) throw new NotFoundException();
      const image = sharp({ limitInputPixels: 40_000_000 }).rotate()
        .resize({ width, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 68 });
      const [bytes] = await Promise.all([image.toBuffer(), pipeline(input, image)]);
      this.variants.set(key, bytes);
      if (this.variants.size > 16) {
        const oldest = this.variants.keys().next().value;
        if (oldest) this.variants.delete(oldest);
      }
      return bytes;
    })().finally(() => this.resizing.delete(key));
    this.resizing.set(key, result);
    return result;
  }

  private activeSession(now: Date): Prisma.SessionWhereInput {
    return { revokedAt: null, expiresAt: { gt: now }, lastSeenAt: { gt: new Date(now.valueOf() - 30 * minute) }, owner: { active: true } };
  }

  private limit(mime: MediaMime) {
    return Math.min(formats[mime].limit, mime.startsWith("video/") ? this.config.videoLimitMiB * MiB : Infinity);
  }

  private async assertNoReferences(tx: Prisma.TransactionClient, mediaId: string) {
    const [draft, revision] = await Promise.all([
      tx.draftMediaRef.findFirst({ where: { mediaId }, select: { mediaId: true } }),
      tx.revisionMediaRef.findFirst({ where: { mediaId }, select: { mediaId: true } }),
    ]);
    if (draft || revision) throw new ConflictException();
  }

  private async mutate<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) {
    try {
      return await this.db.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2025", "P2034", "P2003"].includes(error.code)) {
        throw new ConflictException();
      }
      throw error;
    }
  }

  private audit(tx: Prisma.TransactionClient, actorId: string, entityId: string, requestId: string, action: string, changedFields: string[]) {
    return tx.auditEvent.create({ data: {
      actorId, entityId, requestId, entityType: "MEDIA", action, changedFields, outcome: "SUCCESS",
    } });
  }
}
