import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { z } from "zod";
import type { ApiConfig } from "../config.js";
import { DatabaseService } from "../database.js";
import { ContentKind, Prisma } from "../generated/prisma/client.js";
import { MediaStorage } from "../storage.js";
import { assertPublishable, parsePayload, position, slug } from "./dto.js";
import { collectReferences } from "./references.js";

const checksum = z.string().regex(/^[0-9a-f]{64}$/);
const manifest = z.strictObject({
  version: z.literal(1),
  media: z.array(z.strictObject({
    id: z.uuid(), sha256: checksum, path: z.string().regex(/^images\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.webp$/),
    size: z.int().positive().max(15 * 1024 ** 2), width: z.int().positive(), height: z.int().positive(), alt: z.string().max(300),
  })).max(1000),
  records: z.array(z.strictObject({
    id: z.uuid(), hash: checksum, kind: z.enum(ContentKind), sourceKey: z.string().regex(/^v1:[a-z0-9:-]+$/),
    source: z.string().max(250), slug, position, payload: z.unknown(),
  })).max(1000),
});

type Input = z.output<typeof manifest>;
type RecordInput = Input["records"][number];
type MediaInput = Input["media"][number];
type Decision = { sourceKey: string; action: "create" | "update" | "unchanged" | "conflict"; reason?: string };
const hash = (body: string | Uint8Array) => createHash("sha256").update(body).digest("hex");
type Tx = Prisma.TransactionClient;

function verifyManifest(raw: unknown) {
  const input = manifest.parse(raw);
  if (new Set(input.records.map(({ sourceKey }) => sourceKey)).size !== input.records.length ||
      new Set(input.records.map(({ id }) => id)).size !== input.records.length ||
      new Set(input.media.map(({ id }) => id)).size !== input.media.length) throw new Error("Claves V1 duplicadas.");
  for (const record of input.records) {
    const { id: _id, hash: expected, ...body } = record;
    if (!z.uuid().safeParse(_id).success || hash(JSON.stringify(body)) !== expected) throw new Error("Checksum de fuente V1 distinto.");
  }
  return input;
}

async function plan(db: Tx, records: RecordInput[]) {
  const rows = await db.contentEntry.findMany({ where: { OR: [
    { sourceKey: { in: records.map((record) => record.sourceKey) } },
    { id: { in: records.map((record) => record.id) } },
    ...records.map(({ kind, slug }) => ({ kind, slug })),
  ] } });
  const byKey = new Map(rows.map((entry) => [entry.sourceKey, entry]));
  const bySlug = new Map(rows.map((entry) => [`${entry.kind}:${entry.slug}`, entry]));
  const ids = new Set(rows.map(({ id }) => id));
  return records.map((record): Decision => {
    const current = byKey.get(record.sourceKey);
    const occupied = bySlug.get(`${record.kind}:${record.slug}`);
    if (!current) {
      return occupied || ids.has(record.id)
        ? { sourceKey: record.sourceKey, action: "conflict", reason: "Identidad existente con otra procedencia." }
        : { sourceKey: record.sourceKey, action: "create" };
    }
    if (current.id !== record.id || current.kind !== record.kind || (occupied && occupied.id !== current.id)) {
      return { sourceKey: record.sourceKey, action: "conflict", reason: "Identidad existente con otra procedencia." };
    }
    if (current.sourceHash === record.hash) return { sourceKey: record.sourceKey, action: "unchanged" };
    if (current.sourceVersion !== current.version || current.archivedAt || current.withdrawnAt || current.slug !== record.slug) {
      return { sourceKey: record.sourceKey, action: "conflict", reason: "La fuente cambió y la entrada tiene cambios editoriales." };
    }
    return { sourceKey: record.sourceKey, action: "update" };
  });
}

async function readMedia(root: string, media: MediaInput) {
  const path = join(root, media.path);
  const stat = await lstat(path);
  if (!stat.isFile() || stat.size !== media.size || media.width * media.height > 40_000_000) {
    throw new Error("Derivado V1 ausente o distinto.");
  }
  const bytes = await readFile(path);
  if (hash(bytes) !== media.sha256) throw new Error("Checksum de derivado V1 distinto.");
  return bytes;
}

