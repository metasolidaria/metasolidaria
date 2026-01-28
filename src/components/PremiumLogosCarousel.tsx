import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import logoImage from "@/assets/logo.jpg";
import naturuaiLogo from "@/assets/naturuai-logo.jpg";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

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
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  if (isLoading || !premiumPartners || premiumPartners.length === 0) {
    return null;
  }

  const getPartnerLogo = (partnerName: string) => {
    if (partnerName === "NaturUai") return naturuaiLogo;
    return logoImage;
  };

  const handleWhatsAppClick = (partner: { name: string; whatsapp?: string | null }) => {
    if (!partner.whatsapp) return;
    const cleanNumber = partner.whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(`Olá ${partner.name}! Encontrei seu contato no Meta Solidária.`);
    window.open(`https://wa.me/55${cleanNumber}?text=${message}`, "_blank");
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wide hidden sm:block">
          Parceiros Idealizadores
        </span>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[autoplayPlugin.current]}
          className="w-auto max-w-[200px]"
        >
          <CarouselContent className="-ml-1">
            {premiumPartners.map((partner) => (
              <CarouselItem key={partner.id} className="pl-1 basis-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar 
                      className="w-14 h-14 sm:w-12 sm:h-12 rounded-lg border-2 border-purple-500/50 bg-white cursor-pointer hover:border-purple-500 transition-colors shadow-sm hover:shadow-md"
                      onClick={() => handleWhatsAppClick(partner)}
                    >
                      <AvatarImage 
                        src={getPartnerLogo(partner.name || "")} 
                        alt={partner.name || "Parceiro Premium"}
                        className="object-contain p-1"
                      />
                      <AvatarFallback className="rounded-lg bg-purple-100 text-purple-700 font-semibold text-sm">
                        {partner.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-purple-900 text-white border-purple-700">
                    <p className="font-medium">{partner.name}</p>
                    <p className="text-xs text-purple-200">{partner.specialty}</p>
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
