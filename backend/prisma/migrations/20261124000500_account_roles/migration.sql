BEGIN;

CREATE TYPE "AccountRole" AS ENUM ('OWNER', 'ADMIN');

ALTER TABLE "owners"
    ADD COLUMN "role" "AccountRole" NOT NULL DEFAULT 'OWNER',
    ALTER COLUMN "singleton" DROP NOT NULL,
    DROP CONSTRAINT "owners_singleton_check",
    ADD CONSTRAINT "owners_role_slot_check" CHECK (
        ("role" = 'OWNER' AND "singleton" IS TRUE) OR
        ("role" = 'ADMIN' AND "singleton" IS NULL)
    ),
    ADD CONSTRAINT "owners_normalized_email_check" CHECK (
        "emailNormalized" = lower(btrim("emailNormalized"))
    );

CREATE UNIQUE INDEX "owners_role_key" ON "owners"("role");

COMMIT;
