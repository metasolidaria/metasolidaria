import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AppRole = "admin" | "moderator" | "user";

export type RegistrationSource = "self_signup" | "admin_added" | "leader_added";

export interface AdminUser {
  profile_id: string;
  user_id: string;
  full_name: string;
  whatsapp: string;
  city: string | null;
  created_at: string;
  updated_at: string;
  email: string;
  user_created_at: string;
  last_sign_in_at: string | null;
  roles: AppRole[] | null;
  registration_source: RegistrationSource | null;
}

export interface UserGroup {
  group_id: string;
  group_name: string;
  is_leader: boolean;
  joined_at: string;
}

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all users (admin only)
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users_admin")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AdminUser[];
    },
  });

  // Fetch user groups
  const fetchUserGroups = async (userId: string): Promise<UserGroup[]> => {
    const { data, error } = await supabase
      .from("group_members")
      .select(`
        group_id,
        created_at,
        groups!inner(id, name, leader_id)
      `)
      .eq("user_id", userId);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      group_id: item.group_id,
      group_name: item.groups.name,
      is_leader: item.groups.leader_id === userId,
      joined_at: item.created_at,
    }));
  };

  // Update user profile
  const updateUser = useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: { full_name?: string; whatsapp?: string; city?: string | null };
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram atualizados com sucesso.",
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

  // Delete user profile (won't delete auth.users, but removes profile)
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Perfil excluído",
        description: "O perfil do usuário foi excluído com sucesso.",
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

  // Add role to user
  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Papel adicionado",
        description: "O papel foi adicionado ao usuário.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar papel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove role from user
  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Papel removido",
        description: "O papel foi removido do usuário.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover papel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create new user profile (for manual user addition)
  const createUser = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      full_name: string;
      whatsapp: string;
      city?: string;
    }) => {
      // Note: This creates a user via signup - admin will need to handle this differently
      // For now, we'll use the existing auth flow
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            whatsapp: userData.whatsapp,
            city: userData.city || null,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    users,
    isLoading,
    fetchUserGroups,
    updateUser,
    deleteUser,
    addRole,
    removeRole,
    createUser,
  };
};
