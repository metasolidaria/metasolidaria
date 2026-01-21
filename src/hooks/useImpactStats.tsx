import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DonationsByType {
  alimentos: number;
  livros: number;
  roupas: number;
  cobertores: number;
  sopas: number;
  brinquedos: number;
  higiene: number;
  outro: number;
}

export const useImpactStats = () => {
  return useQuery({
    queryKey: ["impactStats"],
    queryFn: async () => {
      // Buscar dados de progresso
      const { data: progressData } = await supabase
        .from("goal_progress")
        .select("amount, group_id");

      // Buscar grupos públicos para mapear donation_type (sem RLS restritivo)
      const { data: groupsData } = await supabase
        .from("groups_public")
        .select("id, donation_type");

      // Criar mapa de group_id -> donation_type
      const groupTypeMap = new Map(
        groupsData?.map(g => [g.id, g.donation_type]) || []
      );

      // Inicializar contadores por tipo
      const donationsByType: DonationsByType = {
        alimentos: 0,
        livros: 0,
        roupas: 0,
        cobertores: 0,
        sopas: 0,
        brinquedos: 0,
        higiene: 0,
        outro: 0,
      };

      let totalDonations = 0;

      // Agrupar valores por tipo de doação
      progressData?.forEach((item) => {
        totalDonations += item.amount || 0;
        const type = groupTypeMap.get(item.group_id) as keyof DonationsByType;
        if (type && donationsByType.hasOwnProperty(type)) {
          donationsByType[type] += item.amount || 0;
        }
      });

      return {
        totalDonations,
        donationsByType,
      };
    },
  });
};
