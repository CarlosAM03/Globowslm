import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("sube y previsualiza un archivo real y lo selecciona en un borrador", async ({ page, request }) => {
  const email = process.env.OWNER_TEST_EMAIL;
  const password = process.env.OWNER_TEST_PASSWORD;
  if (!email || !password) throw new Error("Se requieren fixtures del OWNER para QA.");

  await page.goto("/admin/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "Multimedia", exact: true }).click();
  await page.getByLabel("Archivo", { exact: true }).setInputFiles({
    name: "original-de-prueba.webp",
    mimeType: "image/webp",
    buffer: await readFile("public/images/hero/decoracion-globows.webp"),
  });
  await page.getByRole("button", { name: "Subir archivo" }).click();
  await expect(page.getByText("Archivo guardado.")).toBeVisible();

  const title = `Imagen de prueba ${Date.now()}`;
  await page.getByLabel("Título del archivo").fill(title);
  await page.getByLabel("Texto alternativo").fill("Decoración para un evento");
  await page.getByRole("button", { name: "Guardar datos" }).click();
  await expect(page.getByText("Datos guardados.")).toBeVisible();
  await page.getByRole("button", { name: "Previsualizar" }).click();
  const preview = page.getByRole("img", { name: "Decoración para un evento" });
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const url = await preview.getAttribute("src");
  if (!url) throw new Error("No se emitió la URL de vista previa.");
  const unsigned = new URL(url);
  unsigned.search = "";
  expect((await request.get(unsigned.href)).status()).toBe(401);

  await page.getByRole("link", { name: "Servicios", exact: true }).click();
  await page.getByRole("button", { name: "Crear servicio" }).click();
  const selector = page.getByLabel("Imagen representativa");
  await selector.selectOption({ label: title });
  await expect(selector.locator("option:checked")).toHaveText(title);
});
