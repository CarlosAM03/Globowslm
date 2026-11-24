import { randomUUID } from "node:crypto";
import { loadConfig } from "../config.js";
import { DatabaseService } from "../database.js";
import { EditorialService } from "./editorial.js";

async function seed() {
  const config = loadConfig(process.env);
  if (config.mode === "production" || process.argv.length !== 3 || process.argv[2] !== "--apply") {
    throw new Error("El demo requiere --apply en modo local o test.");
  }
  const db = new DatabaseService(config);
  try {
    const owner = await db.owner.findUnique({ where: { singleton: true } });
    if (!owner?.active) throw new Error("Provisiona el OWNER.");
    const slug = "demo-local-ejemplo-editorial";
    const existing = await db.contentEntry.findUnique({ where: { kind_slug: { kind: "POST", slug } } });
    if (!existing) {
      await new EditorialService(db).create("POST", {
        slug,
        payload: {
          title: "Demo local · Ejemplo editorial",
          excerpt: "Este borrador es exclusivamente un fixture de la instalación local.",
          tags: ["demo-local"], categoryRefs: [],
          blocks: [{ type: "paragraph", text: "El panel permite revisar y retirar esta entrada de prueba." }],
        },
      }, { actorId: owner.id, requestId: randomUUID() });
    }
    console.log(JSON.stringify({ event: existing ? "demo_existing" : "demo_draft_created", slug }));
  } finally {
    await db.onModuleDestroy();
  }
}

try {
  await seed();
} catch {
  console.error(JSON.stringify({ event: "demo_seed_rejected" }));
  process.exitCode = 1;
}
