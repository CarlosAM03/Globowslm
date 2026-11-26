import { loadConfig } from "../config.js";
import { DatabaseService } from "../database.js";
import { MediaStorage, storageNamePattern } from "../storage.js";

async function report() {
  if (process.argv.length !== 3 || process.argv[2] !== "--dry-run") throw new Error("Usa --dry-run.");
  const config = loadConfig(process.env);
  const storage = new MediaStorage(config);
  const db = new DatabaseService(config);
  try {
    const known = new Set((await db.media.findMany({ select: { storageKey: true } })).map(({ storageKey }) => storageKey));
    const before = Date.now() - 24 * 60 * 60 * 1000;
    const candidates: Array<{ file: string; bytes: number }> = [];
    for await (const entry of storage.entries()) {
      if (storageNamePattern.test(entry.name) && !known.has(entry.name) && entry.updatedAt < before) {
        candidates.push({ file: entry.name, bytes: entry.size });
      }
    }
    console.log(JSON.stringify({ dryRun: true, candidates }));
  } finally {
    await db.onModuleDestroy();
  }
}

try {
  await report();
} catch {
  console.error(JSON.stringify({ event: "media_cleanup_report_failed" }));
  process.exitCode = 1;
}
