import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for AgroTech.
 *
 * Run locally:
 *   bun run test:e2e          # headless
 *   bun run test:e2e:ui       # interactive UI
 *
 * On first run install browsers: `bunx playwright install --with-deps chromium`
 *
 * Env vars (set in .env.e2e or shell):
 *   E2E_BASE_URL       default http://localhost:8080
 *   E2E_USER_EMAIL     test user email (must exist)
 *   E2E_USER_PASSWORD  test user password
 */
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8080";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: "bun run dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
