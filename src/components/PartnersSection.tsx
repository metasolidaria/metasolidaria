import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { 
  MapPin, 
  Phone, 
  Star, 
  Search,
  Stethoscope,
  Apple,
  Instagram,
  Brain,
  Dumbbell,
  HeartPulse,
  Loader2,
  ShoppingCart,
  Navigation,
  X,
  UserPlus,
  Store,
  Building2,
  MoreHorizontal,
  Diamond,
  Crown,
  Medal,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { usePartners, PartnerTier } from "@/hooks/usePartners";
import { useGeolocation, calculateDistance } from "@/hooks/useGeolocation";
import { Slider } from "./ui/slider";
import { RecommendPartnerModal } from "./RecommendPartnerModal";
import { CitySearchAutocomplete } from "./CitySearchAutocomplete";
import { useUserProfile } from "@/hooks/useUserProfile";

// Configuração de tiers - apenas Ouro tem selo visível
const tierOrder: Record<PartnerTier, number> = {
  diamante: 1, // tratado como Ouro
  ouro: 1,
  apoiador: 2,
};

const allCategories = [
  { id: "all", label: "Todos", icon: Star },
  // Saúde
  { id: "Médico", label: "Médico", icon: Stethoscope },
  { id: "Dentista", label: "Dentista", icon: Stethoscope },
  { id: "Nutricionista", label: "Nutricionista", icon: Apple },
  { id: "Psicólogo", label: "Psicólogo", icon: Brain },
  { id: "Fisioterapeuta", label: "Fisioterapeuta", icon: HeartPulse },
  { id: "Clínica", label: "Clínica", icon: Building2 },
  { id: "Farmácia", label: "Farmácia", icon: HeartPulse },
  // Esporte e Bem-estar
  { id: "Personal Trainer", label: "Personal Trainer", icon: Dumbbell },
  { id: "Academia", label: "Academia", icon: Dumbbell },
  { id: "Clube", label: "Clube", icon: Dumbbell },
  // Alimentação
  { id: "Supermercado", label: "Supermercado", icon: ShoppingCart },
  { id: "Padaria", label: "Padaria", icon: Store },
  { id: "Açougue", label: "Açougue", icon: Store },
  { id: "Restaurante", label: "Restaurante", icon: Store },
  { id: "Lanchonete", label: "Lanchonete", icon: Store },
  { id: "Hamburgueria", label: "Hamburgueria", icon: Store },
  { id: "Cafeteria", label: "Cafeteria", icon: Store },
  { id: "Sorveteria", label: "Sorveteria", icon: Store },
  // Comércio e Varejo
  { id: "Loja de roupas", label: "Loja de roupas", icon: Store },
  { id: "Loja de calçados", label: "Loja de calçados", icon: Store },
  { id: "Loja de móveis", label: "Loja de móveis", icon: Store },
  { id: "Loja de eletro", label: "Loja de eletro", icon: Store },
  { id: "Loja de brinquedos", label: "Loja de brinquedos", icon: Store },
  { id: "Loja de cama, mesa e banho", label: "Loja de cama, mesa e banho", icon: Store },
  { id: "Comércio", label: "Comércio", icon: Store },
  // Construção e Imóveis
  { id: "Material de Construção", label: "Material de Construção", icon: Building2 },
  { id: "Imobiliária", label: "Imobiliária", icon: Building2 },
  { id: "Corretor", label: "Corretor", icon: UserPlus },
  // Automotivo
  { id: "Mecânico", label: "Mecânico", icon: Store },
  { id: "Auto peças", label: "Auto peças", icon: Store },
  { id: "Despachante", label: "Despachante", icon: Store },
  // Serviços e Empresas
  { id: "Advogado", label: "Advogado", icon: Brain },
  { id: "Contador", label: "Contador", icon: Brain },
  { id: "Consultor", label: "Consultor", icon: Brain },
  { id: "Empresa", label: "Empresa", icon: Building2 },
  { id: "Indústria", label: "Indústria", icon: Building2 },
  // Rural
  { id: "Agropecuária", label: "Agropecuária", icon: Store },
  // Pet
  { id: "Veterinário", label: "Veterinário", icon: HeartPulse },
  { id: "Pet Shop", label: "Pet Shop", icon: Store },
  // Mídia e Influência
  { id: "Jornal", label: "Jornal", icon: Building2 },
  { id: "Emissora", label: "Emissora", icon: Building2 },
  { id: "Influencer", label: "Influencer", icon: Star },
  { id: "Jogador", label: "Jogador", icon: Star },
  { id: "Político", label: "Político", icon: UserPlus },
  { id: "Personalidade", label: "Personalidade", icon: Star },
  // Outros
  { id: "Outros", label: "Outros", icon: MoreHorizontal },
];

import logoImage from "@/assets/logo.jpg";
import naturuaiLogo from "@/assets/naturuai-logo.jpg";

const ITEMS_PER_PAGE = 10;

export const PartnersSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchCity, setSearchCity] = useState("");
  const [radiusKm, setRadiusKm] = useState(50);
  const [useProximity, setUseProximity] = useState(false);
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { partners, isLoading } = usePartners();
  const { latitude, longitude, loading: geoLoading, error: geoError, requestLocation, hasLocation } = useGeolocation();
  const { profile } = useUserProfile();

  const handleEnableProximity = () => {
    if (!hasLocation) {
      requestLocation();
    }
    setUseProximity(true);
  };

  const handleDisableProximity = () => {
    setUseProximity(false);
  };

  // Função para normalizar texto (remover acentos)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Extrair apenas o nome da cidade (sem o estado)
  const extractCityName = (cityWithState: string) => {
    return cityWithState.split(",")[0].trim();
  };

  // Filtrar categorias disponíveis baseado na cidade selecionada
  const availableCategories = useMemo(() => {
    if (!searchCity) {
      return allCategories;
    }
    
    const partnersInCity = (partners || []).filter((partner) =>
      partner.city.toLowerCase().includes(searchCity.toLowerCase())
    );
    
    const specialtiesInCity = new Set(partnersInCity.map((p) => p.specialty));
    
    return allCategories.filter(
      (cat) => cat.id === "all" || specialtiesInCity.has(cat.id)
    );
  }, [partners, searchCity]);

  // Reset categoria se ela não estiver mais disponível
  useMemo(() => {
    if (selectedCategory !== "all" && !availableCategories.find(c => c.id === selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [availableCategories, selectedCategory]);

  const filteredAndSortedPartners = useMemo(() => {
    let result = (partners || []).filter((partner) => {
      const matchesCategory =
        selectedCategory === "all" || partner.specialty === selectedCategory;
      const matchesCity =
        !searchCity ||
        partner.city.toLowerCase().includes(searchCity.toLowerCase());
      return matchesCategory && matchesCity;
    });

    // Caso 1: Proximidade ativa COM localização permitida
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
          // Quando proximidade está ativa, mostrar APENAS parceiros com coordenadas dentro do raio
          if (partner.distance === null) return false;
          return partner.distance <= radiusKm;
        })
        .sort((a, b) => {
          // Primeiro por tier, depois por distância
          const tierA = tierOrder[a.tier] || 3;
          const tierB = tierOrder[b.tier] || 3;
          if (tierA !== tierB) return tierA - tierB;
          
          // Ordenar por distância
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }
    // Caso 2: Proximidade ativa MAS localização negada - usar cidade do perfil
    else if (useProximity && geoError && profile?.city) {
      const userCityNormalized = normalizeText(extractCityName(profile.city));
      result = result
        .filter((partner) => 
          normalizeText(partner.city).includes(userCityNormalized)
        )
        .sort((a, b) => {
          const tierA = tierOrder[a.tier] || 3;
          const tierB = tierOrder[b.tier] || 3;
          return tierA - tierB;
        });
    }
    // Caso 3: Sem filtro de proximidade ou sem dados disponíveis
    else if (!useProximity) {
      result = result.sort((a, b) => {
        const tierA = tierOrder[a.tier] || 3;
        const tierB = tierOrder[b.tier] || 3;
        return tierA - tierB;
      });
    }

    return result;
  }, [partners, selectedCategory, searchCity, useProximity, hasLocation, latitude, longitude, radiusKm, geoError, profile?.city]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedPartners.length / ITEMS_PER_PAGE);
  const paginatedPartners = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedPartners.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedPartners, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchCity, useProximity, radiusKm]);

  const handleWhatsAppClick = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${name}! Encontrei seu contato no Meta Solidária.`
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
            <div className="flex-1 max-w-md">
              <CitySearchAutocomplete
                value={searchCity}
                onChange={setSearchCity}
                placeholder="Buscar por cidade..."
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

          {/* Feedback de filtragem por cidade */}
          {useProximity && geoError && profile?.city && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  Mostrando parceiros de <strong>{extractCityName(profile.city)}</strong> (cidade do seu cadastro)
                </span>
              </div>
            </motion.div>
          )}

          {/* Erro de geolocalização sem cidade de fallback */}
          {geoError && useProximity && !profile?.city && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {geoError}. Você pode buscar por cidade ou fazer login para usar a cidade do seu perfil.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
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
        ) : paginatedPartners.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 ${
                    (partner.tier === 'ouro' || partner.tier === 'diamante') ? 'ring-2 ring-yellow-500/50' : ''
                  }`}
                >
                  {/* Badge de Tier - apenas Ouro (inclui diamante) */}
                  {(partner.tier === 'ouro' || partner.tier === 'diamante') && (
                    <div className="px-5 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500 text-yellow-900">
                        <Crown className="w-3 h-3" />
                        Ouro
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-4 p-5 pt-3">
                    <img
                      src={partner.name === 'NaturUai' ? naturuaiLogo : logoImage}
                      alt={partner.name}
                      className="w-20 h-20 rounded-xl object-contain bg-white p-2"
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

                  <div className="px-5 pb-5 flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      variant="hero"
                      onClick={() => handleWhatsAppClick(partner.whatsapp, partner.name)}
                    >
                      <Phone className="w-4 h-4" />
                      Entrar em Contato
                    </Button>
                    {partner.instagram && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(`https://instagram.com/${partner.instagram}`, "_blank")}
                        title="Ver Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({filteredAndSortedPartners.length} parceiros)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
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
                ? `Nenhum parceiro com localização cadastrada encontrado em um raio de ${radiusKm}km.`
                : useProximity && geoError && profile?.city
                ? `Nenhum parceiro encontrado em ${extractCityName(profile.city)}.`
                : useProximity && geoError && !profile?.city
                ? "Não foi possível determinar sua localização. Faça login e cadastre sua cidade."
                : "Nenhum parceiro encontrado com os filtros selecionados."}
            </p>
            {useProximity && (hasLocation || (geoError && profile?.city)) && (
              <p className="text-muted-foreground text-sm mt-2">
                Tente {hasLocation ? "aumentar o raio ou " : ""}desativar o filtro de proximidade para ver todos os parceiros.
              </p>
            )}
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
