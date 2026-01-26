import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin, isLoading: queryLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase.rpc("is_admin", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }

      return data === true;
    },
    enabled: !!user?.id,
  });

  // Consider loading if auth is loading OR if we have a user but query is still loading
  const isLoading = authLoading || (!!user?.id && queryLoading);

  return {
    // Only return false if we're done loading AND confirmed not admin
    // Return undefined while still loading to prevent premature redirects
    isAdmin: isLoading ? undefined : (isAdmin ?? false),
    isLoading,
  };
};
