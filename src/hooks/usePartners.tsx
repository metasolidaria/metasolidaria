import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type PartnerTier = 'premium' | 'ouro' | 'apoiador';

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
  tier: PartnerTier;
  instagram: string | null;
  expires_at: string | null;
  referrer_name: string | null;
  referrer_phone: string | null;
  logo_url: string | null;
  is_test: boolean;
}

export const usePartners = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      // Use the public view that excludes sensitive data (whatsapp, referrer info)
      // Filter only approved partners
      const { data, error } = await supabase
        .from("partners_public")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Cast to Partner type - public view excludes sensitive fields
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
