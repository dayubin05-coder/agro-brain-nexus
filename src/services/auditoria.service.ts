import { supabase } from "@/integrations/supabase/client";

export interface TableSecurityStatus {
  table_name: string;
  rls_enabled: boolean;
  policy_count: number;
  evaluation: "Conforme" | "Parcial" | "Vulnerável";
}

export const auditoriaService = {
  getTablesRlsStatus: async (): Promise<TableSecurityStatus[]> => {
    const { data, error } = await supabase.rpc("get_tables_rls_status");
    if (error) throw error;
    return (data ?? []) as TableSecurityStatus[];
  },
  listReports: async () => {
    const { data, error } = await supabase
      .from("security_audit_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
