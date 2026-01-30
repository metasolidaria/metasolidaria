import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminGroup {
  id: string;
  name: string;
  city: string;
  donation_type: string;
  goal_2026: number;
  is_private: boolean;
  members_visible: boolean;
  leader_id: string;
  leader_name: string | null;
  leader_whatsapp: string | null;
  leader_email: string | null;
  description: string | null;
  entity_id: string | null;
  image_url: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  member_count: number;
  total_donations: number;
  total_goals: number;
  view_count: number;
}

export interface GroupMember {
  id: string;
  name: string;
  user_id: string | null;
  whatsapp: string | null;
  personal_goal: number | null;
  goals_reached: number;
  created_at: string;
}

export const useAdminGroups = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all groups (admin only)
  const { data: groups, isLoading } = useQuery({
    queryKey: ["admin-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups_admin")
        .select("*");

      if (error) throw error;
      return data as AdminGroup[];
    },
  });

  // Fetch group members
  const fetchGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    const { data, error } = await supabase
      .from("group_members")
      .select("id, name, user_id, whatsapp, personal_goal, goals_reached, created_at")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Update group
  const updateGroup = useMutation({
    mutationFn: async ({
      groupId,
      updates,
    }: {
      groupId: string;
      updates: Partial<{
        name: string;
        city: string;
        donation_type: string;
        goal_2026: number;
        is_private: boolean;
        members_visible: boolean;
        leader_name: string;
        leader_whatsapp: string;
        description: string | null;
        end_date: string | null;
      }>;
    }) => {
      const { error } = await supabase
        .from("groups")
        .update(updates)
        .eq("id", groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      toast({
        title: "Grupo atualizado",
        description: "Os dados do grupo foram atualizados com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete group
  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      toast({
        title: "Grupo excluído",
        description: "O grupo foi excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add member to group
  const addMemberToGroup = useMutation({
    mutationFn: async ({
      groupId,
      userId,
      userName,
    }: {
      groupId: string;
      userId: string;
      userName: string;
    }) => {
      // Check if user is already a member
      const { data: existing } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        throw new Error("Usuário já é membro deste grupo");
      }

      const { error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: userId,
          name: userName,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
      toast({
        title: "Membro adicionado",
        description: "O usuário foi adicionado ao grupo com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch all users for selection
  const fetchAllUsers = async () => {
    const { data, error } = await supabase
      .from("users_admin")
      .select("user_id, full_name, email, city");

    if (error) throw error;
    return data || [];
  };

  return {
    groups,
    isLoading,
    fetchGroupMembers,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    fetchAllUsers,
  };
};
