import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const logoImage = "/logo.jpg";
const naturuaiLogo = "/naturuai-logo.jpg";
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { AutoplayType } from "embla-carousel-autoplay";

// Hook to fetch ALL premium partners (national scope)
const useAllPremiumPartners = () => {
  return useQuery({
    queryKey: ["allPremiumPartners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners_public")
        .select("*")
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

export const PremiumLogosCarousel = () => {
  const { data: premiumPartners, isLoading } = useAllPremiumPartners();
  const [autoplayPlugin, setAutoplayPlugin] = useState<AutoplayType | null>(null);
  
  // Dynamic import for autoplay plugin to reduce initial JS
  useEffect(() => {
    import("embla-carousel-autoplay").then((module) => {
      setAutoplayPlugin(module.default({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true }));
    });
  }, []);

  if (isLoading || !premiumPartners || premiumPartners.length === 0) {
    return null;
  }

  const getPartnerLogo = (partner: { name?: string | null; logo_url?: string | null }) => {
    // Use the partner's custom logo if available
    if (partner.logo_url) return partner.logo_url;
    // Fallback to static logos for known partners
    if (partner.name === "NaturUai") return naturuaiLogo;
    return logoImage;
  };

  const handleWhatsAppClick = (partner: { name: string; whatsapp?: string | null }) => {
    if (!partner.whatsapp) return;
    const cleanNumber = partner.whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(`Olá ${partner.name}! Encontrei seu contato no Meta Solidária.`);
    window.open(`https://wa.me/55${cleanNumber}?text=${message}`, "_blank");
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-primary font-bold uppercase tracking-wide">
          Parceiros Idealizadores
        </span>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={autoplayPlugin ? [autoplayPlugin] : []}
          className="w-auto max-w-[200px]"
        >
          <CarouselContent className="-ml-1">
            {premiumPartners.map((partner) => (
              <CarouselItem key={partner.id} className="pl-1 basis-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar 
                      className="w-16 h-16 sm:w-12 sm:h-12 rounded-lg border-2 border-primary/50 bg-white cursor-pointer hover:border-primary transition-colors shadow-sm hover:shadow-md"
                      onClick={() => handleWhatsAppClick(partner)}
                    >
                      <AvatarImage 
                        src={getPartnerLogo(partner)}
                        alt={partner.name || "Parceiro Premium"}
                        className="object-contain p-1"
                      />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {partner.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-primary text-primary-foreground border-primary">
                    <p className="font-medium">{partner.name}</p>
                    <p className="text-xs text-primary-foreground/80">{partner.specialty}</p>
                  </TooltipContent>
                </Tooltip>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </TooltipProvider>
  );
};
