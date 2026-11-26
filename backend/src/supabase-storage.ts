import { openAsBlob } from "node:fs";
import { Readable } from "node:stream";
import { ServiceUnavailableException } from "@nestjs/common";
import type { StorageConfig } from "./config.js";

export type ByteRange = { start: number; end: number };
export type StoredEntry = { name: string; size: number; updatedAt: number };

const types = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
const cloudVideoBytes = 45 * 1024 ** 2;
const unavailable = () => new ServiceUnavailableException();

export class SupabaseStorage {
  constructor(private readonly config: StorageConfig) {}

  private async request(path: string, init: RequestInit = {}, timeout = 7000) {
    const headers = new Headers(init.headers);
    headers.set("apikey", this.config.key);
    try {
      return await fetch(new URL(`/storage/v1/${path}`, this.config.origin), {
        ...init, headers, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(timeout),
      });
    } catch {
      throw unavailable();
    }
  }

  private async missing(response: Response) {
    if (response.status === 404) {
      await response.body?.cancel();
      return true;
    }
    if (response.status === 400) {
      const body = await response.json().catch(() => null) as { statusCode?: string | number; error?: string } | null;
      return String(body?.statusCode) === "404" || body?.error === "NoSuchKey";
    }
    return false;
  }

  private async readJson(response: Response): Promise<unknown> {
    if (response.ok) return response.json().catch(() => { throw unavailable(); });
    await response.body?.cancel().catch(() => {});
    throw unavailable();
  }

  async isReady() {
    const data = await this.readJson(await this.request(`bucket/${this.config.bucket}`));
    if (!data || typeof data !== "object") return false;
    const bucket = data as { public?: boolean; file_size_limit?: number; allowed_mime_types?: unknown };
    return bucket.public === false && bucket.file_size_limit === cloudVideoBytes &&
      Array.isArray(bucket.allowed_mime_types) && bucket.allowed_mime_types.length === types.length &&
      types.every((type) => (bucket.allowed_mime_types as unknown[]).includes(type));
  }

  async size(key: string): Promise<number | null> {
    const response = await this.request(`object/info/authenticated/${this.config.bucket}/${key}`);
    if (await this.missing(response)) return null;
    const value = await this.readJson(response);
    const size = (value as { size?: number } | null)?.size;
    if (typeof size !== "number" || !Number.isSafeInteger(size) || size <= 0) throw unavailable();
    return size;
  }

  async read(key: string, size: number, range?: ByteRange): Promise<Readable | null> {
    const headers = new Headers({ "Accept-Encoding": "identity" });
    if (range) headers.set("Range", `bytes=${range.start}-${range.end}`);
    const response = await this.request(`object/authenticated/${this.config.bucket}/${key}`, { headers }, 60_000);
    if (await this.missing(response)) return null;
    const bytes = range ? range.end - range.start + 1 : size;
    const expectedRange = range ? `bytes ${range.start}-${range.end}/${size}` : null;
    if (response.status !== (range ? 206 : 200) || response.headers.get("Content-Length") !== String(bytes) ||
        response.headers.get("Content-Range") !== expectedRange || !response.body) {
      await response.body?.cancel().catch(() => {});
      throw unavailable();
    }
    // Node fetch returns a real Web Stream despite the two TypeScript declarations for it.
    return Readable.fromWeb(response.body as unknown as Parameters<typeof Readable.fromWeb>[0]);
  }

  async write(key: string, path: string, mime: string, expectedSize: number) {
    const body = await openAsBlob(path, { type: mime });
    if (body.size !== expectedSize) throw unavailable();
    const response = await this.request(`object/${this.config.bucket}/${key}`, {
      method: "POST",
      headers: { "Content-Type": mime, "Cache-Control": "no-store", "X-Upsert": "false" },
      body,
    }, 90_000);
    await response.body?.cancel().catch(() => {});
    if (!response.ok) throw unavailable();
    if (await this.size(key) !== expectedSize) throw unavailable();
  }

  async remove(key: string) {
    const response = await this.request(`object/${this.config.bucket}/${key}`, { method: "DELETE" });
    if (await this.missing(response)) return;
    await response.body?.cancel().catch(() => {});
    if (!response.ok) throw unavailable();
  }

  async *entries(): AsyncGenerator<StoredEntry> {
    const limit = 100;
    for (let offset = 0; ; offset += limit) {
      const response = await this.request(`object/list/${this.config.bucket}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: "", limit, offset, sortBy: { column: "name", order: "asc" } }),
      });
      const items = await this.readJson(response);
      if (!Array.isArray(items) || items.length > limit) throw unavailable();
      for (const row of items) {
        const updatedAt = Date.parse(row?.updated_at ?? "");
        const size: unknown = row?.metadata?.size;
        if (typeof row?.name === "string" && Number.isFinite(updatedAt) &&
            typeof size === "number" && Number.isSafeInteger(size) && size > 0) {
          yield { name: row.name, updatedAt, size };
        }
      }
      if (items.length < limit) return;
    }
  }
}
