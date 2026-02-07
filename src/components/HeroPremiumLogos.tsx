import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import type { AutoplayType } from "embla-carousel-autoplay";

// Use static paths from public folder for better caching
const logoImage = "/logo.jpg";
const naturuaiLogo = "/naturuai-logo.jpg";

// Hook to fetch premium partners for Hero
const usePremiumPartnersHero = () => {
  return useQuery({
    queryKey: ["premiumPartnersHero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners_public")
        .select("id, name, logo_url, specialty, instagram")
        .eq("is_approved", true)
        .eq("tier", "premium")
        .order("name", { ascending: true });
      if (error) throw error;

      // Remove duplicates by name
      const uniquePartners = data?.reduce((acc, partner) => {
        if (!acc.find(p => p.name === partner.name)) {
          acc.push(partner);
        }
        return acc;
      }, [] as typeof data) || [];
      return uniquePartners;
    },
    staleTime: 5 * 60 * 1000
  });
};

export const HeroPremiumLogos = () => {
  const { data: premiumPartners, isLoading } = usePremiumPartnersHero();
  const [autoplayPlugin, setAutoplayPlugin] = useState<AutoplayType | null>(null);
  
  // Dynamic import for autoplay plugin to reduce initial JS
  useEffect(() => {
    import("embla-carousel-autoplay").then((module) => {
      setAutoplayPlugin(module.default({
        delay: 2500,
        stopOnInteraction: false,
        stopOnMouseEnter: true
      }));
    });
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="border-l border-primary-foreground/30 pl-3">
        <Skeleton className="w-[72px] h-[72px] rounded-lg bg-primary-foreground/20" />
      </div>
    );
  }

  // Hide if no partners
  if (!premiumPartners || premiumPartners.length === 0) {
    return null;
  }

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

  return (
    <div className="border-l border-primary-foreground/30 pl-3">
      <TooltipProvider delayDuration={100}>
        <Carousel
          opts={{ align: "center", loop: true }}
          plugins={autoplayPlugin ? [autoplayPlugin] : []}
          className="w-[110px]"
        >
          <CarouselContent className="-ml-1">
            {premiumPartners.map(partner => (
              <CarouselItem key={partner.id} className="pl-1 basis-full flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar
                      className={`w-[72px] h-[72px] rounded-lg border-2 border-primary-foreground/30 bg-white/90 transition-all shadow-md hover:shadow-lg hover:scale-105 ${partner.instagram ? "cursor-pointer hover:border-primary-foreground/60" : ""}`}
                      onClick={() => handleInstagramClick(partner)}
                    >
                      <AvatarImage
                        src={getPartnerLogo(partner)}
                        alt={partner.name || "Parceiro Premium"}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {partner.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-primary text-primary-foreground border-primary">
                    <p className="font-medium text-xs">{partner.name}</p>
                    {partner.specialty && (
                      <p className="text-[10px] text-primary-foreground/80">{partner.specialty}</p>
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
