import { usePremiumAndGoldPartners } from "@/hooks/useGoldPartners";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ExternalLink, ArrowRight, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { AutoplayType } from "embla-carousel-autoplay";

// Use static paths from public folder for better caching
const logoImage = "/logo.jpg";
const naturuaiLogo = "/naturuai-logo.jpg";

interface GoldPartnersCarouselProps {
  groupCity: string;
  groupId?: string;
  groupName?: string;
}

export const GoldPartnersCarousel = ({ groupCity, groupId, groupName }: GoldPartnersCarouselProps) => {
  const { data: partners, isLoading } = usePremiumAndGoldPartners(groupCity);
  const [autoplayPlugin, setAutoplayPlugin] = useState<AutoplayType | null>(null);
  
  // Dynamic import for autoplay plugin to reduce initial JS
  useEffect(() => {
    import("embla-carousel-autoplay").then((module) => {
      setAutoplayPlugin(module.default({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }));
    });
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-foreground">Parceiros da Região</h2>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  const handleWhatsAppClick = (partner: { name: string; whatsapp?: string | null }) => {
    if (!partner.whatsapp) return;
    const cleanNumber = partner.whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(`Olá ${partner.name}! Encontrei seu contato no Meta Solidária.`);
    window.open(`https://wa.me/55${cleanNumber}?text=${message}`, "_blank");
  };

  const isPremium = (tier: string | null) => tier === "premium";

  const getPartnerLogo = (partnerName: string) => {
    if (partnerName === "NaturUai") return naturuaiLogo;
    return logoImage;
  };

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-amber-600/10 rounded-2xl p-6 shadow-soft border border-amber-500/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          <Crown className="w-5 h-5 text-purple-500" />
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Parceiros Solidários</h2>
        <Badge variant="outline" className="ml-auto bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
          {partners.length} {partners.length === 1 ? "parceiro" : "parceiros"}
        </Badge>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={autoplayPlugin ? [autoplayPlugin] : []}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {partners.map((partner) => (
            <CarouselItem key={partner.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <Card 
                className={`backdrop-blur transition-all cursor-pointer group ${
                  isPremium(partner.tier)
                    ? "bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/40 hover:border-purple-500/60 shadow-purple-500/10 shadow-md"
                    : "bg-card/80 border-amber-500/20 hover:border-amber-500/40"
                }`}
                onClick={() => handleWhatsAppClick(partner)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-16 h-16 rounded-xl border-2 border-amber-500/30 bg-white">
                      <AvatarImage 
                        src={getPartnerLogo(partner.name || "")} 
                        alt={partner.name || "Parceiro"}
                        className="object-contain p-1.5"
                      />
                      <AvatarFallback className="rounded-xl bg-amber-100 text-amber-700 font-semibold text-lg">
                        {partner.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-xs font-medium truncate transition-colors ${
                            isPremium(partner.tier)
                              ? "text-purple-700 dark:text-purple-300 group-hover:text-purple-600 dark:group-hover:text-purple-200"
                              : "text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400"
                          }`}>
                            {partner.name}
                          </h3>
                          {partner.specialty && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {partner.specialty}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {isPremium(partner.tier) ? (
                            <Crown className="w-3 h-3 text-purple-500 fill-purple-500/30" />
                          ) : (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          )}
                          <ExternalLink className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{partner.city}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 ${
                        isPremium(partner.tier)
                          ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
                          : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {isPremium(partner.tier) ? "Premium" : "Ouro"}
                    </Badge>
                  </div>

                  {partner.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {partner.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {partners.length > 3 && (
          <>
            <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 backdrop-blur border-amber-500/30 hover:bg-amber-500/10" />
            <CarouselNext className="hidden md:flex -right-4 bg-background/80 backdrop-blur border-amber-500/30 hover:bg-amber-500/10" />
          </>
        )}
      </Carousel>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          Clique em um parceiro para entrar em contato via WhatsApp
        </p>
        <Link 
          to={`/?parceiros=true&cidade=${encodeURIComponent(groupCity)}${groupId ? `&grupoId=${groupId}` : ""}${groupName ? `&grupoNome=${encodeURIComponent(groupName)}` : ""}`}
          className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
        >
          Ver todos os parceiros
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
