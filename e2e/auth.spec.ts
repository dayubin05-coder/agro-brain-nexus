import { test, expect } from "./fixtures";

test.describe("Autenticação", () => {
  test("exibe a tela de login para usuário não autenticado", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/login/);
    await expect(page.getByRole("heading", { name: /bem-vindo/i })).toBeVisible();
  });

  test("rejeita credenciais inválidas", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("seu@email.com").fill("invalido@example.com");
    await page.getByPlaceholder("••••••••").fill("senhaerrada");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("navega para cadastro e recuperação de senha", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /cadastre-se/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
  });
});
