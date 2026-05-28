import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./use-current-user";

export function useUserFazendas() {
  const { data: userData } = useCurrentUser();

  const { data: fazendas, isLoading } = useQuery({
    queryKey: ["user-fazendas", userData?.id],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fazendas")
        .select("id, nome")
        .eq("user_id", userData!.id)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  return { userData, fazendas: fazendas || [], isLoading };
}
