import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useIsAdmin = () => {
  const { user } = useAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user?.email) return false;

      // Use the is_admin database function directly via RPC
      // This avoids issues with RLS on admin_emails table (only admins can read it)
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

  return {
    isAdmin: isLoading ? undefined : (isAdmin ?? false),
    isLoading,
  };
};
