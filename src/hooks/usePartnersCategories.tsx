import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UsePartnersCategoriesOptions {
  city?: string;
}

/**
 * Hook to fetch distinct specialties from approved partners,
 * optionally filtered by city for showing only relevant categories.
 */
export const usePartnersCategories = ({ city }: UsePartnersCategoriesOptions) => {
  const { data: specialties, isLoading } = useQuery({
    queryKey: ["partnersCategories", city],
    queryFn: async () => {
      let query = supabase
        .from("partners_public")
        .select("specialty")
        .eq("is_approved", true)
        .not("specialty", "is", null);

      // Apply city filter if provided (extract just city name without state)
      if (city) {
        const cityName = city.split(",")[0].trim();
        query = query.ilike("city", `%${cityName}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Extract unique specialties
      const uniqueSpecialties = new Set(
        data
          .map((p) => p.specialty)
          .filter((s): s is string => s !== null)
      );

      return Array.from(uniqueSpecialties).sort();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    specialties: specialties || [],
    isLoading,
  };
};
