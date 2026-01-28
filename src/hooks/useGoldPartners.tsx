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
  return match ? match[1] : null;
};

export const useGoldPartners = (groupCity: string | undefined) => {
  return useQuery({
    queryKey: ["goldPartners", groupCity],
    queryFn: async () => {
      if (!groupCity) return [];

      const { data, error } = await supabase
        .from("partners_public")
        .select("*")
        .eq("is_approved", true)
        .eq("tier", "ouro")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const groupState = extractStateFromCity(groupCity);
      const groupCityName = groupCity.replace(/\s*-\s*[A-Z]{2}$/, "").trim();

      // Filter partners by:
      // 1. Same city as the group
      // 2. Regional visibility (partner city = state name)
      // 3. National visibility (partner city = "Brasil")
      const filteredPartners = data.filter((partner) => {
        const partnerCity = partner.city || "";
        const partnerCityName = partnerCity.replace(/\s*-\s*[A-Z]{2}$/, "").trim();

        // National visibility
        if (partnerCityName.toLowerCase() === "brasil") {
          return true;
        }

        // Same city
        if (partnerCityName.toLowerCase() === groupCityName.toLowerCase()) {
          return true;
        }

        // Regional visibility (partner registered with state name)
        if (groupState) {
          const stateNames = Object.entries(stateMapping).filter(([_, codes]) =>
            codes.includes(groupState)
          );
          if (stateNames.some(([name]) => partnerCityName.toLowerCase() === name.toLowerCase())) {
            return true;
          }
        }

        return false;
      });

      return filteredPartners as Partner[];
    },
    enabled: !!groupCity,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
