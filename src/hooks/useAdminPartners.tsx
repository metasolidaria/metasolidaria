import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Partner, PartnerTier } from "./usePartners";

export const useAdminPartners = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allPartners, isLoading } = useQuery({
    queryKey: ["adminPartners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Partner[];
    },
  });

  const pendingPartners = allPartners?.filter((p) => !p.is_approved) || [];
  const approvedPartners = allPartners?.filter((p) => p.is_approved) || [];

  const approvePartner = useMutation({
    mutationFn: async (partnerId: string) => {
      const { error } = await supabase
        .from("partners")
        .update({ is_approved: true })
        .eq("id", partnerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPartners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: "Parceiro aprovado! ✅",
        description: "O parceiro agora está visível no guia.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao aprovar parceiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectPartner = useMutation({
    mutationFn: async (partnerId: string) => {
      const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", partnerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPartners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: "Parceiro removido",
        description: "O parceiro foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover parceiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePartner = useMutation({
    mutationFn: async (partner: Partial<Partner> & { id: string }) => {
      const { id, ...updates } = partner;
      const { error } = await supabase
        .from("partners")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPartners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: "Parceiro atualizado! ✅",
        description: "As informações foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar parceiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPartner = useMutation({
    mutationFn: async (partner: {
      name: string;
      city: string;
      specialty?: string;
      whatsapp?: string;
      instagram?: string;
      description?: string;
      tier?: PartnerTier;
      is_approved?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("partners")
        .insert([{ ...partner, is_approved: partner.is_approved ?? true }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPartners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: "Parceiro cadastrado! ✅",
        description: "O novo parceiro foi adicionado com sucesso.",
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
    allPartners,
    pendingPartners,
    approvedPartners,
    isLoading,
    approvePartner,
    rejectPartner,
    updatePartner,
    createPartner,
  };
};
