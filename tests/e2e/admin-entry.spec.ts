import { expect, test } from "@playwright/test";

test("anonymous admin redirects to the accessible login without public navigation", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);

  const login = await request.get("/admin/login");
  const landing = await request.get("/");
  expect(login.headers()["content-security-policy"]).toContain("form-action 'self'");
  expect(landing.headers()["content-security-policy"]).toContain("form-action 'none'");
  expect(login.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect((await request.get("/api/cms/other/route")).status()).toBe(404);
});
