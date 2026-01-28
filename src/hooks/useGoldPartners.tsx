import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Partner } from "./usePartners";

// Brazilian states mapping for regional visibility
const stateMapping: Record<string, string[]> = {
  "Minas Gerais": ["MG"],
  "São Paulo": ["SP"],
  "Rio de Janeiro": ["RJ"],
  "Paraná": ["PR"],
  "Rio Grande do Sul": ["RS"],
  "Santa Catarina": ["SC"],
  "Bahia": ["BA"],
  "Goiás": ["GO"],
  "Pernambuco": ["PE"],
  "Ceará": ["CE"],
};

// Function to extract state from city name (format: "Cidade - UF" or just "Cidade")
const extractStateFromCity = (city: string): string | null => {
  const match = city.match(/\s*-\s*([A-Z]{2})$/);
  if (match) return match[1];
  // Try format "Cidade, UF"
  const commaMatch = city.match(/,\s*([A-Z]{2})$/);
  return commaMatch ? commaMatch[1] : null;
};

// Shuffle array function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const usePremiumAndGoldPartners = (groupCity: string | undefined) => {
  return useQuery({
    queryKey: ["premiumGoldPartners", groupCity],
    queryFn: async () => {
      if (!groupCity) return [];

      const { data, error } = await supabase
        .from("partners_public")
        .select("*")
        .eq("is_approved", true)
        .in("tier", ["premium", "ouro"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const groupState = extractStateFromCity(groupCity);
      const groupCityName = groupCity.replace(/\s*[-,]\s*[A-Z]{2}$/, "").trim();

      // Filter partners by:
      // 1. Same city as the group
      // 2. Regional visibility (partner city = state name)
      // 3. National visibility (partner city = "Brasil")
      const filteredPartners = data.filter((partner) => {
        const partnerCity = partner.city || "";
        const partnerCityName = partnerCity.replace(/\s*[-,]\s*[A-Z]{2}$/, "").trim();
        const partnerState = extractStateFromCity(partnerCity);

        // National visibility
        if (partnerCityName.toLowerCase() === "brasil") {
          return true;
        }

        // Same city name AND same state (or no state specified)
        if (partnerCityName.toLowerCase() === groupCityName.toLowerCase()) {
          // If both have states, they must match
          if (partnerState && groupState) {
            return partnerState === groupState;
          }
          // Otherwise, assume same city
          return true;
        }

        // Regional visibility: partner city is the state name (e.g., "São Paulo" or "Minas Gerais")
        // This means the partner is available for ALL cities in that state
        if (groupState) {
          const stateEntry = Object.entries(stateMapping).find(([_, codes]) =>
            codes.includes(groupState)
          );
          if (stateEntry && partnerCityName.toLowerCase() === stateEntry[0].toLowerCase()) {
            return true;
          }
        }

        return false;
      });

      // Shuffle the results for random order
      return shuffleArray(filteredPartners) as Partner[];
    },
    enabled: !!groupCity,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Keep the old hook for backwards compatibility
export const useGoldPartners = usePremiumAndGoldPartners;
