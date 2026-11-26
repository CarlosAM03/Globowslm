ALTER TABLE "content_entries"
ADD COLUMN "sourceHash" CHAR(64),
ADD COLUMN "sourceLabel" VARCHAR(250),
ADD COLUMN "sourceVersion" INTEGER;
