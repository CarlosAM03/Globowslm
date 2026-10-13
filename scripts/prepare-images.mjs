import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const images = [
  ["assets/HeroImagen.PNG", "hero/decoracion-globows.webp"],
  ["assets/ImagenLicey.jpg", "about/licey-marquez-archivo.webp"],
  ["assets/galeria/BabyShower.png", "gallery/baby-shower.webp"],
  ["assets/galeria/XVs.png", "gallery/xv-anos.webp"],
  ["assets/galeria/KermesDiaCosecha.png", "gallery/decoracion-tematica.webp"],
];

for (const [source, destination] of images) {
  const input = path.join(root, source);
  const output = path.join(root, "public/images", destination);
  const original = await readFile(input);
  const hash = createHash("sha256").update(original).digest("hex");
  await mkdir(path.dirname(output), { recursive: true });
  const info = await sharp(original).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 88 }).toFile(output);
  if (createHash("sha256").update(await readFile(input)).digest("hex") !== hash) {
    throw new Error(`Se alteró un original: ${source}`);
  }
  console.log(`${destination}: ${info.width}×${info.height}, ${info.size} bytes; original conservado ${hash}`);
}
