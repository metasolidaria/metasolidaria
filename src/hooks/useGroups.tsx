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
  updated_at?: string;
  is_private: boolean;
  leader_name?: string;
  leader_whatsapp?: string; // Only available for group members/leaders
  description?: string;
  member_count?: number;
  total_goals?: number;
  total_donations?: number;
  image_url?: string | null;
}

// Type for public view (without sensitive data)
interface GroupPublic {
  id: string;
  name: string;
  city: string;
  donation_type: string;
  goal_2026: number;
  leader_id: string;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  leader_name: string | null;
  description: string | null;
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

  // Query to get user's current memberships
  const { data: userMemberships } = useQuery({
    queryKey: ["userMemberships"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data?.map(m => m.group_id) || [];
    },
  });

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    staleTime: 0,
    queryFn: async () => {
      // Use the public view that includes member counts, goals and donations
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups_public" as any)
        .select("*")
        .order("created_at", { ascending: false }) as { data: any[] | null, error: any };

      if (groupsError) throw groupsError;

      // Map view data to Group interface
      return (groupsData || []).map((group: any) => ({
        id: group.id,
        name: group.name,
        city: group.city,
        donation_type: group.donation_type,
        goal_2026: group.goal_2026,
        leader_id: group.leader_id,
        created_at: group.created_at,
        updated_at: group.updated_at,
        is_private: group.is_private,
        leader_name: group.leader_name || "Líder",
        description: group.description,
        member_count: group.member_count || 0,
        total_goals: group.total_goals || 0,
        total_donations: group.total_donations || 0,
        image_url: group.image_url || null,
      } as Group));
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
      leader_name?: string;
      leader_whatsapp?: string;
      description?: string;
      end_date?: string;
      entity_id?: string | null;
    }) => {
      // Usar função SECURITY DEFINER que cria grupo E adiciona líder como membro
      const { data, error } = await supabase.rpc('create_group_with_leader', {
        _name: newGroup.name,
        _city: newGroup.city,
        _donation_type: newGroup.donation_type,
        _goal_2026: newGroup.goal_2026,
        _is_private: newGroup.is_private || false,
        _leader_name: newGroup.leader_name || 'Líder',
        _leader_whatsapp: newGroup.leader_whatsapp || '',
        _description: newGroup.description || '',
        _end_date: newGroup.end_date || '2026-12-31',
        _entity_id: newGroup.entity_id || null,
      });

      if (error) throw error;

      return { id: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["userMemberships"] });
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
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

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMember) {
        throw new Error("Você já é membro deste grupo");
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
      queryClient.invalidateQueries({ queryKey: ["userMemberships"] });
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
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

      // Use secure database function to accept invitation
      // This prevents email enumeration and handles all validation server-side
      const { data, error } = await supabase
        .rpc('accept_group_invitation', { _invite_code: inviteCode });

      if (error) {
        // Map database errors to user-friendly messages
        if (error.message.includes('not found or expired')) {
          throw new Error("Convite inválido ou expirado");
        }
        if (error.message.includes('different email')) {
          throw new Error("Este convite foi enviado para outro email");
        }
        if (error.message.includes('already a member')) {
          throw new Error("Você já é membro deste grupo");
        }
        throw error;
      }
      
      return { id: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["impactStats"] });
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
    userMemberships: userMemberships || [],
  };
};
