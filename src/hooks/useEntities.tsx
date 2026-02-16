import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Entity {
  id: string;
  name: string;
  city: string;
  accepted_donations: string[];
  observations: string | null;
  pix_key: string | null;
  pix_name: string | null;
  created_at: string;
}

export const DONATION_OPTIONS = [
  { value: "alimentos", label: "Alimentos" },
  { value: "roupas", label: "Roupas" },
  { value: "cobertores", label: "Cobertores" },
  { value: "brinquedos", label: "Brinquedos" },
  { value: "livros", label: "Livros" },
  { value: "higiene", label: "Kits de Higiene" },
  { value: "sopas", label: "Sopas/Refeições" },
  { value: "racao", label: "Ração" },
  { value: "moveis", label: "Móveis" },
  { value: "eletrodomesticos", label: "Eletrodomésticos" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "outros", label: "Outros (especificar nas observações)" },
] as const;

export const useEntities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["entities"],
    queryFn: async () => {
      // Use public view that excludes phone numbers for privacy
      const { data, error } = await supabase
        .from("entities_public")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Entity[];
    },
  });

  const createEntity = useMutation({
    mutationFn: async ({ 
      name, 
      city, 
      phone,
      accepted_donations,
      observations,
      pix_key,
      pix_name,
    }: { 
      name: string; 
      city: string; 
      phone?: string;
      accepted_donations?: string[];
      observations?: string;
      pix_key?: string;
      pix_name?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("entities")
        .insert({ 
          name: name.trim(), 
          city: city.trim(),
          phone: phone?.trim() || null,
          accepted_donations: accepted_donations || [],
          observations: observations?.trim() || null,
          pix_key: pix_key?.trim() || null,
          pix_name: pix_name?.trim() || null,
          created_by: userData.user.id 
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation
        if (error.code === "23505") {
          throw new Error("Esta instituição já está cadastrada nesta cidade");
        }
        throw error;
      }
      return data as Entity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast({
         title: "Instituição cadastrada!",
         description: "A instituição foi cadastrada e está disponível para seleção.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar instituição",
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
