import { expect, test } from "@playwright/test";

test("blog offers a public empty state and keeps unpublished routes private", async ({ page, request }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog de Globows LM" })).toBeVisible();
  await expect(page.getByText("Aún no hay publicaciones para esta vista.")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.goto("/blog/unpublished-fixture");
  await expect(page.getByRole("heading", { name: "Publicación no encontrada" })).toBeVisible();
  expect((await request.get("/api/cms/admin/content/post")).status()).toBe(401);
  expect((await request.get("/api/cms/public/media/invalid-fixture")).status()).toBe(404);
});
