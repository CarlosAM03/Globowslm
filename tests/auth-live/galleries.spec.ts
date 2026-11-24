import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("ordena fotografías y protege una categoría con galerías publicadas", async ({ page, context }) => {
  test.setTimeout(60_000);
  const email = process.env.OWNER_TEST_EMAIL;
  const password = process.env.OWNER_TEST_PASSWORD;
  if (!email || !password) throw new Error("Se requieren fixtures del OWNER para QA.");

  const origin = "http://127.0.0.1:3100";
  const challenge = await context.request.get("/api/cms/auth/csrf");
  expect(challenge.status()).toBe(200);
  const login = await context.request.post("/api/cms/auth/login", {
    headers: { Origin: origin, "X-CSRF-Token": (await challenge.json()).csrfToken },
    data: { email, password },
  });
  expect(login.status()).toBe(200);

  const suffix = Date.now();
  const category = `Decoraciones ${suffix}`;
  const gallery = `Montajes ${suffix}`;
  const photos = [
    { name: `rosa-${suffix}.webp`, file: "baby-shower.webp" },
    { name: `tematica-${suffix}.webp`, file: "decoracion-tematica.webp" },
  ];

  await page.goto("/admin/multimedia");
  for (const photo of photos) {
    await page.getByLabel("Archivo", { exact: true }).setInputFiles({
      name: photo.name, mimeType: "image/webp", buffer: await readFile(`public/images/gallery/${photo.file}`),
    });
    await page.getByRole("button", { name: "Subir archivo" }).click();
    await expect(page.getByText("Archivo guardado.")).toBeVisible();
    await expect(page.getByRole("button", { name: `Abrir ${photo.name}` })).toBeVisible();
  }

  await page.getByRole("link", { name: "Galerías", exact: true }).click();
  await page.getByRole("button", { name: "Categorías" }).click();
  await page.getByRole("button", { name: "Crear categoría" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill(category);
  await page.getByLabel("Orden", { exact: true }).fill("12");
  const save = page.getByRole("button", { name: "Guardar borrador" });
  const publish = page.getByRole("button", { name: "Publicar", exact: true });
  await save.click();
  await expect(page.getByText("Borrador guardado.")).toBeVisible();

  await page.getByRole("button", { name: "Galerías", exact: true }).click();
  await page.getByRole("button", { name: "Crear galería" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill(gallery);
  await page.getByLabel("Categoría de decoración").selectOption({ label: `${category} (sin publicar)` });
  for (const photo of photos) {
    await page.getByLabel("Fotografía para agregar").selectOption({ label: photo.name });
    await page.getByRole("button", { name: "Agregar fotografía" }).click();
  }
  await page.getByLabel("Pie de foto 1").fill("Montaje rosa");
  await page.getByLabel("Pie de foto 2").fill("Montaje temático");
  await page.getByRole("button", { name: "Subir foto 2" }).click();
  await expect(page.getByLabel("Pie de foto 1")).toHaveValue("Montaje temático");
  await save.click();
  await expect(page.getByText("Borrador guardado.")).toBeVisible();
  await publish.click();
  await expect(page.getByText("El contenido referenciado no está disponible para esta operación.")).toBeVisible();

  await page.getByRole("button", { name: "Categorías" }).click();
  await page.getByRole("button", { name: `Abrir ${category}` }).click();
  await publish.click();
  await expect(page.getByText("Contenido publicado.")).toBeVisible();

  await page.getByRole("button", { name: "Galerías", exact: true }).click();
  await page.getByRole("button", { name: `Abrir ${gallery}` }).click();
  await expect(page.getByLabel("Pie de foto 1")).toHaveValue("Montaje temático");
  await publish.click();
  await expect(page.getByText("Contenido publicado.")).toBeVisible();
  await page.getByRole("button", { name: "Previsualizar" }).click();
  const preview = page.getByRole("region", { name: "Vista previa del borrador" });
  await expect(preview.getByRole("listitem").first()).toContainText("Montaje temático");
  await preview.getByRole("button", { name: "Ver fotografía 1" }).click();
  await expect.poll(() => preview.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Categorías" }).click();
  await page.getByRole("button", { name: `Abrir ${category}` }).click();
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Retirar", exact: true }).click();
  await expect(page.getByText("Retira primero las publicaciones que dependen de este contenido.")).toBeVisible();
});
