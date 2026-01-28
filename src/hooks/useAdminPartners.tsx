import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/imageCompression";
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

  const togglePartnerStatus = useMutation({
    mutationFn: async ({ partnerId, isApproved }: { partnerId: string; isApproved: boolean }) => {
      const { error } = await supabase
        .from("partners")
        .update({ is_approved: isApproved })
        .eq("id", partnerId);

      if (error) throw error;
    },
    onSuccess: (_, { isApproved }) => {
      queryClient.invalidateQueries({ queryKey: ["adminPartners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: isApproved ? "Parceiro ativado! ✅" : "Parceiro desativado",
        description: isApproved
          ? "O parceiro agora está visível no guia."
          : "O parceiro não aparecerá mais no guia.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao alterar status do parceiro",
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
      expires_at?: string | null;
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

  const uploadLogo = useMutation({
    mutationFn: async ({ partnerId, file }: { partnerId: string; file: File }) => {
      // Compress the image before upload (max 400x400 for logos, high quality)
      const compressedBlob = await compressImage(file, 400, 400, 0.85);
      
      const fileName = `${partnerId}.jpg`;
      const filePath = `logos/${fileName}`;

      // Upload the compressed file
      const { error: uploadError } = await supabase.storage
        .from("partner-logos")
        .upload(filePath, compressedBlob, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // Get public URL with cache buster
      const { data: urlData } = supabase.storage
        .from("partner-logos")
        .getPublicUrl(filePath);

      const logoUrlWithCacheBuster = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update partner with logo URL
      const { error: updateError } = await supabase
        .from("partners")
        .update({ logo_url: logoUrlWithCacheBuster })
        .eq("id", partnerId);

      if (updateError) throw updateError;

      return logoUrlWithCacheBuster;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPartners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["allPremiumPartners"] });
      toast({
        title: "Logo enviada! ✅",
        description: "A logo do parceiro foi atualizada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar logo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLogo = useMutation({
    mutationFn: async ({ partnerId, logoUrl }: { partnerId: string; logoUrl: string }) => {
      // Extract file path from URL
      const urlParts = logoUrl.split("/partner-logos/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("partner-logos").remove([filePath]);
      }

      // Update partner to remove logo URL
      const { error } = await supabase
        .from("partners")
        .update({ logo_url: null })
        .eq("id", partnerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPartners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["allPremiumPartners"] });
      toast({
        title: "Logo removida",
        description: "A logo do parceiro foi excluída.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover logo",
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
    togglePartnerStatus,
    rejectPartner,
    updatePartner,
    createPartner,
    uploadLogo,
    deleteLogo,
  };
};
