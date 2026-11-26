import { mkdir, readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const origin = "http://web:3100";
const capture = process.env.QA_CAPTURE === "1";

async function accessibility(page: Page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
}

async function viewport(page: Page, name: string) {
  for (const width of [320, 375, 390, 428, 640, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${name}, ancho ${width}`).toBe(true);
    if (capture && [375, 768, 1440].includes(width)) {
      await mkdir(".visual-evidence/p15", { recursive: true });
      await page.screenshot({ path: `.visual-evidence/p15/${name}-${width}.png`, animations: "disabled" });
    }
  }
}

test("cabeceras de producción, navegación y panel a publicación con imagen real", async ({ page, context, request }) => {
  test.setTimeout(150_000);
  const email = process.env.OWNER_TEST_EMAIL;
  const password = process.env.OWNER_TEST_PASSWORD;
  if (!email || !password || !/^globows-v2-[0-9a-f]{10}$/.test(process.env.STACK_QA_PROJECT ?? "")) {
    throw new Error("El escenario requiere el proyecto QA del runner.");
  }

  const home = await page.goto("/");
  await expect(page.getByRole("heading", { name: "Arte en el Aire," })).toBeVisible();
  expect(home?.headers()["x-frame-options"]).toBe("DENY");
  expect(home?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(home?.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(home?.headers()["content-security-policy"]).toContain("form-action 'none'");
  expect(home?.headers()["content-security-policy"]).not.toContain("http://api:3101");
  await viewport(page, "publica");
  await accessibility(page);

  expect((await request.get("/api/cms/admin/publications")).status()).toBe(401);
  const invalidRoute = await request.get("/api/cms/unknown/fixture");
  expect(invalidRoute.status()).toBe(404);
  expect(Object.keys(await invalidRoute.json()).sort()).toEqual(["code", "message", "requestId"]);
  expect(invalidRoute.headers()["x-request-id"]).toMatch(/^[a-f0-9-]{36}$/);

  const loginPage = await page.goto("/admin/login");
  expect(loginPage?.headers()["content-security-policy"]).toContain("form-action 'self'");
  expect(loginPage?.headers()["content-security-policy"]).toContain("connect-src 'self' http://api:3101");
  expect(loginPage?.headers()["cache-control"]).toContain("no-store");
  await accessibility(page);

  const challenge = await context.request.get("/api/cms/auth/csrf");
  expect(challenge.status()).toBe(200);
  const login = await context.request.post("/api/cms/auth/login", {
    headers: { Origin: origin, "X-CSRF-Token": (await challenge.json()).csrfToken },
    data: { email, password },
  });
  expect(login.status()).toBe(200);
  expect(Object.keys(await login.json()).sort()).toEqual(["csrfToken", "owner"]);
  expect((await context.cookies()).find(({ name }) => name === "globows_owner")).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/" });
  expect((await context.request.post("/api/cms/auth/logout", { headers: { Origin: origin } })).status()).toBe(403);
  expect((await context.request.get("/api/cms/admin/publications?unexpected=fixture")).status()).toBe(400);

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Administración de Globows LM" })).toBeVisible();
  await viewport(page, "panel");
  await accessibility(page);
  await page.setViewportSize({ width: 375, height: 812 });
  const toggle = page.locator(".admin-navigation-mobile > summary");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "Multimedia", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Multimedia", exact: true }).click();

  const suffix = Date.now();
  const image = `fixture-publicacion-${suffix}.webp`;
  await page.getByLabel("Archivo", { exact: true }).setInputFiles({
    name: image, mimeType: "image/webp", buffer: await readFile("public/images/gallery/baby-shower.webp"),
  });
  await page.getByRole("button", { name: "Subir archivo" }).click();
  await expect(page.getByText("Archivo guardado.")).toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("link", { name: "Blog", exact: true }).click();
  await page.getByRole("button", { name: "Crear publicación" }).click();
  const slug = `fixture-publicacion-${suffix}`;
  const title = `Publicación local ${suffix}`;
  const paragraph = "Preparación editorial · 3 < 5 y A & B.";
  await page.getByLabel("Nombre", { exact: true }).fill(title);
  await page.getByLabel("Slug", { exact: true }).fill(slug);
  await page.getByLabel("Resumen", { exact: true }).fill("Verificación local del flujo completo.");
  await page.getByLabel("Imagen de portada").selectOption({ label: image });
  await page.getByRole("button", { name: "Agregar bloque", exact: true }).click();
  await page.getByLabel("Texto", { exact: true }).fill(paragraph);
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText("Borrador guardado.")).toBeVisible();

  const publicTab = await context.newPage();
  expect((await publicTab.goto(`/blog/${slug}`))?.status()).toBe(404);
  await expect(publicTab.getByRole("heading", { name: "Publicación no encontrada" })).toBeVisible();
  expect((await request.get(`http://api:3101/api/v1/public/posts/${slug}`)).status()).toBe(404);

  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page.getByText("Contenido publicado.")).toBeVisible();
  expect((await publicTab.reload())?.status()).toBe(200);
  await expect(publicTab.getByRole("heading", { name: title })).toBeVisible();
  await expect(publicTab.getByText(paragraph, { exact: true })).toBeVisible();
  const photo = publicTab.locator(".blog-article img");
  await expect.poll(() => photo.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  const src = await photo.getAttribute("src");
  if (!src) throw new Error("URL de imagen publicada ausente.");
  expect((await request.get(src, { headers: { Range: "bytes=0-7" } })).status()).toBe(206);
  const variant = await request.get(`${src}?width=480`);
  expect(variant.status()).toBe(200);
  expect(variant.headers()["content-type"]).toBe("image/webp");
  expect(variant.headers()["cache-control"]).toBe("no-store");
  expect((await request.get(`${src}?width=99999`)).status()).toBe(404);
  await accessibility(publicTab);

  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Retirar", exact: true }).click();
  await expect(page.getByText("Contenido retirado.")).toBeVisible();
  expect((await publicTab.reload())?.status()).toBe(404);
  await expect(publicTab.getByRole("heading", { name: "Publicación no encontrada" })).toBeVisible();
  expect((await request.get(src)).status()).toBe(404);
  expect((await request.get(`${src}?width=480`)).status()).toBe(404);
});
