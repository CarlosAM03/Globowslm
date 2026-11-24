import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "login.spec.ts",
  workers: 1,
  forbidOnly: true,
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3100", trace: "off" },
  webServer: {
    cwd: process.cwd(),
    command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
