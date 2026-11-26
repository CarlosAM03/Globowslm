import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { registerHooks } from "node:module";

const root = new URL("../", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    return next(specifier.startsWith("@/") ? new URL(`src/${specifier.slice(2)}.ts`, root).href : specifier, context);
  },
});

const [{ aboutContent, heroContent }, { faq }, { galleryCategories, galleryImages }, { services },
  { trainingContent }, { site }, { v1ServiceRecords }] = await Promise.all([
  import("../src/content/institutional.ts"),
  import("../src/content/faq.ts"),
  import("../src/content/gallery.ts"),
  import("../src/content/services.ts"),
  import("../src/content/training.ts"),
  import("../src/config/site.ts"),
  import("../src/lib/cms/v1-services.ts"),
]);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
function uuid(key) {
  const hex = sha256(key);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const serviceRows = services;
const approved = new Map([heroContent.image, aboutContent.image, trainingContent.image,
  ...galleryImages, ...serviceRows.flatMap((row) => row.image ? [row.image] : [])]
  .filter((photo) => photo.approval === "approved").map((photo) => [photo.src, photo]));
const media = [];
const byPath = new Map();
const hashes = new Set();
for (const [path, photo] of approved) {
  if (!/^\/images\/[a-z0-9/-]+\.webp$/.test(path)) throw new Error("Ruta de derivado V1 no admitida.");
  const bytes = await readFile(new URL(`public${path}`, root));
  const sha = sha256(bytes);
  const id = uuid(`v1:media:${sha}`);
  byPath.set(path, id);
  if (hashes.has(sha)) continue;
  hashes.add(sha);
  media.push({ id, sha256: sha, path: path.slice(1), size: bytes.length, width: photo.width, height: photo.height, alt: photo.alt });
}

const records = [];
function add(kind, sourceKey, source, slug, position, payload) {
  const body = { kind, sourceKey, source, slug, position, payload };
  records.push({ id: uuid(sourceKey), hash: sha256(JSON.stringify(body)), ...body });
}

const approvedChannel = (id) => site.channels.find((row) => row.id === id && row.status === "approved")?.destination;
add("SITE", "v1:site", "Preview comercial aprobado, Brand Discovery, ERV1", "site", 0, {
  brandName: site.name, founderName: site.founder,
  hero: { title: heroContent.title, subtitle: heroContent.subtitle, photoRef: byPath.get(heroContent.image.src) },
  about: { title: "Sobre Licey", history: aboutContent.introduction, philosophy: aboutContent.philosophy, portraitRef: byPath.get(aboutContent.image.src) },
  trajectory: [aboutContent.value, ...aboutContent.milestones.map(({ title, text }) => `${title}. ${text}`)].join("\n"),
  contact: {
    phone: site.phoneNumber, whatsapp: site.whatsappNumber, facebook: approvedChannel("facebook"),
    instagram: approvedChannel("instagram"), tiktok: approvedChannel("tiktok"), email: approvedChannel("email"),
  },
  faq,
  seo: { title: "Globows LM | Decoración con globos y formación presencial", description: heroContent.description },
});

for (const row of v1ServiceRecords(serviceRows, byPath)) {
  add("SERVICE", row.sourceKey, row.source, row.slug, row.position, row.payload);
}
for (const [order, category] of galleryCategories.entries()) {
  const categoryKey = `v1:gallery-category:${category.id}`;
  const source = "Galería de decoraciones del preview aprobado, ERV1";
  add("GALLERY_CATEGORY", categoryKey, source, category.id, order, { title: category.label });
  const photos = galleryImages.filter((photo) => photo.category === category.id && photo.approval === "approved");
  if (photos.length) add("GALLERY", `v1:gallery:${category.id}`, source, category.id, order, {
    title: category.label, categoryRef: uuid(categoryKey), featured: true,
    orderedPhotoRefs: photos.map((photo) => ({ mediaRef: byPath.get(photo.src), alt: photo.alt, caption: photo.title })),
  });
}
for (const [position, service] of serviceRows.filter(({ id }) => ["cursos", "talleres", "asesorias"].includes(id)).entries()) {
  const type = { cursos: "COURSE", talleres: "WORKSHOP", asesorias: "ADVICE" }[service.id];
  add("TRAINING", `v1:training:${service.id}`, trainingContent.source, service.id, position, {
    title: service.name, description: service.description, trainingType: type,
    photoRef: service.image ? byPath.get(service.image.src) : undefined, ctaInterest: service.interest,
  });
}

const destination = new URL("backend/fixtures/v1.json", root);
const json = JSON.stringify({ version: 1, media, records }, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if ((await readFile(destination, "utf8")).replaceAll("\r\n", "\n") !== json) throw new Error("El fixture aprobado difiere de las fuentes V1.");
} else {
  await writeFile(destination, json);
}
console.log(JSON.stringify({ records: records.length, media: media.length }));
