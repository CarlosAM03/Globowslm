import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("owner signs in through the real BFF, resists cross-origin logout and can sign out", async ({ page, context }) => {
  const email = process.env.OWNER_TEST_EMAIL;
  const password = process.env.OWNER_TEST_PASSWORD;
  if (!email || !password) throw new Error("Se requieren fixtures de QA de acceso.");

  await page.setViewportSize({ width: 375, height: 812 });
  const pageResponse = await page.goto("/admin/login");
  expect(pageResponse?.headers()["cache-control"]).toContain("no-store");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("incorrecta");
  const denied = page.waitForResponse((response) => response.url().endsWith("/api/cms/auth/login"));
  await page.getByRole("button", { name: "Entrar" }).click();
  expect((await denied).status()).toBe(401);
  await expect(page.locator("form").getByRole("alert")).toContainText("Revisa tu correo y contraseña");

  await page.getByLabel("Contraseña").fill(password);
  const login = page.waitForResponse((response) => response.url().endsWith("/api/cms/auth/login") && response.ok());
  await page.getByRole("button", { name: "Entrar" }).click();
  expect((await login).status()).toBe(200);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Administración de Globows LM" })).toBeVisible();
  await expect(page.getByText("Aún no hay contenido editorial.")).toBeVisible();
  await expect(page.getByText("Aún no hay operaciones propias.")).toBeVisible();
  await page.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("navigation", { name: "Administración" }).getByRole("link", { name: "Panel" }))
    .toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Ver sitio" })).toHaveAttribute("href", "/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);

  let releaseDashboard: () => void = () => {};
  const waitForLoading = new Promise<void>((resolve) => { releaseDashboard = resolve; });
  await page.route("**/api/cms/admin/dashboard", async (route) => {
    await waitForLoading;
    await route.fulfill({ status: 503, json: { code: "UNAVAILABLE" } });
  }, { times: 1 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("Cargando el resumen…")).toBeVisible();
  releaseDashboard();
  await expect(page.getByText("No se pudo cargar el resumen.")).toBeVisible();
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByText("Aún no hay contenido editorial.")).toBeVisible();

  const cookie = (await context.cookies()).find(({ name }) => name === "globows_owner");
  expect(cookie && { httpOnly: cookie.httpOnly, secure: cookie.secure, path: cookie.path, sameSite: cookie.sameSite })
    .toEqual({ httpOnly: true, secure: false, path: "/", sameSite: "Lax" });
  expect(await page.evaluate(() => document.cookie.includes("globows_owner"))).toBe(false);

  const session = await context.request.get("/api/cms/auth/session");
  expect(session.status()).toBe(200);
  expect(session.headers()["cache-control"]).toContain("no-store");
  const sessionBody = await session.json();
  expect(Object.keys(sessionBody).sort()).toEqual(["csrfToken", "owner"]);
  const csrf = sessionBody.csrfToken;
  const invalidOrigin = await context.request.post("/api/cms/auth/logout", {
    headers: { Origin: "https://example.invalid", "X-Csrf-Token": csrf },
  });
  expect(invalidOrigin.status()).toBe(403);
  expect((await context.request.post("/api/cms/auth/logout", { headers: { Origin: "http://127.0.0.1:3100" } })).status()).toBe(403);

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await context.request.get("/api/cms/auth/session")).status()).toBe(401);
  expect((await context.cookies()).some(({ name }) => name === "globows_owner")).toBe(false);

  const challenge = await context.request.get("/api/cms/auth/csrf");
  const directLogin = await context.request.post("/api/cms/auth/login", {
    headers: { Origin: "http://127.0.0.1:3100", "X-Csrf-Token": (await challenge.json()).csrfToken },
    data: { email, password },
  });
  expect(directLogin.status()).toBe(200);
  expect(Object.keys(await directLogin.json()).sort()).toEqual(["csrfToken", "owner"]);
});
