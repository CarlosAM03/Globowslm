import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "roles.release.ts",
  workers: 1,
  forbidOnly: true,
  use: { ...devices["Desktop Chrome"], baseURL: "http://web:3100", trace: "off", screenshot: "off" },
});
