import { supabase } from "@/integrations/supabase/client";

export interface FinanceiroInput {
  fazenda_id?: string;
  descricao: string;
  valor: number | string;
  tipo: string;
  data: string;
  categoria?: string | null;
}

export const financeiroService = {
  listByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("transacoes_financeiras")
      .select("*, fazendas!inner(user_id, nome)")
      .eq("fazendas.user_id", userId)
      .order("data", { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (f: FinanceiroInput) => {
    const { error } = await supabase.from("transacoes_financeiras").insert([
      {
        fazenda_id: f.fazenda_id!,
        descricao: String(f.descricao).trim(),
        valor: Number(f.valor),
        tipo: f.tipo,
        data: f.data,
        categoria: f.categoria || null,
      },
    ]);
    if (error) throw error;
  },
  update: async (id: string, item: FinanceiroInput) => {
    const { error } = await supabase
      .from("transacoes_financeiras")
      .update({
        descricao: String(item.descricao).trim(),
        valor: Number(item.valor),
        tipo: item.tipo,
        data: item.data,
        categoria: item.categoria || null,
      })
      .eq("id", id);
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("transacoes_financeiras").delete().eq("id", id);
    if (error) throw error;
  },
};
