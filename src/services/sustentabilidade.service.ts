import { supabase } from "@/integrations/supabase/client";

export interface SustentabilidadeInput {
  fazenda_id?: string;
  categoria: string;
  indicador: string;
  valor: string | number;
  unidade: string;
  meta?: string | number | null;
  observacoes?: string | null;
}

export const sustentabilidadeService = {
  list: async () => {
    const { data, error } = await supabase
      .from("sustentabilidade_registros")
      .select("*, fazendas(nome)")
      .order("data", { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (f: SustentabilidadeInput) => {
    const { error } = await supabase.from("sustentabilidade_registros").insert([
      {
        fazenda_id: f.fazenda_id!,
        categoria: f.categoria,
        indicador: f.indicador,
        valor: Number(f.valor),
        unidade: f.unidade,
        meta: f.meta ? Number(f.meta) : null,
        observacoes: f.observacoes || null,
      },
    ]);
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("sustentabilidade_registros").delete().eq("id", id);
    if (error) throw error;
  },
};
