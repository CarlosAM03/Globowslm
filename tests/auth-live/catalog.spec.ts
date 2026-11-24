import { expect, test } from "@playwright/test";

test("edita el catálogo de servicios y relaciona un tipo de evento publicado", async ({ page }) => {
  const email = process.env.OWNER_TEST_EMAIL;
  const password = process.env.OWNER_TEST_PASSWORD;
  if (!email || !password) throw new Error("Se requieren fixtures del OWNER para QA.");
  await page.goto("/admin/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "Servicios", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Servicios y tipos de evento" })).toBeVisible();

  const unique = `${Date.now()}`;
  const eventTitle = `Evento de prueba ${unique}`;
  await page.getByRole("button", { name: "Tipos de evento" }).click();
  await page.getByRole("button", { name: "Crear tipo de evento" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill(eventTitle);
  await page.getByLabel("Orden", { exact: true }).fill("14");
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText("Borrador guardado.")).toBeVisible();
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page.getByText("Contenido publicado.")).toBeVisible();

  const serviceTitle = `Servicio de prueba ${unique}`;
  await page.getByRole("button", { name: "Servicios", exact: true }).click();
  await page.getByRole("button", { name: "Crear servicio" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill(serviceTitle);
  await page.getByLabel("Descripción").fill("Descripción de prueba");
  await page.getByLabel("Orden", { exact: true }).fill("3");
  await page.getByLabel("Motivo de contacto").selectOption("decoracion");
  await page.getByRole("checkbox", { name: eventTitle }).check();
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText("Borrador guardado.")).toBeVisible();
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page.getByText("Selecciona una imagen.")).toBeVisible();

  await page.getByLabel("Orden", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByRole("row", { name: new RegExp(`${serviceTitle}.*1.*Borrador`) })).toBeVisible();
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Archivar", exact: true }).click();
  await expect(page.getByText("Contenido archivado.")).toBeVisible();
  await page.getByRole("button", { name: "Restaurar borrador" }).click();
  await expect(page.getByText("Borrador restaurado.")).toBeVisible();
});
