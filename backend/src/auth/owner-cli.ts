import { randomUUID } from "node:crypto";
import { loadConfig } from "../config.js";
import { DatabaseService } from "../database.js";
import { lockAccountChanges, passwordUsedByOtherAccount } from "./account-passwords.js";
import { accountRole, email, hashPassword, verifyPassword } from "./credentials.js";

async function run() {
  const mode = process.argv[2];
  if ((mode !== "provision" && mode !== "recover") || process.argv.length > 4) {
    throw new Error("Usa provision o recover, con rol OWNER o ADMIN.");
  }
  const role = accountRole.parse(process.argv[3] ?? "OWNER");
  const fixtureEmail = process.env[`HARNESS_${role}_EMAIL`];
  const fixturePassword = process.env[`HARNESS_${role}_PASSWORD`];

  const inputEmail = fixtureEmail ?? process.env[`GLOBOWS_${role}_EMAIL`];
  const inputPassword = fixturePassword ?? process.env[`GLOBOWS_${role}_PASSWORD`];
  const config = loadConfig(process.env);
  if (config.mode === "production" && (fixtureEmail !== undefined || fixturePassword !== undefined)) {
    throw new Error("Producción exige provisión externa.");
  }
  const parsedEmail = email.safeParse(inputEmail);
  if (!parsedEmail.success || !inputPassword) throw new Error("Falta configuración de la cuenta.");
  const db = new DatabaseService(config);
  let event: string;
  try {
    event = await db.$transaction(async (tx) => {
      await lockAccountChanges(tx);
      const account = await tx.owner.findUnique({ where: { role } });
      const label = role.toLowerCase();
      if (mode === "provision" && account) {
        if (account.active && account.emailNormalized === parsedEmail.data &&
            await verifyPassword(inputPassword, account.passwordHash)) return `${label}_already_provisioned`;
        throw new Error("El rol ya está asignado.");
      }
      if (mode === "recover" && !account) throw new Error("El rol no está aprovisionado.");
      if (await passwordUsedByOtherAccount(tx, role, inputPassword)) throw new Error("Contraseña en uso.");
      const passwordHash = await hashPassword(inputPassword);
      if (account) {
        await tx.owner.update({
          where: { id: account.id },
          data: { emailNormalized: parsedEmail.data, passwordHash, active: true },
        });
        await tx.session.updateMany({ where: { ownerId: account.id, revokedAt: null }, data: { revokedAt: new Date() } });
        await tx.auditEvent.create({ data: {
          actorId: "00000000-0000-0000-0000-000000000000", action: "ACCOUNT_RECOVERED_CLI",
          entityType: "ACCOUNT", entityId: account.id, requestId: randomUUID(), changedFields: [], outcome: "SUCCESS",
        } });
        return `${label}_recovered`;
      }
      await tx.owner.create({ data: {
        role, singleton: role === "OWNER" ? true : null, emailNormalized: parsedEmail.data, passwordHash,
      } });
      return `${label}_provisioned`;
    });
  } finally {
    await db.onModuleDestroy();
  }
  console.log(JSON.stringify({ event }));
}

try {
  await run();
} catch {
  console.error(JSON.stringify({ event: "account_operation_failed" }));
  process.exitCode = 1;
}
