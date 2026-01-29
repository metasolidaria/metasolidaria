import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import type { AutoplayType } from "embla-carousel-autoplay";

const naturuaiLogo = "/naturuai-logo.jpg";
const logoImage = "/logo.jpg";

// Hook to fetch ALL premium partners (national scope)
const useAllPremiumPartners = () => {
  return useQuery({
    queryKey: ["allPremiumPartnersSlots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners_public")
        .select("id, name, logo_url, specialty, instagram")
        .eq("is_approved", true)
        .eq("tier", "premium")
        .order("name", { ascending: true });

      if (error) throw error;
      
      // Remove duplicates by name (keep first occurrence)
      const uniquePartners = data?.reduce((acc, partner) => {
        if (!acc.find(p => p.name === partner.name)) {
          acc.push(partner);
        }
        return acc;
      }, [] as typeof data) || [];
      
      return uniquePartners;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const PremiumPartnerSlots = () => {
  const { data: premiumPartners, isLoading } = useAllPremiumPartners();
  const [autoplayPlugin, setAutoplayPlugin] = useState<AutoplayType | null>(null);
  
  // Dynamic import for autoplay plugin to reduce initial JS
  useEffect(() => {
    import("embla-carousel-autoplay").then((module) => {
      setAutoplayPlugin(module.default({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true }));
    });
  }, []);

  const getPartnerLogo = (partner: { name?: string | null; logo_url?: string | null }) => {
    if (partner.logo_url) return partner.logo_url;
    if (partner.name === "NaturUai") return naturuaiLogo;
    return logoImage;
  };

  const handleInstagramClick = (partner: { instagram?: string | null }) => {
    if (!partner.instagram) return;
    // Clean Instagram handle (remove @ if present)
    const handle = partner.instagram.replace(/^@/, "").trim();
    window.open(`https://instagram.com/${handle}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <h3 className="text-lg font-semibold text-primary-foreground">
            Parceiros Premium
          </h3>
        </div>
        <div className="flex justify-center">
          <Skeleton className="w-16 h-16 rounded-full bg-primary-foreground/20" />
        </div>
      </div>
    );
  }

  if (!premiumPartners || premiumPartners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h3 className="text-lg font-semibold text-primary-foreground">
          Parceiros Premium
        </h3>
      </div>
      
      <TooltipProvider delayDuration={100}>
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={autoplayPlugin ? [autoplayPlugin] : []}
          className="w-full max-w-[300px] mx-auto"
        >
          <CarouselContent className="-ml-2">
            {premiumPartners.map((partner) => (
              <CarouselItem key={partner.id} className="pl-2 basis-auto flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative rounded-xl p-4 bg-primary-foreground/15 min-w-[180px] animate-in fade-in zoom-in-95 duration-300 ${partner.instagram ? "cursor-pointer hover:bg-primary-foreground/25" : ""} transition-colors`}
                      onClick={() => handleInstagramClick(partner)}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <Avatar className="w-16 h-16 rounded-full border-2 border-yellow-400/50 bg-white">
                          <AvatarImage 
                            src={getPartnerLogo(partner)} 
                            alt={partner.name || "Parceiro"} 
                            className="object-contain p-1"
                          />
                          <AvatarFallback className="rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                            {partner.name?.charAt(0) || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold text-primary-foreground">
                          {partner.name}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-primary text-primary-foreground border-primary">
                    <p className="font-medium">{partner.name}</p>
                    {partner.specialty && (
                      <p className="text-xs text-primary-foreground/80">{partner.specialty}</p>
                    )}
                    {partner.instagram && (
                      <p className="text-xs text-primary-foreground/70 mt-1">Clique para ver o Instagram</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </TooltipProvider>
    </div>
  );
};
