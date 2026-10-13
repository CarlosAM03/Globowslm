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

for (const width of [320, 375, 390, 428, 768, 1024, 1440]) {
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
    for (const action of await page.locator("main .button, header a, header button").all()) {
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
