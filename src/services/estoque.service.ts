import { supabase } from "@/integrations/supabase/client";

export interface EstoqueInput {
  fazenda_id?: string;
  nome: string;
  categoria?: string | null;
  quantidade: number | string;
  unidade: string;
  quantidade_minima?: number | string | null;
  valor_unitario?: number | string | null;
}

export const estoqueService = {
  listByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("estoque")
      .select("*, fazendas!inner(user_id, nome)")
      .eq("fazendas.user_id", userId)
      .order("nome");
    if (error) throw error;
    return data;
  },
  create: async (f: EstoqueInput) => {
    const { error } = await supabase.from("estoque").insert([
      {
        fazenda_id: f.fazenda_id!,
        nome: String(f.nome).trim(),
        categoria: f.categoria || null,
        quantidade: Number(f.quantidade),
        unidade: f.unidade,
        quantidade_minima: f.quantidade_minima ? Number(f.quantidade_minima) : null,
        valor_unitario: f.valor_unitario ? Number(f.valor_unitario) : null,
        data_entrada: new Date().toISOString().split("T")[0],
      },
    ]);
    if (error) throw error;
  },
  update: async (id: string, item: EstoqueInput) => {
    const { error } = await supabase
      .from("estoque")
      .update({
        nome: String(item.nome).trim(),
        categoria: item.categoria || null,
        quantidade: Number(item.quantidade),
        unidade: item.unidade,
        quantidade_minima: item.quantidade_minima ? Number(item.quantidade_minima) : null,
        valor_unitario: item.valor_unitario ? Number(item.valor_unitario) : null,
      })
      .eq("id", id);
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("estoque").delete().eq("id", id);
    if (error) throw error;
  },
};
