-- CreateEnum
CREATE TYPE "ContentKind" AS ENUM ('SITE', 'SERVICE', 'EVENT_TYPE', 'GALLERY_CATEGORY', 'GALLERY', 'TRAINING', 'CERTIFICATION', 'BLOG_CATEGORY', 'POST');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('STAGED', 'READY', 'RETIRED', 'DELETING');

-- CreateTable
CREATE TABLE "content_entries" (
    "id" UUID NOT NULL,
    "kind" "ContentKind" NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "draftPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "publishedRevisionId" UUID,
    "sourceKey" TEXT,

    CONSTRAINT "content_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "revisionNo" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "position" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" UUID NOT NULL,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "sha256" CHAR(64) NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "alt" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "status" "MediaStatus" NOT NULL DEFAULT 'STAGED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_media_refs" (
    "entryId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "draft_media_refs_pkey" PRIMARY KEY ("entryId","role","position")
);

-- CreateTable
CREATE TABLE "revision_media_refs" (
    "revisionId" UUID NOT NULL,
    "mediaId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "revision_media_refs_pkey" PRIMARY KEY ("revisionId","role","position")
);

-- CreateTable
CREATE TABLE "draft_entry_refs" (
    "entryId" UUID NOT NULL,
    "targetId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "draft_entry_refs_pkey" PRIMARY KEY ("entryId","role","position")
);

-- CreateTable
CREATE TABLE "revision_entry_refs" (
    "revisionId" UUID NOT NULL,
    "targetId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "revision_entry_refs_pkey" PRIMARY KEY ("revisionId","role","position")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedFields" TEXT[],
    "outcome" TEXT NOT NULL,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_entries_sourceKey_key" ON "content_entries"("sourceKey");

-- CreateIndex
CREATE INDEX "content_entries_kind_position_id_idx" ON "content_entries"("kind", "position", "id");

-- CreateIndex
CREATE UNIQUE INDEX "content_entries_kind_slug_key" ON "content_entries"("kind", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_entries_id_publishedRevisionId_key" ON "content_entries"("id", "publishedRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "content_revisions_entryId_revisionNo_key" ON "content_revisions"("entryId", "revisionNo");

-- CreateIndex
CREATE UNIQUE INDEX "content_revisions_entryId_id_key" ON "content_revisions"("entryId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "media_storageKey_key" ON "media"("storageKey");

-- CreateIndex
CREATE INDEX "media_status_createdAt_idx" ON "media"("status", "createdAt");

-- CreateIndex
CREATE INDEX "draft_media_refs_mediaId_idx" ON "draft_media_refs"("mediaId");

-- CreateIndex
CREATE INDEX "revision_media_refs_mediaId_idx" ON "revision_media_refs"("mediaId");

-- CreateIndex
CREATE INDEX "draft_entry_refs_targetId_idx" ON "draft_entry_refs"("targetId");

-- CreateIndex
CREATE INDEX "revision_entry_refs_targetId_idx" ON "revision_entry_refs"("targetId");

-- CreateIndex
CREATE INDEX "audit_events_at_id_idx" ON "audit_events"("at", "id");

-- CreateIndex
CREATE INDEX "audit_events_entityId_at_idx" ON "audit_events"("entityId", "at");

-- AddForeignKey
ALTER TABLE "content_entries" ADD CONSTRAINT "content_entries_id_publishedRevisionId_fkey" FOREIGN KEY ("id", "publishedRevisionId") REFERENCES "content_revisions"("entryId", "id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "content_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_media_refs" ADD CONSTRAINT "draft_media_refs_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "content_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_media_refs" ADD CONSTRAINT "draft_media_refs_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_media_refs" ADD CONSTRAINT "revision_media_refs_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "content_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_media_refs" ADD CONSTRAINT "revision_media_refs_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_entry_refs" ADD CONSTRAINT "draft_entry_refs_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "content_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_entry_refs" ADD CONSTRAINT "draft_entry_refs_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "content_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_entry_refs" ADD CONSTRAINT "revision_entry_refs_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "content_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_entry_refs" ADD CONSTRAINT "revision_entry_refs_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "content_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "content_entries"
    ADD CONSTRAINT "content_entries_singleton_slug_check" CHECK ("kind" <> 'SITE' OR "slug" = 'site'),
    ADD CONSTRAINT "content_entries_position_check" CHECK ("position" >= 0),
    ADD CONSTRAINT "content_entries_version_check" CHECK ("version" >= 1);
ALTER TABLE "content_revisions"
    ADD CONSTRAINT "content_revisions_position_check" CHECK ("position" >= 0),
    ADD CONSTRAINT "content_revisions_revision_number_check" CHECK ("revisionNo" >= 1);
ALTER TABLE "media"
    ADD CONSTRAINT "media_size_check" CHECK ("size" > 0),
    ADD CONSTRAINT "media_version_check" CHECK ("version" >= 1);
