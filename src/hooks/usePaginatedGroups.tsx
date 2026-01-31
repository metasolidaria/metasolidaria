import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  leader_whatsapp?: string;
  description?: string;
  member_count?: number;
  total_goals?: number;
  total_donations?: number;
  image_url?: string | null;
  members_visible?: boolean;
}

interface UsePaginatedGroupsOptions {
  page: number;
  limit: number;
  filter: "all" | "mine";
  userMemberships: string[];
  membershipsLoading?: boolean;
}

export const usePaginatedGroups = ({ page, limit, filter, userMemberships, membershipsLoading }: UsePaginatedGroupsOptions) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["paginatedGroups", page, limit, filter, userMemberships, membershipsLoading],
    queryFn: async () => {
      // For "mine" filter
      if (filter === "mine") {
        // If still loading memberships, return empty but signal loading
        if (membershipsLoading) {
          return { groups: [], count: 0 };
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { groups: [], count: 0 };

        // Build query to include groups where user is leader OR member
        let query = supabase
          .from("groups_public" as any)
          .select("*", { count: "exact", head: false });

        if (userMemberships.length > 0) {
          // Leader OR member - use .or() filter
          query = query.or(`leader_id.eq.${user.id},id.in.(${userMemberships.join(',')})`);
        } else {
          // Only leader (no memberships yet or user only created groups)
          query = query.eq("leader_id", user.id);
        }

        const { data: groupsData, error, count } = await query
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1) as { data: any[] | null, error: any, count: number | null };

        if (error) throw error;

        const groups = (groupsData || []).map((group: any) => ({
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
          members_visible: group.members_visible !== false,
        } as Group));

        return { groups, count: count || 0 };
      }

      // For "all" filter
      const { data: groupsData, error, count } = await supabase
        .from("groups_public" as any)
        .select("*", { count: "exact", head: false })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1) as { data: any[] | null, error: any, count: number | null };

      if (error) throw error;

      const groups = (groupsData || []).map((group: any) => ({
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
        members_visible: group.members_visible !== false,
      } as Group));

      return { groups, count: count || 0 };
    },
  });

  const joinGroup = useMutation({
    mutationFn: async ({ groupId, name }: { groupId: string; name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Você precisa estar logado para entrar em um grupo");
      }

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

      // Aplicar meta padrão ao novo membro
      await supabase.rpc('apply_default_commitment', {
        _member_id: data.id,
        _group_id: groupId,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paginatedGroups"] });
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

  const toggleMembersVisibility = useMutation({
    mutationFn: async ({ groupId, visible }: { groupId: string; visible: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Você precisa estar logado");
      }

      const { error } = await supabase
        .from("groups")
        .update({ members_visible: visible })
        .eq("id", groupId)
        .eq("leader_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["paginatedGroups"] });
      toast({
        title: variables.visible ? "Membros visíveis" : "Membros ocultos",
        description: variables.visible 
          ? "A lista de membros agora está visível para todos."
          : "A lista de membros agora está oculta para outros participantes.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao alterar visibilidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    groups: data?.groups || [],
    totalCount: data?.count || 0,
    isLoading,
    joinGroup,
    toggleMembersVisibility,
  };
};

// Hook to get user memberships - uses auth state directly for faster loading
export const useUserMemberships = () => {
  const { user, loading: authLoading } = useAuth();
  
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ["userMemberships", user?.id],
    queryFn: async () => {
      if (!user) return { memberGroupIds: [], myGroupsCount: 0 };

      // Fetch memberships and leader groups in parallel for speed
      const [membershipsResult, leaderGroupsResult] = await Promise.all([
        supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", user.id),
        supabase
          .from("groups_public" as any)
          .select("id")
          .eq("leader_id", user.id)
      ]);

      if (membershipsResult.error) throw membershipsResult.error;
      
      const memberGroupIds = membershipsResult.data?.map(m => m.group_id) || [];
      const leaderGroupIds = leaderGroupsResult.data?.map((g: any) => g.id) || [];
      const allMyGroupIds = [...new Set([...memberGroupIds, ...leaderGroupIds])];

      return { 
        memberGroupIds, 
        myGroupsCount: allMyGroupIds.length 
      };
    },
    enabled: !authLoading, // Only run when auth state is known
    staleTime: 30 * 1000, // 30 seconds - keep fresh for quick logins
  });

  return { 
    userMemberships: data?.memberGroupIds || [], 
    myGroupsCount: data?.myGroupsCount || 0,
    isLoading: authLoading || queryLoading 
  };
};
