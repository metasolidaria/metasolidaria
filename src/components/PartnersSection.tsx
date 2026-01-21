import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { 
  MapPin, 
  Phone, 
  Star, 
  Search,
  Stethoscope,
  Apple,
  Brain,
  Dumbbell,
  HeartPulse,
  Loader2,
  ShoppingCart,
  Navigation,
  X,
  UserPlus
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { usePartners } from "@/hooks/usePartners";
import { useGeolocation, calculateDistance } from "@/hooks/useGeolocation";
import { Slider } from "./ui/slider";
import { RecommendPartnerModal } from "./RecommendPartnerModal";

const categories = [
  { id: "all", label: "Todos", icon: Star },
  { id: "Nutricionista", label: "Nutricionista", icon: Apple },
  { id: "Médico", label: "Médico", icon: Stethoscope },
  { id: "Psicólogo", label: "Psicólogo", icon: Brain },
  { id: "Personal Trainer", label: "Personal Trainer", icon: Dumbbell },
  { id: "Fisioterapeuta", label: "Fisioterapeuta", icon: HeartPulse },
  { id: "Academia", label: "Academia", icon: Dumbbell },
  { id: "Supermercado", label: "Supermercado", icon: ShoppingCart },
];

const placeholderImages = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
];

export const PartnersSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchCity, setSearchCity] = useState("");
  const [radiusKm, setRadiusKm] = useState(50);
  const [useProximity, setUseProximity] = useState(false);
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  
  const { partners, isLoading } = usePartners();
  const { latitude, longitude, loading: geoLoading, error: geoError, requestLocation, hasLocation } = useGeolocation();

  const handleEnableProximity = () => {
    if (!hasLocation) {
      requestLocation();
    }
    setUseProximity(true);
  };

  const handleDisableProximity = () => {
    setUseProximity(false);
  };

  const filteredAndSortedPartners = useMemo(() => {
    let result = (partners || []).filter((partner) => {
      const matchesCategory =
        selectedCategory === "all" || partner.specialty === selectedCategory;
      const matchesCity =
        !searchCity ||
        partner.city.toLowerCase().includes(searchCity.toLowerCase());
      return matchesCategory && matchesCity;
    });

    // Se proximidade está ativa e temos localização
    if (useProximity && hasLocation && latitude && longitude) {
      result = result
        .map((partner) => {
          const distance =
            partner.latitude && partner.longitude
              ? calculateDistance(latitude, longitude, partner.latitude, partner.longitude)
              : null;
          return { ...partner, distance };
        })
        .filter((partner) => {
          // Filtrar por raio apenas se o parceiro tem coordenadas
          if (partner.distance === null) return true; // Mostrar parceiros sem coordenadas
          return partner.distance <= radiusKm;
        })
        .sort((a, b) => {
          // Ordenar por distância (parceiros sem coordenadas vão para o final)
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }

    return result;
  }, [partners, selectedCategory, searchCity, useProximity, hasLocation, latitude, longitude, radiusKm]);

  const handleWhatsAppClick = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${name}! Encontrei seu contato através do Meta Solidária e gostaria de agendar uma consulta.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <section id="parceiros" className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Guia de Parceiros
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Encontre profissionais de saúde próximos de você para ajudar na sua
            jornada de transformação
          </p>
          <Button
            variant="hero"
            onClick={() => setIsRecommendModalOpen(true)}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Recomendar ou Seja Parceiro
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por cidade..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="pl-11"
              />
            </div>

            {/* Botão de Proximidade */}
            {!useProximity ? (
              <Button
                variant="outline"
                onClick={handleEnableProximity}
                disabled={geoLoading}
                className="gap-2"
              >
                {geoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                Buscar próximos a mim
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleDisableProximity}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Desativar proximidade
              </Button>
            )}
          </div>

          {/* Slider de Raio */}
          {useProximity && hasLocation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Raio de busca</span>
                <span className="text-sm font-bold text-primary">{radiusKm} km</span>
              </div>
              <Slider
                value={[radiusKm]}
                onValueChange={(value) => setRadiusKm(value[0])}
                min={5}
                max={200}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5 km</span>
                <span>200 km</span>
              </div>
            </motion.div>
          )}

          {/* Erro de geolocalização */}
          {geoError && useProximity && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {geoError}. Você ainda pode buscar por cidade.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Partners Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredAndSortedPartners.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex gap-4 p-5">
                  <img
                    src={placeholderImages[index % placeholderImages.length]}
                    alt={partner.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-primary font-medium">
                      {partner.specialty}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {partner.city}
                      {"distance" in partner && typeof (partner as { distance: number | null }).distance === "number" && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {(partner as { distance: number }).distance < 1 
                            ? `${Math.round((partner as { distance: number }).distance * 1000)}m` 
                            : `${(partner as { distance: number }).distance.toFixed(1)}km`}
                        </span>
                      )}
                    </div>
                    {partner.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {partner.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Button
                    className="w-full gap-2"
                    variant="hero"
                    onClick={() => handleWhatsAppClick(partner.whatsapp, partner.name)}
                  >
                    <Phone className="w-4 h-4" />
                    Entrar em Contato
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">
              {partners && partners.length === 0
                ? "Ainda não há parceiros cadastrados."
                : useProximity && hasLocation
                ? `Nenhum parceiro encontrado em um raio de ${radiusKm}km.`
                : "Nenhum parceiro encontrado com os filtros selecionados."}
            </p>
          </motion.div>
        )}

        <RecommendPartnerModal
          open={isRecommendModalOpen}
          onOpenChange={setIsRecommendModalOpen}
        />
      </div>
    </section>
  );
};
