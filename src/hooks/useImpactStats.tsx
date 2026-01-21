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
      // Buscar total de doações/registros
      const { count: totalDonations } = await supabase
        .from("goal_progress")
        .select("*", { count: "exact", head: true });

      // Buscar dados de progresso com tipo de doação do grupo
      const { data: progressData } = await supabase
        .from("goal_progress")
        .select(`
          amount,
          group_id,
          groups!inner(donation_type)
        `);

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

      // Agrupar valores por tipo de doação
      progressData?.forEach((item: any) => {
        const type = item.groups?.donation_type as keyof DonationsByType;
        if (type && donationsByType.hasOwnProperty(type)) {
          donationsByType[type] += item.amount || 0;
        }
      });

      return {
        totalDonations: totalDonations || 0,
        donationsByType,
      };
    },
  });
};
