import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useImpactStats = () => {
  return useQuery({
    queryKey: ["impactStats"],
    queryFn: async () => {
      // Buscar total de grupos
      const { count: totalGroups } = await supabase
        .from("groups")
        .select("*", { count: "exact", head: true });

      // Buscar total de participantes únicos
      const { count: totalParticipants } = await supabase
        .from("group_members")
        .select("user_id", { count: "exact", head: true });

      // Buscar total de doações/registros
      const { count: totalDonations } = await supabase
        .from("goal_progress")
        .select("*", { count: "exact", head: true });

      // Buscar soma total das metas alcançadas
      const { data: progressData } = await supabase
        .from("goal_progress")
        .select("amount");

      const totalGoalsReached =
        progressData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      return {
        participants: totalParticipants || 0,
        goalsReached: Math.round(totalGoalsReached),
        donations: totalDonations || 0,
        groups: totalGroups || 0,
      };
    },
  });
};
