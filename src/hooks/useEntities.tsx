import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Entity {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  created_at: string;
}

export const useEntities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Entity[];
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
        // Handle unique constraint violation
        if (error.code === "23505") {
          throw new Error("Esta entidade já está cadastrada nesta cidade");
        }
        throw error;
      }
      return data as Entity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast({
        title: "Entidade cadastrada!",
        description: "A entidade foi cadastrada e está disponível para seleção.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar entidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    entities,
    isLoading,
    createEntity,
  };
};
