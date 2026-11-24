import { randomUUID } from "node:crypto";
import { Injectable, Module } from "@nestjs/common";
import { DatabaseModule, DatabaseService } from "../database.js";
import { ContentKind, Prisma, type ContentEntry } from "../generated/prisma/client.js";
import { assertPublishable, contentInput, EditorialError, parsePayload, validationError, version } from "./dto.js";
import { collectReferences } from "./references.js";

type Actor = { actorId: string; requestId: string };
type EntryKey = { id: string; kind: ContentKind };
type Transaction = Prisma.TransactionClient;
type References = ReturnType<typeof collectReferences>;
type Action = "PUBLISH" | "WITHDRAW" | "ARCHIVE" | "RESTORE";

const gone = () => new EditorialError("NOT_FOUND", "Contenido no encontrado.", 404);
const conflict = (message: string) => new EditorialError("CONFLICT", message, 409);
const stale = (currentVersion: number) =>
  new EditorialError("VERSION_CONFLICT", "El borrador cambió. Actualiza e intenta de nuevo.", 409, undefined, currentVersion);

export function editorialState(entry: Pick<ContentEntry, "publishedRevisionId" | "archivedAt" | "withdrawnAt">) {
  if (entry.publishedRevisionId) return "PUBLISHED";
  return entry.archivedAt || entry.withdrawnAt ? "WITHDRAWN" : "DRAFT";
}

function draftInput(kind: ContentKind, raw: unknown) {
  const parsed = contentInput.safeParse(raw);
  if (!parsed.success) throw validationError(parsed.error);
  const { slug, position, payload } = parsed.data;
  if (kind === "SITE" && slug !== "site") {
    throw new EditorialError("VALIDATION_ERROR", "El sitio usa el slug site.", 422, { slug: "Usa site." });
  }
  const validated = parsePayload(kind, payload);
  return { slug, position, validated, references: collectReferences(validated) };
}

@Injectable()
export class EditorialService {
  constructor(private readonly database: DatabaseService) {}

  async create(kind: ContentKind, raw: unknown, actor: Actor) {
    const draft = draftInput(kind, raw);
    return this.transaction(async (tx) => {
      await this.assertReferences(tx, draft.references, false);
      const entry = await tx.contentEntry.create({
        data: { id: randomUUID(), kind, slug: draft.slug, position: draft.position, draftPayload: draft.validated.data },
      });
      await this.replaceDraftReferences(tx, entry.id, draft.references);
      await this.audit(tx, entry, actor, "CREATE", ["draftPayload", "slug", "position"]);
      return entry;
    });
  }

  async edit(key: EntryKey, expected: number, raw: unknown, actor: Actor) {
    const draft = draftInput(key.kind, raw);
    return this.change(key, expected, actor, "EDIT", async (tx, entry) => {
      if (entry.archivedAt) throw conflict("Restaura el contenido archivado antes de editar.");
      if (draft.slug !== entry.slug && await tx.revision.count({ where: { entryId: entry.id } })) {
        throw conflict("El slug se conserva después de la primera publicación.");
      }
      await this.assertReferences(tx, draft.references, false);
      await this.replaceDraftReferences(tx, entry.id, draft.references);
      return {
        draftPayload: draft.validated.data,
        slug: draft.slug,
        position: draft.position,
      };
    });
  }

  async transition(key: EntryKey, expected: number, action: Action, actor: Actor) {
    return this.change(key, expected, actor, action, async (tx, entry) => {
      switch (action) {
        case "PUBLISH":
          return this.publish(tx, entry, actor);
        case "WITHDRAW":
        case "ARCHIVE": {
          if (entry.kind === ContentKind.SITE) throw conflict("El sitio institucional no se puede retirar.");
          if (entry.archivedAt || (action === "WITHDRAW" && !entry.publishedRevisionId)) {
            throw conflict("El contenido ya no está publicado.");
          }
          await this.assertNoPublishedDependents(tx, entry);
          const now = new Date();
          return {
            publishedRevisionId: null,
            withdrawnAt: now,
            ...(action === "ARCHIVE" ? { archivedAt: now } : {}),
          };
        }
        case "RESTORE":
          if (!entry.archivedAt && !entry.withdrawnAt) throw conflict("El contenido no está retirado.");
          return { archivedAt: null, withdrawnAt: null };
      }
    });
  }

  async draft(key: EntryKey) {
    const entry = await this.database.contentEntry.findUnique({ where: { id: key.id, kind: key.kind } });
    if (!entry) throw gone();
    return entry;
  }

  async published(kind: ContentKind, slug: string) {
    const entry = await this.database.contentEntry.findUnique({
      where: { kind_slug: { kind, slug } },
      select: {
        id: true, kind: true,
        publishedRevision: { select: { slug: true, position: true, payload: true, publishedAt: true } },
      },
    });
    return entry?.publishedRevision ? { id: entry.id, kind: entry.kind, ...entry.publishedRevision } : null;
  }

