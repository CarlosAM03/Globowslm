import type { Prisma } from "../generated/prisma/client.js";
import { verifyPassword, type AccountRole } from "./credentials.js";

export async function lockAccountChanges(tx: Prisma.TransactionClient) {
  // Serialize two-account provisioning, recovery and password changes across API and CLI.
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(128671, 2)`;
}

export async function passwordUsedByOtherAccount(tx: Prisma.TransactionClient, role: AccountRole, password: string) {
  const other = await tx.owner.findUnique({
    where: { role: role === "OWNER" ? "ADMIN" : "OWNER" },
    select: { passwordHash: true },
  });
  return other ? verifyPassword(password, other.passwordHash) : false;
}
