-- CreateTable
CREATE TABLE "upload_tickets" (
    "tokenHash" CHAR(64) NOT NULL,
    "ownerId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "expectedMime" TEXT NOT NULL,
    "maxBytes" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "upload_tickets_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "media_preview_tickets" (
    "tokenHash" CHAR(64) NOT NULL,
    "mediaId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_preview_tickets_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateIndex
CREATE INDEX "upload_tickets_expiresAt_idx" ON "upload_tickets"("expiresAt");

-- CreateIndex
CREATE INDEX "upload_tickets_sessionId_idx" ON "upload_tickets"("sessionId");

-- CreateIndex
CREATE INDEX "media_preview_tickets_expiresAt_idx" ON "media_preview_tickets"("expiresAt");

-- CreateIndex
CREATE INDEX "media_preview_tickets_sessionId_idx" ON "media_preview_tickets"("sessionId");

-- AddForeignKey
ALTER TABLE "upload_tickets" ADD CONSTRAINT "upload_tickets_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_preview_tickets" ADD CONSTRAINT "media_preview_tickets_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_preview_tickets" ADD CONSTRAINT "media_preview_tickets_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
