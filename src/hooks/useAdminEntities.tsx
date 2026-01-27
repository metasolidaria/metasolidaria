import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminEntity {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  created_by: string | null;
  created_at: string;
  total_donated: number;
  groups_count: number;
}

export const useAdminEntities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["admin-entities"],
    queryFn: async () => {
      // Fetch entities
      const { data: entitiesData, error: entitiesError } = await supabase
        .from("entities")
        .select("*")
        .order("name");

      if (entitiesError) throw entitiesError;

      // Fetch groups with stats to calculate donations per entity
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("entity_id, id");

      if (groupsError) throw groupsError;

      // Fetch donation stats from group_stats
      const { data: statsData, error: statsError } = await supabase
        .from("group_stats")
        .select("group_id, total_donations");

      if (statsError) throw statsError;

      // Create a map of group_id -> total_donations
      const donationsByGroup = new Map<string, number>();
      statsData?.forEach(stat => {
        if (stat.group_id) {
          donationsByGroup.set(stat.group_id, Number(stat.total_donations) || 0);
        }
      });

      // Calculate totals per entity
      const entityStats = new Map<string, { total: number; count: number }>();
      groupsData?.forEach(group => {
        if (group.entity_id) {
          const current = entityStats.get(group.entity_id) || { total: 0, count: 0 };
          current.total += donationsByGroup.get(group.id) || 0;
          current.count += 1;
          entityStats.set(group.entity_id, current);
        }
      });

      // Merge entities with stats
      return entitiesData.map(entity => ({
        ...entity,
        total_donated: entityStats.get(entity.id)?.total || 0,
        groups_count: entityStats.get(entity.id)?.count || 0,
      })) as AdminEntity[];
    },
  });

  const createEntity = useMutation({
    mutationFn: async ({ name, city, phone }: { name: string; city: string; phone?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("entities")
        .insert({ 
          name: name.trim(), 
          city: city.trim(),
          phone: phone?.trim() || null,
          created_by: userData.user.id 
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Esta entidade já está cadastrada nesta cidade");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-entities"] });
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast({
        title: "Entidade criada!",
        description: "A entidade foi cadastrada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar entidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEntity = useMutation({
    mutationFn: async ({ id, name, city, phone }: { id: string; name: string; city: string; phone?: string }) => {
      const { data, error } = await supabase
        .from("entities")
        .update({ 
          name: name.trim(), 
          city: city.trim(),
          phone: phone?.trim() || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Esta entidade já está cadastrada nesta cidade");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-entities"] });
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast({
        title: "Entidade atualizada!",
        description: "Os dados foram salvos com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar entidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEntity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("entities")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-entities"] });
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast({
        title: "Entidade excluída!",
        description: "A entidade foi removida com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir entidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    entities,
    isLoading,
    createEntity,
    updateEntity,
    deleteEntity,
  };
};
