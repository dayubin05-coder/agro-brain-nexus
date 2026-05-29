# Testes E2E — Playwright

## Setup (uma vez)

```bash
bunx playwright install --with-deps chromium
```

## Variáveis de ambiente

Crie `.env.e2e` ou exporte no shell:

```
E2E_BASE_URL=http://localhost:8080
E2E_USER_EMAIL=seu-usuario-teste@exemplo.com
E2E_USER_PASSWORD=sua-senha
```

> O usuário de teste precisa existir no Lovable Cloud e ter o email confirmado.
> Sem essas variáveis os testes autenticados (`fazendas.spec.ts`) são **skipados** —
> apenas o `smoke.spec.ts` e `auth.spec.ts` rodam.

## Rodar

```bash
bun run test:e2e         # headless, todos os projetos
bun run test:e2e:ui      # modo interativo
bun run test:e2e:report  # abre último relatório HTML
```

O Playwright sobe o `bun run dev` automaticamente (porta 8080).
Para usar um servidor já rodando: `E2E_NO_SERVER=1 bun run test:e2e`.

## Estrutura

- `fixtures.ts` — fixture `authedPage` (faz login antes de cada teste)
- `smoke.spec.ts` — rotas públicas, redirects, NotFound
- `auth.spec.ts` — login, validação de credenciais, navegação para cadastro
- `fazendas.spec.ts` — fluxo autenticado (skipado sem credenciais)

## CI

Em CI, defina os secrets `E2E_USER_EMAIL` e `E2E_USER_PASSWORD` e rode
`bun run test:e2e`. Retries (2x) e screenshots/vídeos são ativados automaticamente
em falha.
