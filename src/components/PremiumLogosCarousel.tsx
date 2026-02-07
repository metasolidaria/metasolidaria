import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const logoImage = "/logo.jpg";
const naturuaiLogo = "/naturuai-logo.jpg";
import { useState, useEffect, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { AutoplayType } from "embla-carousel-autoplay";

// Hook to fetch ALL premium partners (national scope)
const useAllPremiumPartners = () => {
  return useQuery({
    queryKey: ["allPremiumPartners"],
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

export const PremiumLogosCarousel = () => {
  const { data: premiumPartners, isLoading } = useAllPremiumPartners();
  const [autoplayPlugin, setAutoplayPlugin] = useState<AutoplayType | null>(null);
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  
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

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent, partner: { instagram?: string | null }) => {
    if (!pointerStartPos.current) return;
    
    const dx = Math.abs(e.clientX - pointerStartPos.current.x);
    const dy = Math.abs(e.clientY - pointerStartPos.current.y);
    
    // Se movimento < 5px em ambos eixos, é um clique real
    if (dx < 5 && dy < 5 && partner.instagram) {
      const handle = partner.instagram.replace(/^@/, "").trim();
      window.open(`https://instagram.com/${handle}`, "_blank", "noopener,noreferrer");
    }
    
    pointerStartPos.current = null;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col items-center gap-1 overflow-hidden">
        <span className="text-[10px] text-primary font-bold uppercase tracking-wide">
          Parceiros Idealizadores
        </span>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={autoplayPlugin ? [autoplayPlugin] : []}
          className="w-auto max-w-[320px] overflow-hidden"
        >
          <CarouselContent className="-ml-1">
            {premiumPartners.map((partner) => (
              <CarouselItem key={partner.id} className="pl-1 basis-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onPointerDown={handlePointerDown}
                      onPointerUp={(e) => handlePointerUp(e, partner)}
                      className="focus:outline-none touch-none"
                      aria-label={`Visitar Instagram de ${partner.name}`}
                    >
                      <Avatar 
                        className={`w-28 h-28 sm:w-24 sm:h-24 rounded-lg bg-transparent transition-colors shadow-sm hover:shadow-md ${partner.instagram ? "cursor-pointer" : ""}`}
                      >
                        <AvatarImage 
                          src={getPartnerLogo(partner)}
                          alt={partner.name || "Parceiro Premium"}
                          className="object-contain p-0.5 mix-blend-multiply"
                        />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                          {partner.name?.charAt(0) || "P"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
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
