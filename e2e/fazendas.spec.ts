import { test, expect } from "./fixtures";

test.describe("Fluxo de Fazendas (requer usuário de teste)", () => {
  test.skip(
    !process.env.E2E_USER_EMAIL,
    "Defina E2E_USER_EMAIL/E2E_USER_PASSWORD para rodar fluxos autenticados",
  );

  test("dashboard carrega após login", async ({ authedPage: page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    // Dashboard tem cards de métricas
    await expect(page.locator("body")).toBeVisible();
  });

  test("navega até a página de fazendas", async ({ authedPage: page }) => {
    await page.goto("/fazendas");
    await expect(page).toHaveURL(/\/fazendas/);
    await expect(page.getByRole("heading", { name: /fazendas/i }).first()).toBeVisible();
  });

  test("navega até plantio", async ({ authedPage: page }) => {
    await page.goto("/plantio");
    await expect(page).toHaveURL(/\/plantio/);
  });
});
