import { supabase } from "@/integrations/supabase/client";

export interface FuncionarioInput {
  fazenda_id?: string;
  nome: string;
  cargo?: string | null;
  setor?: string | null;
  telefone?: string | null;
  data_admissao?: string | null;
  status?: string;
}

export const funcionariosService = {
  listByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("funcionarios")
      .select("*, fazendas!inner(user_id, nome)")
      .eq("fazendas.user_id", userId)
      .order("nome");
    if (error) throw error;
    return data;
  },
  create: async (f: FuncionarioInput) => {
    const { error } = await supabase.from("funcionarios").insert([
      {
        fazenda_id: f.fazenda_id!,
        nome: String(f.nome).trim(),
        cargo: f.cargo || null,
        setor: f.setor || null,
        telefone: f.telefone || null,
        data_admissao: f.data_admissao || null,
        status: f.status ?? "ativo",
      },
    ]);
    if (error) throw error;
  },
  update: async (id: string, item: FuncionarioInput) => {
    const { error } = await supabase
      .from("funcionarios")
      .update({
        nome: String(item.nome).trim(),
        cargo: item.cargo || null,
        setor: item.setor || null,
        telefone: item.telefone || null,
        data_admissao: item.data_admissao || null,
        status: item.status,
      })
      .eq("id", id);
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("funcionarios").delete().eq("id", id);
    if (error) throw error;
  },
};
