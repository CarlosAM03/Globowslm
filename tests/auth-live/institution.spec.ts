import { expect, test } from "@playwright/test";

test("edita, previsualiza y publica información institucional desde el panel", async ({ page, context }) => {
  const email = process.env.OWNER_TEST_EMAIL;
  const password = process.env.OWNER_TEST_PASSWORD;
  if (!email || !password) throw new Error("Se requieren fixtures del OWNER para QA.");
  await page.goto("/admin/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "Institucional" }).click();
  await expect(page.getByRole("heading", { name: "Información institucional" })).toBeVisible();

  const marker = "Marca institucional de prueba";
  await page.getByLabel("Nombre de marca").fill(marker);
  await page.getByLabel("Nombre de la fundadora").fill("Propietaria de prueba");
  await page.getByLabel("Título principal").fill("Presentación de prueba");
  await page.getByLabel("Título de historia").fill("Historia institucional de prueba");
  await page.getByLabel("Historia", { exact: true }).fill("Texto de prueba para la historia.");
  await page.getByLabel("Filosofía").fill("Filosofía de prueba.");
  await page.getByLabel("Título SEO").fill("Título de prueba");
  await page.getByLabel("Descripción SEO").fill("Descripción institucional de prueba");
  await page.getByLabel("Instagram").fill("https://example.invalid/perfil");
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText("Revisa los datos enviados.")).toBeVisible();
  await page.getByLabel("Instagram").fill("");
  if (await page.getByRole("button", { name: "Quitar pregunta 1" }).isVisible()) {
    await page.getByRole("button", { name: "Quitar pregunta 1" }).click();
  }
  await page.getByRole("button", { name: "Añadir pregunta" }).click();
  await page.getByLabel("Pregunta 1", { exact: true }).fill("¿Pregunta de prueba?");
  await page.getByLabel("Respuesta 1", { exact: true }).fill("Respuesta de prueba.");
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText("Borrador guardado.")).toBeVisible();
  await page.getByRole("button", { name: "Previsualizar" }).click();
  await expect(page.getByRole("heading", { name: "Vista previa del borrador" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Presentación de prueba" })).toBeVisible();
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Contenido publicado.")).toBeVisible();

  const draftResponse = await context.request.get("/api/cms/admin/content/site");
  expect(draftResponse.status()).toBe(200);
  const data = await draftResponse.json();
  expect(data.items[0].state).toBe("PUBLISHED");
  expect(data.items[0].payload.contact).toEqual({});
  expect(data.items[0].payload.faq[0].question).toBe("¿Pregunta de prueba?");
  const landing = await context.request.get("/");
  expect(await landing.text()).not.toContain(marker);
});
