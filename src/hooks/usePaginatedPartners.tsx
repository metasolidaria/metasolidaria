import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState, useEffect } from "react";

export type PartnerTier = 'premium' | 'ouro' | 'apoiador';

// Partner type for public view (without sensitive fields)
export interface PartnerPublic {
  id: string;
  name: string;
  specialty: string | null;
  city: string;
  cep: string | null;
  whatsapp: string | null;
  description: string | null;
  is_approved: boolean;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  tier: PartnerTier;
  instagram: string | null;
  expires_at: string | null;
  logo_url: string | null;
  is_test: boolean;
}

// Tier order: premium/ouro first (both treated as gold), then apoiador
const tierOrder: Record<PartnerTier, number> = {
  premium: 1,
  ouro: 1,
  apoiador: 2,
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Sort partners by tier with randomization within each tier
const sortPartnersByTierWithShuffle = (partners: PartnerPublic[]): PartnerPublic[] => {
  // Separate by tier
  const goldPartners = partners.filter(p => p.tier === 'premium' || p.tier === 'ouro');
  const apoiadorPartners = partners.filter(p => p.tier === 'apoiador');
  
  // Shuffle each group
  const shuffledGold = shuffleArray(goldPartners);
  const shuffledApoiador = shuffleArray(apoiadorPartners);
  
  // Combine: gold first, then apoiador
  return [...shuffledGold, ...shuffledApoiador];
};

interface UsePaginatedPartnersOptions {
  page: number;
  limit: number;
  category?: string;
  city?: string;
}

export const usePaginatedPartners = ({ page, limit, category, city }: UsePaginatedPartnersOptions) => {
  // Generate a random seed on component mount to ensure consistent shuffle during session
  const [shuffleSeed] = useState(() => Math.random());
  
  const { data, isLoading } = useQuery({
    queryKey: ["paginatedPartners", page, limit, category, city],
    queryFn: async () => {
      let query = supabase
        .from("partners_public")
        .select("*", { count: "exact", head: false })
        .eq("is_approved", true);

      // Apply category filter server-side
      if (category && category !== "all") {
        query = query.eq("specialty", category);
      }

      // Apply city filter server-side (partial match)
      // Extract just the city name without state (e.g., "Campinas, SP" -> "Campinas")
      // Include national partners (Brasil) in all city filters
      if (city) {
        const cityName = city.split(",")[0].trim();
        query = query.or(`city.ilike.%${cityName}%,city.ilike.%brasil%`);
      }

      // Fetch all data to sort client-side (needed for tier-based random sorting)
      const { data: partnersData, error, count } = await query;

      if (error) throw error;
      
      // Sort by tier with shuffle within each tier
      const sortedPartners = sortPartnersByTierWithShuffle(partnersData as PartnerPublic[]);
      
      // Apply pagination after sorting
      const paginatedPartners = sortedPartners.slice((page - 1) * limit, page * limit);
      
      return { 
        partners: paginatedPartners, 
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
        .select("id, name, specialty, city, cep, latitude, longitude, tier, logo_url, whatsapp, instagram, description, is_test")
        .eq("is_approved", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) throw error;
      
      // Sort by tier with shuffle within each tier
      return sortPartnersByTierWithShuffle(data as PartnerPublic[]);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { partners: partners || [], isLoading };
};
