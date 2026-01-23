import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HeroStatsRow {
  total_groups: number;
  total_users: number;
  total_goals: number;
}

export const useHeroStats = () => {
  return useQuery({
    queryKey: ["heroStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_stats_public")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching hero stats:", error);
        throw error;
      }

      return {
        totalGroups: Number((data as HeroStatsRow)?.total_groups) || 0,
        totalUsers: Number((data as HeroStatsRow)?.total_users) || 0,
        totalGoals: Number((data as HeroStatsRow)?.total_goals) || 0,
      };
    },
  });
};
