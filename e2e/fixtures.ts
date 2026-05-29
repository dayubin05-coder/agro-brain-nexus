import { test as base, expect, Page } from "@playwright/test";

export const TEST_USER = {
  email: process.env.E2E_USER_EMAIL ?? "test@agrotech.dev",
  password: process.env.E2E_USER_PASSWORD ?? "Test1234!",
};

/**
 * Login via UI. Reused across tests.
 * Persists storage state so subsequent navigations skip the login screen.
 */
export async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("seu@email.com").fill(TEST_USER.email);
  await page.getByPlaceholder("••••••••").fill(TEST_USER.password);
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 15_000,
  });
}

type Fixtures = {
  authedPage: Page;
};

export const test = base.extend<Fixtures>({
  authedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});

export { expect };