async function storeMedia(tx: Tx, storage: MediaStorage, media: MediaInput, bytes: Buffer, created: string[]) {
  const storageKey = `${media.id}.webp`;
  const existing = await tx.media.findUnique({ where: { id: media.id } });
  if (existing && (existing.sha256 !== media.sha256 || existing.storageKey !== storageKey || existing.status !== "READY")) {
    throw new Error("La identidad de una imagen aprobada está ocupada.");
  }
  const available = await storage.size(storageKey);
  if (available !== null) {
    const source = available === media.size ? await storage.read(storageKey, media.size) : null;
    if (!source) throw new Error("Archivo almacenado distinto del derivado aprobado.");
    const digest = createHash("sha256");
    for await (const chunk of source) digest.update(chunk);
    if (digest.digest("hex") !== media.sha256) {
      throw new Error("Archivo almacenado distinto del derivado aprobado.");
    }
  } else {
    const temporary = storage.file(`${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, bytes, { flag: "wx", mode: 0o600 });
      await storage.write(storageKey, temporary, "image/webp", media.size);
      created.push(storageKey);
    } finally {
      await rm(temporary, { force: true });
    }
  }
  if (!existing) {
    await tx.media.create({ data: {
      id: media.id, storageKey, originalName: basename(media.path), mime: "image/webp", size: media.size, sha256: media.sha256,
      width: media.width, height: media.height, alt: media.alt, status: "READY",
    } });
  }
}

async function stage(tx: Tx, record: RecordInput, updating: boolean) {
  const parsed = parsePayload(record.kind, record.payload);
  assertPublishable(parsed, true);
  const data = {
    draftPayload: parsed.data, position: record.position, sourceLabel: record.source,
    sourceHash: record.hash, sourceKey: record.sourceKey,
  };
  const entry = updating
    ? await tx.contentEntry.update({ where: { id: record.id }, data: { ...data, version: { increment: 1 } } })
    : await tx.contentEntry.create({ data: { ...data, id: record.id, kind: record.kind, slug: record.slug } });
  return { entry, references: collectReferences(parsed) };
}

async function publish(tx: Tx, { entry, references }: Awaited<ReturnType<typeof stage>>, actorId: string, requestId: string) {
  const [assets, targets, previous] = await Promise.all([
    tx.media.findMany({ where: { id: { in: references.media.map(({ mediaId }) => mediaId) } } }),
    tx.contentEntry.findMany({ where: { id: { in: references.entries.map(({ targetId }) => targetId) } } }),
    tx.revision.aggregate({ where: { entryId: entry.id }, _max: { revisionNo: true } }),
  ]);
  if (references.media.some(({ mediaId, type }) => !assets.some((asset) => asset.id === mediaId && asset.status === "READY" &&
        (type === "either" || asset.mime.startsWith(`${type}/`)))) ||
      references.entries.some(({ targetId, kind }) => !targets.some((target) => target.id === targetId && target.kind === kind &&
        target.publishedRevisionId && !target.archivedAt))) {
    throw new Error("El inventario aprobado contiene una referencia no elegible.");
  }
  await tx.draftMediaRef.deleteMany({ where: { entryId: entry.id } });
  await tx.draftEntryRef.deleteMany({ where: { entryId: entry.id } });
  const snapshot = await tx.revision.create({ data: {
    entryId: entry.id, payload: entry.draftPayload as Prisma.InputJsonValue, slug: entry.slug,
    position: entry.position, revisionNo: (previous._max.revisionNo ?? 0) + 1, actorId,
  } });
  const media = references.media.map(({ mediaId, role, position: order }) => ({ mediaId, role, position: order }));
  const links = references.entries.map(({ targetId, role, position: order }) => ({ targetId, role, position: order }));
  await tx.draftMediaRef.createMany({ data: media.map((row) => ({ ...row, entryId: entry.id })) });
  await tx.draftEntryRef.createMany({ data: links.map((row) => ({ ...row, entryId: entry.id })) });
  await tx.revisionMediaRef.createMany({ data: media.map((row) => ({ ...row, revisionId: snapshot.id })) });
  await tx.revisionEntryRef.createMany({ data: links.map((row) => ({ ...row, revisionId: snapshot.id })) });
  await tx.contentEntry.update({ where: { id: entry.id }, data: { publishedRevisionId: snapshot.id, sourceVersion: entry.version } });
  await tx.auditEvent.create({ data: {
    actorId, requestId, entityId: entry.id, entityType: entry.kind, action: "IMPORT_V1",
    changedFields: ["publishedRevisionId", "sourceKey", "sourceHash"], outcome: "SUCCESS",
  } });
}

export async function importV1(db: DatabaseService, config: ApiConfig, raw: unknown, publicRoot: string, apply: boolean) {
  const input = verifyManifest(raw);
  const files = await Promise.all(input.media.map(async (media) => ({ media, bytes: await readMedia(publicRoot, media) })));
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(627510321)`;
    const decisions = await plan(tx, input.records);
    const conflicts = decisions.filter(({ action }) => action === "conflict").length;
    if (!apply || conflicts) return { applied: false, conflicts, decisions, media: files.length };
    const owner = await tx.owner.findUnique({ where: { singleton: true }, select: { id: true, active: true } });
    if (!owner?.active) throw new Error("Provisiona el OWNER antes de aplicar el importador.");
    const storage = new MediaStorage(config);
    await mkdir(config.mediaRoot, { recursive: true });
    const written: string[] = [];
    const requestId = randomUUID();
    try {
      for (const { media, bytes } of files) await storeMedia(tx, storage, media, bytes, written);
      for (const [index, record] of input.records.entries()) {
        const { action } = decisions[index];
        if (action === "unchanged") continue;
        await publish(tx, await stage(tx, record, action === "update"), owner.id, requestId);
      }
      return { applied: true, conflicts, decisions, media: files.length };
    } catch (error) {
      // A retried cloud import can reuse the verified immutable objects from a failed DB transaction.
      if (!config.cloudStorage) await Promise.all(written.map((key) => storage.remove(key)));
      throw error;
    }
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 60_000 });
}
