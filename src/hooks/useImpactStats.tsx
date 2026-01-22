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

interface ImpactStatsRow {
  donation_type: string;
  total_amount: number;
  total_entries: number;
}

export const useImpactStats = () => {
  return useQuery({
    queryKey: ["impactStats"],
    queryFn: async () => {
      // Buscar dados agregados da view pública (sem restrição de RLS)
      const { data, error } = await supabase
        .from("impact_stats_public")
        .select("*");

      if (error) {
        console.error("Error fetching impact stats:", error);
        throw error;
      }

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

      // Processar dados da view
      (data as ImpactStatsRow[] | null)?.forEach((row) => {
        const amount = Number(row.total_amount) || 0;
        totalDonations += amount;
        
        const type = row.donation_type as keyof DonationsByType;
        if (type && donationsByType.hasOwnProperty(type)) {
          donationsByType[type] = amount;
        }
      });

      return {
        totalDonations,
        donationsByType,
      };
    },
  });
};
