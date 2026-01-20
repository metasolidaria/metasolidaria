import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Partner {
  id: string;
  name: string;
  specialty: string;
  city: string;
  whatsapp: string;
  description: string | null;
  is_approved: boolean;
  submitted_by: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
}

export const usePartners = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Partner[];
    },
  });

  const submitPartner = useMutation({
    mutationFn: async (newPartner: {
      name: string;
      specialty: string;
      city: string;
      whatsapp: string;
      description?: string;
      submitted_by: string;
    }) => {
      const { data, error } = await supabase
        .from("partners")
        .insert([newPartner])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: "Parceiro enviado para aprovação! 🎉",
        description: "O parceiro será exibido após a aprovação.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar parceiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    partners,
    isLoading,
    submitPartner,
  };
};