  private async change(
    key: EntryKey,
    expected: number,
    actor: Actor,
    action: Action | "EDIT",
    update: (tx: Transaction, entry: ContentEntry) => Promise<Prisma.ContentEntryUncheckedUpdateInput>,
  ) {
    const parsed = version.safeParse(expected);
    if (!parsed.success) throw validationError(parsed.error);
    return this.transaction(async (tx) => {
      const entry = await tx.contentEntry.findUnique({ where: { id: key.id, kind: key.kind } });
      if (!entry) throw gone();
      if (entry.version !== expected) throw stale(entry.version);
      const claimed = await tx.contentEntry.updateMany({
        where: { id: key.id, kind: key.kind, version: expected },
        data: { version: { increment: 1 } },
      });
      if (claimed.count !== 1) throw stale(entry.version);
      const data = await update(tx, entry);
      const updated = await tx.contentEntry.update({ where: { id: entry.id }, data });
      await this.audit(tx, updated, actor, action, Object.keys(data));
      return updated;
    });
  }

  private async publish(tx: Transaction, entry: ContentEntry, actor: Actor): Promise<Prisma.ContentEntryUncheckedUpdateInput> {
    if (entry.archivedAt) throw conflict("Restaura el contenido archivado antes de publicar.");
    const payload = parsePayload(entry.kind, entry.draftPayload);
    assertPublishable(payload, entry.sourceKey !== null);
    const references = collectReferences(payload);
    await this.assertReferences(tx, references, true);
    const history = await tx.revision.aggregate({ where: { entryId: entry.id }, _max: { revisionNo: true } });
    const snapshot = await tx.revision.create({
      data: {
        entryId: entry.id, revisionNo: (history._max.revisionNo ?? 0) + 1,
        payload: payload.data, position: entry.position, slug: entry.slug, actorId: actor.actorId,
      },
    });
    if (references.media.length) {
      await tx.revisionMediaRef.createMany({
        data: references.media.map(({ mediaId, role, position }) => ({ revisionId: snapshot.id, mediaId, role, position })),
      });
    }
    if (references.entries.length) {
      await tx.revisionEntryRef.createMany({
        data: references.entries.map(({ targetId, role, position }) => ({ revisionId: snapshot.id, targetId, role, position })),
      });
    }
    return { publishedRevisionId: snapshot.id, withdrawnAt: null };
  }

  private async assertReferences(tx: Transaction, references: References, publishing: boolean): Promise<void> {
    const [media, entries] = await Promise.all([
      tx.media.findMany({
        where: { id: { in: references.media.map(({ mediaId }) => mediaId) } },
        select: { id: true, mime: true, status: true },
      }),
      tx.contentEntry.findMany({
        where: { id: { in: references.entries.map(({ targetId }) => targetId) } },
        select: { id: true, kind: true, publishedRevisionId: true, archivedAt: true },
      }),
    ]);
    const assets = new Map(media.map((row) => [row.id, row]));
    const targets = new Map(entries.map((row) => [row.id, row]));
    for (const ref of references.media) {
      const asset = assets.get(ref.mediaId);
      if (!asset || asset.status === "DELETING" || (publishing && asset.status !== "READY") ||
          (ref.type !== "either" && !asset.mime.startsWith(`${ref.type}/`))) {
        throw conflict("La referencia multimedia no está disponible.");
      }
    }
    for (const ref of references.entries) {
      const target = targets.get(ref.targetId);
      if (!target || target.kind !== ref.kind || target.archivedAt || (publishing && !target.publishedRevisionId)) {
        throw conflict("El contenido referenciado no está disponible para esta operación.");
      }
    }
  }

  private async assertNoPublishedDependents(tx: Transaction, entry: ContentEntry): Promise<void> {
    const dependency = await tx.revisionEntryRef.findFirst({
      where: { targetId: entry.id, revision: { publishedFor: { isNot: null } } },
      select: { targetId: true },
    });
    if (dependency) throw conflict("Retira primero las publicaciones que dependen de este contenido.");
  }

  private async replaceDraftReferences(tx: Transaction, entryId: string, references: References): Promise<void> {
    await tx.draftMediaRef.deleteMany({ where: { entryId } });
    await tx.draftEntryRef.deleteMany({ where: { entryId } });
    if (references.media.length) {
      await tx.draftMediaRef.createMany({
        data: references.media.map(({ mediaId, role, position }) => ({ entryId, mediaId, role, position })),
      });
    }
    if (references.entries.length) {
      await tx.draftEntryRef.createMany({
        data: references.entries.map(({ targetId, role, position }) => ({ entryId, targetId, role, position })),
      });
    }
  }

  private async audit(tx: Transaction, entry: ContentEntry, actor: Actor, action: string, changedFields: string[]) {
    await tx.auditEvent.create({
      data: { ...actor, entityId: entry.id, entityType: entry.kind, action, changedFields, outcome: "SUCCESS" },
    });
  }

  private async transaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.database.$transaction(work, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;
        if (error.code === "P2034" && attempt < 2) continue;
        if (["P2034", "P2002", "P2003"].includes(error.code)) throw conflict("No se pudo completar el cambio editorial.");
        throw error;
      }
    }
    throw conflict("No se pudo completar el cambio editorial.");
  }
}

@Module({ imports: [DatabaseModule], providers: [EditorialService], exports: [EditorialService] })
export class EditorialModule {}
