import { useGoldPartners } from "@/hooks/useGoldPartners";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface GoldPartnersCarouselProps {
  groupCity: string;
}

export const GoldPartnersCarousel = ({ groupCity }: GoldPartnersCarouselProps) => {
  const { data: partners, isLoading } = useGoldPartners(groupCity);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-foreground">Parceiros Ouro</h2>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-2xl p-6 shadow-soft border border-amber-500/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h2 className="text-xl font-bold text-foreground">Parceiros Ouro da Região</h2>
        <Badge variant="outline" className="ml-auto bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
          {partners.length} {partners.length === 1 ? "parceiro" : "parceiros"}
        </Badge>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: partners.length > 3,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {partners.map((partner) => (
            <CarouselItem key={partner.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <Card 
                className="bg-card/80 backdrop-blur border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group"
                onClick={() => handleWhatsAppClick(partner)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {partner.name}
                      </h3>
                      {partner.specialty && (
                        <p className="text-sm text-muted-foreground truncate">
                          {partner.specialty}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{partner.city}</span>
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

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Clique em um parceiro para entrar em contato via WhatsApp
      </p>
    </motion.div>
  );
};
