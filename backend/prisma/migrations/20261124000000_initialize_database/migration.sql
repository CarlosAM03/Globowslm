CREATE TABLE "database_initialization" (
    "id" TEXT NOT NULL,
    "initializedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "database_initialization_pkey" PRIMARY KEY ("id")
);

INSERT INTO "database_initialization" ("id") VALUES ('globows-v2');
