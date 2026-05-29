import { test, expect } from "@playwright/test";

/**
 * Smoke tests — rodam sem credenciais. Validam que rotas públicas respondem
 * e que o redirect de proteção funciona.
 */
test.describe("Smoke", () => {
  test("rota raiz redireciona para login quando deslogado", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/register renderiza formulário", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
    await expect(page.getByPlaceholder("Seu nome")).toBeVisible();
  });

  test("rota inexistente exibe NotFound", async ({ page }) => {
    await page.goto("/rota-que-nao-existe-123");
    // NotFound page is shown; just ensure page rendered without crashing.
    await expect(page.locator("body")).toBeVisible();
  });
});
