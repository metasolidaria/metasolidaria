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
}

export const usePaginatedGroups = ({ page, limit, filter, userMemberships }: UsePaginatedGroupsOptions) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["paginatedGroups", page, limit, filter, userMemberships],
    queryFn: async () => {
      // For "mine" filter, we need to filter by user memberships
      if (filter === "mine" && userMemberships.length > 0) {
        const { data: groupsData, error, count } = await supabase
          .from("groups_public" as any)
          .select("*", { count: "exact", head: false })
          .in("id", userMemberships)
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
      } else if (filter === "mine" && userMemberships.length === 0) {
        // No memberships, return empty
        return { groups: [], count: 0 };
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

  return {
    groups: data?.groups || [],
    totalCount: data?.count || 0,
    isLoading,
    joinGroup,
  };
};

// Hook to get user memberships - keeps same API
export const useUserMemberships = () => {
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

  return userMemberships || [];
};
