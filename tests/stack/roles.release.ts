import { randomBytes } from "node:crypto";
import { expect, test, type APIRequestContext } from "@playwright/test";

const origin = "http://web:3100";

async function login(request: APIRequestContext, email: string, password: string) {
  const challenge = await request.get("/api/cms/auth/csrf");
  expect(challenge.status()).toBe(200);
  return request.post("/api/cms/auth/login", {
    headers: { Origin: origin, "X-CSRF-Token": (await challenge.json()).csrfToken },
    data: { email, password },
  });
}

test("OWNER y ADMIN tienen sesiones aisladas, diagnóstico restringido y cambio de contraseña propio", async ({ browser, request }) => {
  const { OWNER_TEST_EMAIL, OWNER_TEST_PASSWORD, ADMIN_TEST_EMAIL, ADMIN_TEST_PASSWORD } = process.env;
  if (!OWNER_TEST_EMAIL || !OWNER_TEST_PASSWORD || !ADMIN_TEST_EMAIL || !ADMIN_TEST_PASSWORD ||
      !/^globows-v2-[0-9a-f]{10}$/.test(process.env.STACK_QA_PROJECT ?? "")) {
    throw new Error("La prueba requiere un proyecto QA aislado con ambas cuentas fixture.");
  }
  expect((await request.get("/api/cms/admin/diagnostics")).status()).toBe(401);
  const owner = await browser.newContext({ baseURL: origin });
  const admin = await browser.newContext({ baseURL: origin });
  try {
    const ownerLogin = await login(owner.request, OWNER_TEST_EMAIL, OWNER_TEST_PASSWORD);
    const adminLogin = await login(admin.request, ADMIN_TEST_EMAIL, ADMIN_TEST_PASSWORD);
    expect(ownerLogin.status()).toBe(200);
    expect(adminLogin.status()).toBe(200);
    const ownerSession = await ownerLogin.json();
    const adminSession = await adminLogin.json();
    expect(ownerSession.owner.role).toBe("OWNER");
    expect(adminSession.owner.role).toBe("ADMIN");
    expect(Object.keys(adminSession).sort()).toEqual(["csrfToken", "owner"]);
    expect((await owner.request.get("/api/cms/admin/diagnostics")).status()).toBe(403);
    expect((await admin.request.get("/api/cms/admin/diagnostics")).status()).toBe(200);
    expect((await owner.request.get("/api/cms/admin/dashboard")).status()).toBe(200);
    expect((await admin.request.get("/api/cms/admin/dashboard")).status()).toBe(200);

    const ownerPage = await owner.newPage();
    await ownerPage.goto("/admin/diagnostico");
    await expect(ownerPage.getByText("Acceso reservado a la cuenta ADMIN.", { exact: true })).toBeVisible();
    await expect(ownerPage.getByRole("heading", { name: "Auditoría reciente" })).toHaveCount(0);
    const adminPage = await admin.newPage();
    await adminPage.goto("/admin/diagnostico");
    await expect(adminPage.getByRole("heading", { name: "Auditoría reciente" })).toBeVisible();

    const headers = { Origin: origin, "X-CSRF-Token": adminSession.csrfToken as string };
    const slug = `qa-roles-${Date.now()}`;
    const endpoint = "/api/cms/admin/content/training";
    const draft = await admin.request.post(endpoint, { headers, data: {
      slug, payload: { title: "Oferta sintética P19", description: "Fixture de roles.", trainingType: "COURSE", ctaInterest: "cursos" },
    } });
    expect(draft.status()).toBe(201);
    const { id, version } = await draft.json();
    expect((await admin.request.post(`${endpoint}/${id}/archive`, { headers, data: { version } })).status()).toBe(200);
    const audit = await admin.request.get("/api/cms/admin/diagnostics");
    expect((await audit.json()).audit).toEqual(expect.arrayContaining([expect.objectContaining({
      actorId: adminSession.owner.id, entityType: "TRAINING",
    })]));

    const nextPassword = randomBytes(30).toString("base64url");
    expect((await admin.request.post("/api/cms/auth/password", {
      headers: { Origin: origin, "X-CSRF-Token": ownerSession.csrfToken },
      data: { currentPassword: ADMIN_TEST_PASSWORD, newPassword: nextPassword },
    })).status()).toBe(403);
    await adminPage.goto("/admin/cuenta");
    await adminPage.getByLabel("Contraseña actual", { exact: true }).fill(ADMIN_TEST_PASSWORD);
    await adminPage.getByLabel("Nueva contraseña", { exact: true }).fill(nextPassword);
    await adminPage.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(adminPage).toHaveURL(/\/admin\/login$/);
    expect((await admin.request.get("/api/cms/auth/session")).status()).toBe(401);
    expect((await owner.request.get("/api/cms/auth/session")).status()).toBe(200);
    expect((await login(admin.request, ADMIN_TEST_EMAIL, nextPassword)).status()).toBe(200);
  } finally {
    await admin.close();
    await owner.close();
  }
});
