/**
 * Base i18n minimalista (pt-BR único por enquanto).
 * Substitui strings hard-coded por chaves estáveis, abrindo caminho para
 * múltiplos locais no futuro sem reescrita.
 *
 * Uso:
 *   import { t } from "@/lib/i18n";
 *   t("common.save")
 *   t("auth.login.invalid")
 *   t("validation.required", { field: "Nome" })
 */

export type Locale = "pt-BR";

const dictionaries: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    // Common
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.edit": "Editar",
    "common.delete": "Excluir",
    "common.loading": "Carregando...",
    "common.search": "Buscar",
    "common.logout": "Sair",
    "common.profile": "Meu Perfil",
    "common.account": "Minha Conta",

    // Auth
    "auth.login.title": "Bem-vindo de volta",
    "auth.login.subtitle": "Acesse sua conta no AgroTech",
    "auth.login.submit": "Entrar",
    "auth.login.invalid": "Email ou senha incorretos",
    "auth.login.error": "Erro ao fazer login. Tente novamente.",
    "auth.register.title": "Criar Conta",
    "auth.register.submit": "Cadastrar",
    "auth.register.success": "Conta criada! Verifique seu email para confirmar o cadastro.",
    "auth.reset.success": "Email de recuperação enviado! Verifique sua caixa de entrada.",
    "auth.reset.error": "Erro ao enviar email de recuperação.",
    "auth.password.updated": "Senha atualizada com sucesso!",
    "auth.password.weak": "Senha deve ter ao menos 8 caracteres, com letras e números.",

    // Validation
    "validation.invalid": "Dados inválidos",
    "validation.required": "{field} é obrigatório",
    "validation.email": "E-mail inválido",

    // Offline
    "offline.title": "Sem conexão",
    "offline.body": "Suas alterações serão sincronizadas quando voltar online.",
  },
};

let currentLocale: Locale = "pt-BR";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = dictionaries[currentLocale];
  let s = dict[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}
