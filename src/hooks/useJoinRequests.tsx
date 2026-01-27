import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  message: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

export const useJoinRequests = (groupId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending requests for a group (for leaders)
  const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["joinRequests", groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from("group_join_requests")
        .select("*")
        .eq("group_id", groupId)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as JoinRequest[];
    },
    enabled: !!groupId && !!user,
  });

  // Check if current user has a pending request for this group
  const { data: userRequest, isLoading: userRequestLoading } = useQuery({
    queryKey: ["userJoinRequest", groupId, user?.id],
    queryFn: async () => {
      if (!groupId || !user) return null;

      const { data, error } = await supabase
        .from("group_join_requests")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as JoinRequest | null;
    },
    enabled: !!groupId && !!user,
  });

  // Create join request
  const createRequest = useMutation({
    mutationFn: async ({ groupId, message }: { groupId: string; message?: string }) => {
      if (!user) throw new Error("Você precisa estar logado");

      // Get user name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const userName = profile?.full_name || user.email?.split("@")[0] || "Usuário";

      const { data, error } = await supabase
        .from("group_join_requests")
        .insert([{
          group_id: groupId,
          user_id: user.id,
          user_name: userName,
          message: message || null,
        }])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Você já enviou uma solicitação para este grupo");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userJoinRequest", groupId] });
      toast({
        title: "Solicitação enviada! 📨",
        description: "O líder do grupo será notificado da sua solicitação.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve request
  const approveRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .rpc("approve_join_request", { _request_id: requestId });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinRequests", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Solicitação aprovada! ✅",
        description: "O usuário agora é membro do grupo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao aprovar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject request
  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .rpc("reject_join_request", { _request_id: requestId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinRequests", groupId] });
      toast({
        title: "Solicitação recusada",
        description: "A solicitação foi recusada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao recusar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    pendingRequests: pendingRequests || [],
    userRequest,
    isLoading: requestsLoading || userRequestLoading,
    createRequest,
    approveRequest,
    rejectRequest,
  };
};
