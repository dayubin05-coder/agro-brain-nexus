import type { ZodSchema } from "zod";
import { toast } from "@/hooks/use-toast";

/**
 * Valida `data` contra um schema Zod. Em caso de erro, dispara um toast
 * com a primeira mensagem e retorna `null`. Em sucesso retorna os dados
 * já parseados (com coerções).
 */
export function validateOrToast<T>(schema: ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.errors[0];
    toast({
      title: "Dados inválidos",
      description: first?.message || "Verifique os campos do formulário.",
      variant: "destructive",
    });
    return null;
  }
  return result.data;
}
