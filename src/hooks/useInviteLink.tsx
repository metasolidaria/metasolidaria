import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface InviteInfo {
  groupId: string;
  groupName: string;
  inviteCode: string;
}

export const useInviteLink = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);

  const inviteCode = searchParams.get("invite");

  // Fetch invite info when code is detected
  const { data: fetchedInviteInfo, isLoading: inviteInfoLoading } = useQuery({
    queryKey: ["inviteInfo", inviteCode],
    queryFn: async () => {
      if (!inviteCode) return null;

      // Fetch invitation with group info
      const { data, error } = await supabase
        .from("group_invitations")
        .select("group_id, invite_code, groups:group_id(name)")
        .eq("invite_code", inviteCode)
        .eq("status", "pending")
        .eq("invite_type", "link")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle() as { data: any, error: any };

      if (error || !data) return null;

      return {
        groupId: data.group_id,
        groupName: data.groups?.name || "Grupo",
        inviteCode: data.invite_code,
      } as InviteInfo;
    },
    enabled: !!inviteCode,
  });

  // Store invite info when fetched
  useEffect(() => {
    if (fetchedInviteInfo && inviteCode) {
      setInviteInfo(fetchedInviteInfo);
      setPendingInviteCode(inviteCode);
      // Clean up URL
      searchParams.delete("invite");
      setSearchParams(searchParams, { replace: true });
    }
  }, [fetchedInviteInfo, inviteCode, searchParams, setSearchParams]);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userMemberships"] });
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
      
      toast({
        title: "Você entrou no grupo! 🎉",
        description: `Bem-vindo ao grupo ${inviteInfo?.groupName || ""}!`,
      });

      // Navigate to the group page
      if (inviteInfo?.groupId) {
        navigate(`/grupo/${inviteInfo.groupId}`);
      }
      
      setPendingInviteCode(null);
      setInviteInfo(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao aceitar convite",
        description: error.message,
        variant: "destructive",
      });
      setPendingInviteCode(null);
      setInviteInfo(null);
    },
  });

  // Auto-accept invitation when user is logged in and has pending invite
  useEffect(() => {
    if (!authLoading && user && pendingInviteCode && inviteInfo && !acceptLinkInvitation.isPending) {
      acceptLinkInvitation.mutate(pendingInviteCode);
    }
  }, [authLoading, user, pendingInviteCode, inviteInfo, acceptLinkInvitation.isPending]);

  return {
    pendingInviteCode,
    inviteInfo,
    isLoading: inviteInfoLoading,
    isAccepting: acceptLinkInvitation.isPending,
    needsAuth: !authLoading && !user && !!pendingInviteCode && !!inviteInfo,
    acceptInvitation: acceptLinkInvitation.mutate,
  };
};
