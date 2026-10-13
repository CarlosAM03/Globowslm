import { expect, test } from "@playwright/test";

test("institutional page is Spanish, semantic and self-hosted", async ({ page }) => {
  const errors: string[] = [];
  const remoteRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (!request.url().startsWith("http://127.0.0.1:3100")) remoteRequests.push(request.url()); });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page).toHaveTitle(/Globows LM by Licey Márquez/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Creamos experiencias memorables.");
  await expect(page.locator("#inicio img")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByText("Un emprendimiento iniciado en casa", { exact: false })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily)).toContain("manrope");
  expect(errors).toEqual([]);
  expect(remoteRequests).toEqual([]);
});

test("desktop navigation resolves to existing sections", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const links = page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link");
  for (const link of await links.all()) {
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^#[\w-]+$/);
    await expect(page.locator(href!)).toHaveCount(1);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  }
});

test("mobile menu supports keyboard, Escape, focus return and link closing", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const trigger = page.locator('button[aria-controls="mobile-navigation"]');
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("navigation", { name: "Navegación móvil" }).getByRole("link", { name: "Inicio", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await page.getByRole("navigation", { name: "Navegación móvil" }).getByRole("link", { name: "Sobre Licey" }).click();
  await expect(page).toHaveURL(/#sobre-licey$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

for (const width of [320, 375, 390, 428, 640, 768, 1024, 1280, 1440]) {
  test(`responsive layout and images at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    // Trigger lazy images throughout the page before validating and capturing.
    for (const img of await page.locator("main img").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBeTruthy();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const action of await page.locator("main .button, header a, header button, footer a, .floating-trigger").all()) {
      if (await action.isVisible()) expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: testInfo.outputPath(`landing-${width}.png`), fullPage: true });
  });
}

test("reduced motion disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.locator("html").evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe("auto");
});

test("five services disclose missing commercial assets and do not invent recipients", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator(".service-card");
  await expect(cards).toHaveCount(5);
  for (const name of ["Decoraciones profesionales", "Cursos presenciales", "Talleres intensivos", "Certificaciones", "Asesorías"]) {
    const card = cards.filter({ has: page.getByRole("heading", { name, exact: true }) });
    await expect(card.locator(".service-body > p")).not.toBeEmpty();
    await expect(card.getByRole("button")).toBeDisabled();
    await expect(card.getByRole("button")).toHaveAttribute("aria-describedby", "contact-channel-status");
    expect(await card.locator("img, .service-image--pending").count()).toBe(1);
  }
  await expect(page.locator('.service-image--pending')).toHaveCount(4);
  await expect(page.locator('a[href*="wa.me"], a[href*="api.whatsapp"]')).toHaveCount(0);
});

test("gallery filters match categories and work by keyboard on mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#galeria");
  const filters = page.getByRole("group", { name: "Filtrar decoraciones por categoría" });
  await expect(page.locator("#gallery-results figure")).toHaveCount(3);
  for (const [label, category] of [["Baby Shower", "baby-shower"], ["XV años", "xv-anos"], ["Decoraciones temáticas", "tematicas"]]) {
    const button = filters.getByRole("button", { name: label, exact: true });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(filters.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator("#gallery-results figure")).toHaveCount(1);
    await expect(page.locator("#gallery-results figure")).toHaveAttribute("data-category", category);
    await expect(page.getByRole("status")).toContainText("1 decoración");
  }
  await page.locator("#galeria").screenshot({ path: testInfo.outputPath("gallery-filter-mobile.png") });
  await filters.getByRole("button", { name: "Todas", exact: true }).click();
  await expect(page.locator("#gallery-results figure")).toHaveCount(3);
  await expect(page.locator('#galeria img[src*="curso"], #galeria img[src*="8marzo"]')).toHaveCount(0);
});

test("mobile disclosure and skip link have visible keyboard focus", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.locator('button[aria-controls="mobile-navigation"]').focus();
  await page.keyboard.press("Enter");
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
  const galleryLink = page.getByRole("navigation", { name: "Navegación móvil" }).getByRole("link", { name: "Galería" });
  await expect(galleryLink).toBeFocused();
  expect(await galleryLink.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
  await page.screenshot({ path: testInfo.outputPath("mobile-menu-320.png"), fullPage: false });
});

test("complete landing navigation has no broken anchors or sticky header obstruction", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const id of ["inicio", "sobre-licey", "servicios", "galeria", "formacion", "certificaciones", "contacto"]) await expect(page.locator(`section#${id}`)).toHaveCount(1);
  for (const link of await page.locator('a[href^="#"]').all()) {
    const href = await link.getAttribute("href");
    await expect(page.locator(href!)).toHaveCount(1);
  }
  for (const name of ["Formación", "Certificaciones", "Contacto"]) {
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name, exact: true }).click();
    const href = await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name, exact: true }).getAttribute("href");
    const title = page.locator(`${href} h2`).first();
    expect((await title.boundingBox())!.y).toBeGreaterThanOrEqual((await page.locator("header").boundingBox())!.height);
  }
  await expect(page.locator('#faq, #confianza')).toHaveCount(0);
  await page.locator('#inicio .button').first().click();
  await expect(page).toHaveURL(/#contacto$/);
});

test("formation is contextual and does not claim unverified teaching or schedules", async ({ page }) => {
  await page.goto("/#formacion");
  await expect(page.locator("#formacion .training-card")).toHaveCount(4);
  await expect(page.locator("#formacion img")).toHaveCount(1);
  await expect(page.locator("#formacion figcaption")).toContainText("no acredita docencia");
  await expect(page.locator("#formacion")).toContainText("temarios, fechas");
  for (const button of await page.locator("#formacion .button").all()) await expect(button).toBeDisabled();
  await expect(page.locator("#formacion")).not.toContainText("8marzo");
});

test("certifications disclose absent verified credentials without fictional timeline entries", async ({ page }) => {
  await page.goto("/#certificaciones");
  await expect(page.getByRole("heading", { name: "Credenciales en validación" })).toBeVisible();
  await expect(page.locator(".certification-card, .timeline-controls")).toHaveCount(0);
  await expect(page.locator("#certificaciones img")).toHaveCount(0);
});

test("contact and footer share five controlled channels with no fictitious destinations", async ({ page }) => {
  await page.goto("/#contacto");
  for (const scope of [page.locator("#contacto"), page.locator("footer")]) {
    await expect(scope.locator(".contact-channels li")).toHaveCount(5);
    for (const button of await scope.locator(".contact-channels button").all()) await expect(button).toBeDisabled();
  }
  await expect(page.locator('#contacto')).toContainText("Teléfono oficial pendiente");
  await expect(page.locator('a[href^="https://wa.me"], a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Navegación del pie de página" }).getByRole("link")).toHaveCount(7);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('form')).toHaveCount(0);
});

test("floating menu supports keyboard, Escape and outside closing with controlled channels", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const trigger = page.locator('button[aria-controls="floating-contact-panel"]');
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const panel = page.getByRole("region", { name: "Contacto rápido" });
  await expect(panel.locator(".contact-channels li")).toHaveCount(5);
  for (const button of await panel.locator(".contact-channels button").all()) await expect(button).toBeDisabled();
  const box = (await panel.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(375);
  expect(box.y).toBeGreaterThanOrEqual(0);
  await page.screenshot({ path: testInfo.outputPath("floating-menu-375.png") });
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await page.locator(".brand-link").click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.locator('button[aria-controls="mobile-navigation"]').click();
  await trigger.click();
  await expect(page.locator('button[aria-controls="mobile-navigation"]')).toHaveAttribute("aria-expanded", "false");
});

test("Hero is photographic background with readable editorial overlay, not a two-column card", async ({ page }) => {
  await page.goto("/");
  const image = page.locator("#inicio > img");
  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute("fetchpriority", "high");
  expect(await image.evaluate((element) => getComputedStyle(element).position)).toBe("absolute");
  await expect(page.locator("#inicio .hero-subtitle")).toBeVisible();
  await expect(page.locator("#inicio figure, #inicio .hero-grid")).toHaveCount(0);
});
