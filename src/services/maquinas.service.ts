import { supabase } from "@/integrations/supabase/client";

export interface MaquinaInput {
  fazenda_id?: string;
  nome: string;
  tipo?: string | null;
  modelo?: string | null;
  ano?: string | number | null;
  status?: string;
  horas_uso?: string | number;
  combustivel_percentual?: string | number | null;
  proxima_manutencao?: string | null;
}

export const maquinasService = {
  listByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("maquinas")
      .select("*, fazendas!inner(user_id, nome)")
      .eq("fazendas.user_id", userId)
      .order("nome");
    if (error) throw error;
    return data;
  },
  create: async (f: MaquinaInput) => {
    const { error } = await supabase.from("maquinas").insert([
      {
        fazenda_id: f.fazenda_id!,
        nome: String(f.nome).trim(),
        tipo: f.tipo || null,
        modelo: f.modelo || null,
        ano: f.ano ? Number(f.ano) : null,
        status: f.status ?? "parada",
        horas_uso: f.horas_uso ? Number(f.horas_uso) : 0,
        combustivel_percentual: f.combustivel_percentual ? Number(f.combustivel_percentual) : null,
        proxima_manutencao: f.proxima_manutencao || null,
      },
    ]);
    if (error) throw error;
  },
  update: async (id: string, item: MaquinaInput) => {
    const { error } = await supabase
      .from("maquinas")
      .update({
        nome: String(item.nome).trim(),
        tipo: item.tipo || null,
        modelo: item.modelo || null,
        ano: item.ano ? Number(item.ano) : null,
        status: item.status,
        horas_uso: item.horas_uso ? Number(item.horas_uso) : 0,
        combustivel_percentual: item.combustivel_percentual ? Number(item.combustivel_percentual) : null,
        proxima_manutencao: item.proxima_manutencao || null,
      })
      .eq("id", id);
    if (error) throw error;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("maquinas").delete().eq("id", id);
    if (error) throw error;
  },
};
