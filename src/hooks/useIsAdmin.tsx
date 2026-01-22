import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useIsAdmin = () => {
  const { user } = useAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user?.email) return false;

      const { data, error } = await supabase
        .from("admin_emails")
        .select("id")
        .eq("email", user.email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id,
  });

  return {
    isAdmin: isAdmin ?? false,
    isLoading,
  };
};
