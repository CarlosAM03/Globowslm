import { readFile } from "node:fs/promises";
import { email, hashPassword } from "../auth/credentials.js";
import { loadConfig } from "../config.js";
import { DatabaseService } from "../database.js";
import { importV1 } from "./import-v1.js";

async function bootstrap() {
  const config = loadConfig(process.env);
  const project = process.env.STACK_QA_PROJECT ?? "";
  if (config.mode !== "local" || !/^globows-v2-[0-9a-f]{10}$/.test(project) || new URL(config.databaseUrl).hostname !== "db") {
    throw new Error("El bootstrap se limita al stack local del runner.");
  }
  const ownerEmail = email.parse(process.env.HARNESS_OWNER_EMAIL);
  const password = process.env.HARNESS_OWNER_PASSWORD;
  if (!password) throw new Error("Fixture OWNER ausente.");
  const db = new DatabaseService(config);
  try {
    const owner = await db.owner.findUnique({ where: { singleton: true } });
    if (!owner) await db.owner.create({ data: { emailNormalized: ownerEmail, passwordHash: await hashPassword(password) } });
    else if (owner.emailNormalized !== ownerEmail) throw new Error("El fixture no corresponde al OWNER existente.");
    const raw = JSON.parse(await readFile("/app/fixtures/v1.json", "utf8")) as unknown;
    const result = await importV1(db, config, raw, "/seed/public", true);
    if (result.conflicts) throw new Error("El fixture aprobado contiene conflictos.");
    console.log(JSON.stringify({ event: "qa_fixture_ready", records: result.decisions.length, media: result.media }));
  } finally {
    await db.onModuleDestroy();
  }
}

try {
  await bootstrap();
} catch {
  console.error(JSON.stringify({ event: "qa_fixture_failed" }));
  process.exitCode = 1;
}
