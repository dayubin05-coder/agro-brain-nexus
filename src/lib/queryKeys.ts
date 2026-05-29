/**
 * Centralized query keys factory.
 * Keep prefixes stable so partial-match invalidations work across the app.
 */
export const qk = {
  fazendas: (userId?: string) => ["fazendas", userId] as const,
  talhoes: (farmId: string) => ["talhoes", farmId] as const,
  talhoesDisponiveis: (userId?: string) => ["talhoes-disponiveis", userId] as const,
  culturas: () => ["culturas"] as const,
  plantios: (userId?: string) => ["plantios", userId] as const,
  estoque: (userId?: string) => ["estoque-real", userId] as const,
  financeiro: (userId?: string) => ["financeiro-real", userId] as const,
  maquinas: (userId?: string) => ["maquinas-real", userId] as const,
  funcionarios: (userId?: string) => ["funcionarios-real", userId] as const,
  pragas: (userId?: string) => ["pragas-real", userId] as const,
  sustentabilidade: () => ["sustentabilidade"] as const,
  profile: (userId?: string) => ["profile", userId] as const,
  notifications: () => ["notifications"] as const,
};
