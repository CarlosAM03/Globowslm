import { expect, test } from "@playwright/test";

test("el contenido aprobado se carga del stack y las publicaciones cambian al recargar", async ({ page, context, request }) => {
  const email = process.env.OWNER_TEST_EMAIL;
  const password = process.env.OWNER_TEST_PASSWORD;
  if (!email || !password || !/^globows-v2-[0-9a-f]{10}$/.test(process.env.STACK_QA_PROJECT ?? "")) {
    throw new Error("El escenario necesita el proyecto QA aislado del runner.");
  }

  const siteResponse = await request.get("http://api:3101/api/v1/public/site");
  expect(siteResponse.status()).toBe(200);
  const site = await siteResponse.json();
  expect(site.services).toHaveLength(5);
  expect(site.categories).toHaveLength(3);
  expect(site.galleries.flatMap((item: { data: { photos: object[] } }) => item.data.photos)).toHaveLength(4);
  expect(site.certifications).toEqual([]);
  expect(site.site.seo.title).toContain("Globows LM");

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Arte en el Aire," })).toBeVisible();
  await expect(page.getByText("Credenciales en validación")).toBeVisible();
  await expect.poll(() => page.locator(".hero-image").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("link", { name: "Consultar cursos por WhatsApp", exact: false }).first()).toHaveAttribute("href", /wa\.me\/5216644846470\?text=/);
  await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Blog" }).click();
  await expect(page.getByRole("heading", { name: "Blog de Globows LM" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Galería" }))
    .toHaveAttribute("href", "/#galeria");

  const challenge = await context.request.get("/api/cms/auth/csrf");
  expect(challenge.status()).toBe(200);
  const origin = "http://web:3100";
  const login = await context.request.post("/api/cms/auth/login", {
    headers: { Origin: origin, "X-CSRF-Token": (await challenge.json()).csrfToken },
    data: { email, password },
  });
  expect(login.status()).toBe(200);
  const session = await context.request.get("/api/cms/auth/session");
  expect(session.status()).toBe(200);
  const auth = { Origin: origin, "X-CSRF-Token": (await session.json()).csrfToken };

  const slug = `qa-curso-${Date.now()}`;
  const title = `Oferta de prueba ${slug}`;
  const endpoint = "/api/cms/admin/content/training";
  const response = await context.request.post(endpoint, { headers: auth, data: {
    slug, payload: { title, description: "Oferta sintética para prueba del stack.", trainingType: "COURSE", ctaInterest: "cursos" },
  } });
  expect(response.status()).toBe(201);
  const row = await response.json();
  await page.goto("/#formacion");
  await expect(page.getByRole("heading", { name: title })).toHaveCount(0);

  const publish = await context.request.post(`${endpoint}/${row.id}/publish`, { headers: auth, data: { version: row.version } });
  expect(publish.status()).toBe(200);
  await page.reload();
  const entry = page.getByRole("article").filter({ has: page.getByRole("heading", { name: title }) });
  await expect(entry).toBeVisible();
  await expect(entry.getByRole("link", { name: "Consultar cursos", exact: false })).toHaveAttribute("href", /wa\.me/);

  const withdraw = await context.request.post(`${endpoint}/${row.id}/withdraw`, {
    headers: auth, data: { version: (await publish.json()).version },
  });
  expect(withdraw.status()).toBe(200);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Formación presencial" })).toBeVisible();
  await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
});
