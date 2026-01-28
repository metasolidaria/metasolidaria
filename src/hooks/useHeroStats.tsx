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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to prevent flickering
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
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
