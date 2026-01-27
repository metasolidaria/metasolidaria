import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useInviteLink = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);

  const inviteCode = searchParams.get("invite");

  // Store invite code when detected
  useEffect(() => {
    if (inviteCode) {
      setPendingInviteCode(inviteCode);
      // Clean up URL
      searchParams.delete("invite");
      setSearchParams(searchParams, { replace: true });
    }
  }, [inviteCode, searchParams, setSearchParams]);

  const acceptLinkInvitation = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .rpc('accept_link_invitation', { _invite_code: code });

      if (error) {
        if (error.message.includes('not found or expired')) {
          throw new Error("Convite inválido ou expirado");
        }
        if (error.message.includes('already a member')) {
          throw new Error("Você já é membro deste grupo");
        }
        throw error;
      }
      
      return { memberId: data };
    },
    onSuccess: async (_, code) => {
      // Get group info to redirect
      const { data: invitation } = await supabase
        .from("group_invitations")
        .select("group_id")
        .eq("invite_code", code)
        .maybeSingle();

      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userMemberships"] });
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
      
      toast({
        title: "Você entrou no grupo! 🎉",
        description: "Bem-vindo ao grupo!",
      });

      if (invitation?.group_id) {
        navigate(`/grupo/${invitation.group_id}`);
      }
      
      setPendingInviteCode(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao aceitar convite",
        description: error.message,
        variant: "destructive",
      });
      setPendingInviteCode(null);
    },
  });

  // Auto-accept invitation when user is logged in and has pending invite
  useEffect(() => {
    if (!authLoading && user && pendingInviteCode && !acceptLinkInvitation.isPending) {
      acceptLinkInvitation.mutate(pendingInviteCode);
    }
  }, [authLoading, user, pendingInviteCode, acceptLinkInvitation.isPending]);

  return {
    pendingInviteCode,
    isAccepting: acceptLinkInvitation.isPending,
    needsAuth: !authLoading && !user && !!pendingInviteCode,
    acceptInvitation: acceptLinkInvitation.mutate,
  };
};
