import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

interface UsePaginatedPartnersOptions {
  page: number;
  limit: number;
  category?: string;
  city?: string;
}

export const usePaginatedPartners = ({ page, limit, category, city }: UsePaginatedPartnersOptions) => {
  const { data, isLoading } = useQuery({
    queryKey: ["paginatedPartners", page, limit, category, city],
    queryFn: async () => {
      let query = supabase
        .from("partners_public")
        .select("*", { count: "exact", head: false })
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      // Apply category filter server-side
      if (category && category !== "all") {
        query = query.eq("specialty", category);
      }

      // Apply city filter server-side (partial match)
      // Extract just the city name without state (e.g., "Campinas, SP" -> "Campinas")
      if (city) {
        const cityName = city.split(",")[0].trim();
        query = query.ilike("city", `%${cityName}%`);
      }

      const { data: partnersData, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      
      return { 
        partners: partnersData as Partner[], 
        count: count || 0 
      };
    },
  });

  return {
    partners: data?.partners || [],
    totalCount: data?.count || 0,
    isLoading,
  };
};

// Hook to get all partners for proximity filtering (client-side)
// This is needed because proximity calculation requires lat/lng
export const useAllPartnersForProximity = () => {
  const { data: partners, isLoading } = useQuery({
    queryKey: ["allPartnersProximity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners_public")
        .select("id, name, specialty, city, latitude, longitude, tier, logo_url, whatsapp, instagram, description, is_test")
        .eq("is_approved", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) throw error;
      return data as Partner[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { partners: partners || [], isLoading };
};
