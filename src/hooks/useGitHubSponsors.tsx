import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GitHubSponsor {
  id: string;
  github_login: string;
  github_name: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  tier_name: string | null;
  tier_monthly_price: number | null;
  is_active: boolean;
}

export const useGitHubSponsors = () => {
  return useQuery({
    queryKey: ["github-sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("github_sponsors")
        .select("*")
        .eq("is_active", true)
        .order("tier_monthly_price", { ascending: false });

      if (error) throw error;
      return data as GitHubSponsor[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
