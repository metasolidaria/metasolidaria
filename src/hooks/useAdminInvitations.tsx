import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminInvitation {
  id: string;
  group_id: string;
  group_name: string;
  invite_code: string;
  invite_type: string;
  email: string | null;
  status: string;
  created_at: string;
  expires_at: string;
  invited_by: string;
  invited_by_name: string;
}

export interface InvitationStats {
  total_invitations: number;
  pending_invitations: number;
  accepted_invitations: number;
  expired_invitations: number;
  acceptance_rate: number;
}

export const useAdminInvitations = () => {
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["adminInvitations"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_invitations");
      if (error) throw error;
      return data as AdminInvitation[];
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["invitationStats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_invitation_stats");
      if (error) throw error;
      return (data as InvitationStats[])?.[0] || null;
    },
  });

  const renewInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.rpc("renew_invitation", {
        _invitation_id: invitationId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInvitations"] });
      queryClient.invalidateQueries({ queryKey: ["invitationStats"] });
      toast.success("Convite renovado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao renovar convite: ${error.message}`);
    },
  });

  const revokeInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.rpc("revoke_invitation", {
        _invitation_id: invitationId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInvitations"] });
      queryClient.invalidateQueries({ queryKey: ["invitationStats"] });
      toast.success("Convite revogado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao revogar convite: ${error.message}`);
    },
  });

  return {
    invitations,
    stats,
    isLoading,
    statsLoading,
    renewInvitation,
    revokeInvitation,
  };
};
