import { toast } from "@/hooks/use-toast";
import { ZodError } from "zod";

/**
 * Maps any thrown value to a user-friendly Portuguese message.
 * Internal details (stack, DB error codes) are logged but NEVER shown to users.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "Ocorreu um erro inesperado.";

  if (error instanceof ZodError) {
    const first = error.issues[0];
    return first?.message ?? "Dados inválidos.";
  }

  // Supabase / PostgREST errors
  const anyErr = error as any;
  const code: string | undefined = anyErr?.code;
  const msg: string | undefined = anyErr?.message;

  if (code === "23505") return "Já existe um registro com esses dados.";
  if (code === "23503") return "Operação inválida: existe um vínculo com outro registro.";
  if (code === "23502") return "Preencha todos os campos obrigatórios.";
  if (code === "42501" || code === "PGRST301") return "Você não tem permissão para esta ação.";
  if (code === "PGRST116") return "Registro não encontrado.";
  if (msg?.toLowerCase().includes("jwt")) return "Sessão expirada. Faça login novamente.";
  if (msg?.toLowerCase().includes("network")) return "Falha de conexão. Tente novamente.";

  if (typeof msg === "string" && msg.length > 0 && msg.length < 200) return msg;
  if (typeof error === "string") return error;

  return "Ocorreu um erro inesperado. Tente novamente.";
}

/**
 * Standardized error handler. Logs the raw error for debugging
 * and surfaces a friendly toast to the user.
 */
export function handleError(error: unknown, context?: string) {
  if (context) console.error(`[${context}]`, error);
  else console.error(error);

  toast({
    variant: "destructive",
    title: "Erro",
    description: getErrorMessage(error),
  });
}

/**
 * Wraps an async operation, surfacing errors via toast and rethrowing.
 * Useful inside mutationFn / event handlers when you still want callers to react.
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    handleError(err, context);
    throw err;
  }
}
