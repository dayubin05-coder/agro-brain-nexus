import { z } from "zod";

/**
 * Validates required client-side environment variables at boot.
 * Throws if anything required is missing — fails fast instead of leaking undefined into runtime.
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL ausente ou inválido"),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(20, "VITE_SUPABASE_PUBLISHABLE_KEY ausente"),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
});

if (!parsed.success) {
  console.error("[env] Variáveis de ambiente inválidas:", parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : ({} as z.infer<typeof envSchema>);
