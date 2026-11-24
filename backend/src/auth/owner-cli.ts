import { loadConfig } from "../config.js";
import { DatabaseService } from "../database.js";
import { email, hashPassword } from "./credentials.js";

async function run() {
  const mode = process.argv[2];
  if ((mode !== "provision" && mode !== "recover") || process.argv.length !== 3) {
    throw new Error("Usa provision o recover sin argumentos adicionales.");
  }

  const inputEmail = process.env.HARNESS_OWNER_EMAIL ?? process.env.GLOBOWS_OWNER_EMAIL;
  const inputPassword = process.env.HARNESS_OWNER_PASSWORD ?? process.env.GLOBOWS_OWNER_PASSWORD;
  const config = loadConfig(process.env);
  if (config.mode === "production" && (process.env.HARNESS_OWNER_EMAIL || process.env.HARNESS_OWNER_PASSWORD)) {
    throw new Error("Producción exige provisión externa.");
  }
  const parsedEmail = email.safeParse(inputEmail);
  if (!parsedEmail.success || !inputPassword) throw new Error("Falta configuración de la cuenta.");
  const passwordHash = await hashPassword(inputPassword);
  const db = new DatabaseService(config);
  try {
    if (mode === "provision") {
      await db.owner.create({ data: { emailNormalized: parsedEmail.data, passwordHash } });
    } else {
      await db.$transaction(async (tx) => {
        const owner = await tx.owner.update({
          where: { singleton: true },
          data: { emailNormalized: parsedEmail.data, passwordHash, active: true },
          select: { id: true },
        });
        await tx.session.updateMany({ where: { ownerId: owner.id, revokedAt: null }, data: { revokedAt: new Date() } });
      });
    }
  } finally {
    await db.onModuleDestroy();
  }
  console.log(JSON.stringify({ event: mode === "provision" ? "owner_provisioned" : "owner_recovered" }));
}

try {
  await run();
} catch {
  console.error(JSON.stringify({ event: "owner_operation_failed" }));
  process.exitCode = 1;
}
