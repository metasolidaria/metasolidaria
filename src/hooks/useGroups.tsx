import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Group {
  id: string;
  name: string;
  city: string;
  donation_type: string;
  goal_2026: number;
  leader_id: string;
  created_at: string;
  is_private: boolean;
  member_count?: number;
  goals_reached?: number;
  leader_name?: string;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  email: string;
  invite_code: string;
  invited_by: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export const useGroups = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (groupsError) throw groupsError;

      // Get member counts and goals reached for each group
      const groupsWithStats = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count: memberCount } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          const { data: members } = await supabase
            .from("group_members")
            .select("goals_reached")
            .eq("group_id", group.id);

          const goalsReached = members?.reduce((sum, m) => sum + (m.goals_reached || 0), 0) || 0;

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", group.leader_id)
            .maybeSingle();

          return {
            ...group,
            member_count: memberCount || 0,
            goals_reached: goalsReached,
            leader_name: profile?.full_name || "Líder",
          };
        })
      );

      return groupsWithStats as Group[];
    },
  });

  const createGroup = useMutation({
    mutationFn: async (newGroup: {
      name: string;
      city: string;
      donation_type: string;
      goal_2026: number;
      leader_id: string;
      is_private?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("groups")
        .insert([newGroup])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Grupo criado com sucesso! 🎉",
        description: "Seu grupo está pronto para receber participantes.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const joinGroup = useMutation({
    mutationFn: async ({ groupId, name }: { groupId: string; name: string }) => {
      // Get the authenticated user's ID from supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Você precisa estar logado para entrar em um grupo");
      }

      const { data, error } = await supabase
        .from("group_members")
        .insert([{ group_id: groupId, user_id: user.id, name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Você entrou no grupo! 🎉",
        description: "Agora você faz parte desta jornada solidária.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao entrar no grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const inviteToGroup = useMutation({
    mutationFn: async ({ groupId, email }: { groupId: string; email: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Você precisa estar logado para convidar membros");
      }

      const { data, error } = await supabase
        .from("group_invitations")
        .insert([{ 
          group_id: groupId, 
          email, 
          invited_by: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Convite enviado! 📧",
        description: "O convite foi registrado. Compartilhe o link com a pessoa.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const acceptInvitation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Você precisa estar logado para aceitar o convite");
      }

      // First get the invitation
      const { data: invitation, error: inviteError } = await supabase
        .from("group_invitations")
        .select("*")
        .eq("invite_code", inviteCode)
        .eq("status", "pending")
        .single();

      if (inviteError || !invitation) {
        throw new Error("Convite inválido ou expirado");
      }

      // Update invitation status
      await supabase
        .from("group_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      // Add user to group
      const { data, error } = await supabase
        .from("group_members")
        .insert([{ 
          group_id: invitation.group_id, 
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email || "Membro"
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Você entrou no grupo! 🎉",
        description: "Bem-vindo ao grupo privado!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao aceitar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    groups,
    isLoading,
    createGroup,
    joinGroup,
    inviteToGroup,
    acceptInvitation,
  };
};
