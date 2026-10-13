import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const phase = process.argv[2] ?? "final";
if (!["baseline", "final"].includes(phase)) throw new Error("Use baseline or final.");
const output = path.join(root, ".visual-evidence", phase);
await mkdir(output, { recursive: true });
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = pathname === "/" ? "legacy/index.html" : pathname.slice(1);
    const target = path.resolve(root, relative);
    if (relative !== "legacy/index.html" && !target.startsWith(path.join(root, "assets") + path.sep)) { response.writeHead(404).end(); return; }
    const mime = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg" };
    response.writeHead(200, { "Content-Type": mime[path.extname(target).toLowerCase()] ?? "application/octet-stream" });
    response.end(await readFile(target));
  } catch { response.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(3101, "127.0.0.1", resolve));
const browser = await chromium.launch();
const evidence = [];
try {
  for (const [width, height] of [[375, 812], [768, 1024], [1440, 900]]) {
    for (const [name, url] of [["preview", "http://127.0.0.1:3101"], [phase, "http://127.0.0.1:3100"]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
      const failures = [];
      page.on("requestfailed", (request) => failures.push({ url: request.url(), error: request.failure()?.errorText }));
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      for (const image of await page.locator("img").all()) await image.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: path.join(output, `${name}-${width}-viewport.png`) });
      await page.screenshot({ path: path.join(output, `${name}-${width}-full.png`), fullPage: true });
      const selectors = name === "preview" ? ["section:nth-of-type(1)", "#about", "#services", "#gallery", "#courses", "footer"] : ["#inicio", "#sobre-licey", "#servicios", "#galeria", "#formacion", "#certificaciones", "#contacto", "footer"];
      for (const selector of selectors) {
        const section = page.locator(selector);
        if (await section.count()) await section.screenshot({ path: path.join(output, `${name}-${width}-${selector.replace(/[^a-z0-9]/gi, "")}.png`) });
      }
      evidence.push({ name, width, height, failures, header: await page.locator("header").evaluate((el) => ({ position: getComputedStyle(el).position, height: el.getBoundingClientRect().height })), images: await page.locator("img").evaluateAll((images) => images.map((image) => ({ src: image.getAttribute("src"), loaded: image.complete && image.naturalWidth > 0 }))) });
      await page.close();
    }
  }
  await writeFile(path.join(output, "capture-manifest.json"), JSON.stringify(evidence, null, 2));
  console.log(`Comparable captures: ${output}`);
  console.log(JSON.stringify(evidence.map(({ name, width, failures }) => ({ name, width, failures })), null, 2));
} finally { await browser.close(); await new Promise((resolve) => server.close(resolve)); }
