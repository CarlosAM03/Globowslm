import { readFile } from "node:fs/promises";
import { loadConfig } from "../config.js";
import { DatabaseService } from "../database.js";
import { importV1 } from "./import-v1.js";

async function run() {
  const [mode, ...args] = process.argv.slice(2);
  if ((mode !== "--dry-run" && mode !== "--apply") || args.length) {
    throw new Error("Usa import:v1 -- --dry-run o import:v1 -- --apply.");
  }
  const config = loadConfig(process.env);
  const raw: unknown = JSON.parse(await readFile("/app/fixtures/v1.json", "utf8"));
  const db = new DatabaseService(config);
  try {
    const result = await importV1(db, config, raw, process.env.V1_PUBLIC_ROOT ?? "/seed/public", mode === "--apply");
    console.log(JSON.stringify({ event: "import_v1", ...result }, null, 2));
    if (mode === "--apply" && result.conflicts) process.exitCode = 1;
  } finally {
    await db.onModuleDestroy();
  }
}

try {
  await run();
} catch {
  console.error(JSON.stringify({ event: "import_v1_failed", message: "Revisa el modo, inventario, OWNER y almacenamiento local." }));
  process.exitCode = 1;
}
