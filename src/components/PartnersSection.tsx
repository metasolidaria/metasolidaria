import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  Info,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Handshake
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  premium: 1, // tratado como Ouro
  ouro: 1,
  apoiador: 2,
};

const allCategories = [
  { id: "all", label: "Todos", icon: Star },
  { id: "Academia", label: "Academia", icon: Dumbbell },
  { id: "Açougue", label: "Açougue", icon: Store },
  { id: "Advogado", label: "Advogado", icon: Brain },
  { id: "Agropecuária", label: "Agropecuária", icon: Store },
  { id: "Auto peças", label: "Auto peças", icon: Store },
  { id: "Cafeteria", label: "Cafeteria", icon: Store },
  { id: "Clínica", label: "Clínica", icon: Building2 },
  { id: "Clube", label: "Clube", icon: Dumbbell },
  { id: "Comércio", label: "Comércio", icon: Store },
  { id: "Contador", label: "Contador", icon: Brain },
  { id: "Consultor", label: "Consultor", icon: Brain },
  { id: "Corretor", label: "Corretor", icon: UserPlus },
  { id: "Dentista", label: "Dentista", icon: Stethoscope },
  { id: "Despachante", label: "Despachante", icon: Store },
  { id: "Emissora", label: "Emissora", icon: Building2 },
  { id: "Empresa", label: "Empresa", icon: Building2 },
  { id: "Farmácia", label: "Farmácia", icon: HeartPulse },
  { id: "Fisioterapeuta", label: "Fisioterapeuta", icon: HeartPulse },
  { id: "Hamburgueria", label: "Hamburgueria", icon: Store },
  { id: "Imobiliária", label: "Imobiliária", icon: Building2 },
  { id: "Indústria", label: "Indústria", icon: Building2 },
  { id: "Influencer", label: "Influencer", icon: Star },
  { id: "Jogador", label: "Jogador", icon: Star },
  { id: "Jornal", label: "Jornal", icon: Building2 },
  { id: "Lanchonete", label: "Lanchonete", icon: Store },
  { id: "Loja de brinquedos", label: "Loja de brinquedos", icon: Store },
  { id: "Loja de calçados", label: "Loja de calçados", icon: Store },
  { id: "Loja de cama, mesa e banho", label: "Loja de cama, mesa e banho", icon: Store },
  { id: "Loja de eletro", label: "Loja de eletro", icon: Store },
  { id: "Loja de móveis", label: "Loja de móveis", icon: Store },
  { id: "Loja de roupas", label: "Loja de roupas", icon: Store },
  { id: "Material de Construção", label: "Material de Construção", icon: Building2 },
  { id: "Mecânico", label: "Mecânico", icon: Store },
  { id: "Médico", label: "Médico", icon: Stethoscope },
  { id: "Nutricionista", label: "Nutricionista", icon: Apple },
  { id: "Padaria", label: "Padaria", icon: Store },
  { id: "Personal Trainer", label: "Personal Trainer", icon: Dumbbell },
  { id: "Personalidade", label: "Personalidade", icon: Star },
  { id: "Pet Shop", label: "Pet Shop", icon: Store },
  { id: "Político", label: "Político", icon: UserPlus },
  { id: "Psicólogo", label: "Psicólogo", icon: Brain },
  { id: "Restaurante", label: "Restaurante", icon: Store },
  { id: "Sorveteria", label: "Sorveteria", icon: Store },
  { id: "Supermercado", label: "Supermercado", icon: ShoppingCart },
  { id: "Veterinário", label: "Veterinário", icon: HeartPulse },
  { id: "Outros", label: "Outros", icon: MoreHorizontal },
];

import logoImage from "@/assets/logo.jpg";
import naturuaiLogo from "@/assets/naturuai-logo.jpg";

const ITEMS_PER_PAGE = 10;

// Component for collapsible category filters
interface CategoryFiltersProps {
  categories: typeof allCategories;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

const CategoryFilters = ({ categories, selectedCategory, onSelectCategory }: CategoryFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Find the selected category label
  const selectedLabel = categories.find(c => c.id === selectedCategory)?.label || "Todos";
  const selectedIcon = categories.find(c => c.id === selectedCategory)?.icon || Star;
  const SelectedIcon = selectedIcon;
  
  // Count of available categories (excluding "all")
  const categoryCount = categories.length - 1;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between gap-2 h-auto py-3"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Categoria:</span>
            <span className="font-medium flex items-center gap-1">
              <SelectedIcon className="w-4 h-4" />
              {selectedLabel}
            </span>
            {categoryCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({categoryCount} disponíveis)
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 p-4 bg-card rounded-lg border border-border animate-in fade-in duration-200">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  onSelectCategory(category.id);
                  setIsOpen(false);
                }}
                className="gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const PartnersSection = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchCity, setSearchCity] = useState("");
  const [cityFromGroup, setCityFromGroup] = useState(false);
  const [groupOrigin, setGroupOrigin] = useState<{ id: string; name: string } | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);
  const [useProximity, setUseProximity] = useState(false);
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { partners, isLoading } = usePartners();
  const { latitude, longitude, loading: geoLoading, error: geoError, requestLocation, hasLocation } = useGeolocation();
  const { profile } = useUserProfile();

  // Initialize city filter from URL param
  useEffect(() => {
    const cidadeParam = searchParams.get("cidade");
    const parceirosParam = searchParams.get("parceiros");
    const grupoIdParam = searchParams.get("grupoId");
    const grupoNomeParam = searchParams.get("grupoNome");
    
    if (cidadeParam && parceirosParam === "true" && !searchCity) {
      setSearchCity(cidadeParam);
      setCityFromGroup(true);
      if (grupoIdParam && grupoNomeParam) {
        setGroupOrigin({ id: grupoIdParam, name: grupoNomeParam });
      }
    }
  }, [searchParams]);

  // Clear "from group" indicator when user manually changes the city
  const handleCityChange = (newCity: string) => {
    setSearchCity(newCity);
    setCityFromGroup(false);
  };

  const handleClearCity = () => {
    setSearchCity("");
    setCityFromGroup(false);
    setGroupOrigin(null);
  };

  const handleEnableProximity = () => {
    if (!hasLocation) {
      requestLocation();
    }
    setUseProximity(true);
  };

  const handleDisableProximity = () => {
    setUseProximity(false);
  };

  // Lista de estados brasileiros para detectar parceiros estaduais
  const brazilianStates: Record<string, string> = {
    "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM",
    "Bahia": "BA", "Ceará": "CE", "Distrito Federal": "DF", "Espírito Santo": "ES",
    "Goiás": "GO", "Maranhão": "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS",
    "Minas Gerais": "MG", "Pará": "PA", "Paraíba": "PB", "Paraná": "PR",
    "Pernambuco": "PE", "Piauí": "PI", "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN",
    "Rio Grande do Sul": "RS", "Rondônia": "RO", "Roraima": "RR", "Santa Catarina": "SC",
    "São Paulo": "SP", "Sergipe": "SE", "Tocantins": "TO"
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

  // Extrair sigla do estado de uma cidade (ex: "Belo Horizonte, MG" -> "MG")
  const extractStateFromCity = (cityWithState: string) => {
    const parts = cityWithState.split(",");
    return parts.length > 1 ? parts[1].trim().toUpperCase() : null;
  };

  // Verificar se o parceiro é nacional (Brasil)
  const isNationwidePartner = (partnerCity: string) => {
    const normalized = normalizeText(partnerCity.trim());
    return normalized === "brasil";
  };

  // Verificar se o parceiro é estadual (cidade = nome do estado)
  const isStatewidePartner = (partnerCity: string) => {
    const normalized = normalizeText(partnerCity.trim());
    return Object.keys(brazilianStates).some(state => normalizeText(state) === normalized);
  };

  // Obter sigla do estado de um parceiro estadual
  const getStatewidePartnerState = (partnerCity: string) => {
    const normalized = normalizeText(partnerCity.trim());
    const state = Object.entries(brazilianStates).find(([name]) => normalizeText(name) === normalized);
    return state ? state[1] : null;
  };

  // Filtrar categorias disponíveis baseado na cidade selecionada
  const availableCategories = useMemo(() => {
    if (!searchCity) {
      return allCategories;
    }
    
    const searchStateAbbr = extractStateFromCity(searchCity);
    
    const partnersInCity = (partners || []).filter((partner) => {
      // Parceiro nacional (Brasil) - aparece em todas as cidades
      if (isNationwidePartner(partner.city)) {
        return true;
      }
      // Parceiro estadual
      if (isStatewidePartner(partner.city)) {
        const partnerStateAbbr = getStatewidePartnerState(partner.city);
        return partnerStateAbbr === searchStateAbbr;
      }
      // Parceiro normal
      return partner.city.toLowerCase().includes(searchCity.toLowerCase());
    });
    
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
      
      // Lógica de filtragem por cidade/estado
      let matchesCity = true;
      if (searchCity) {
        const searchCityLower = searchCity.toLowerCase();
        const searchStateAbbr = extractStateFromCity(searchCity);
        
        // Verifica se o parceiro é nacional (Brasil)
        if (isNationwidePartner(partner.city)) {
          matchesCity = true; // Aparece em todas as cidades
        }
        // Verifica se o parceiro é estadual
        else if (isStatewidePartner(partner.city)) {
          const partnerStateAbbr = getStatewidePartnerState(partner.city);
          // Parceiro estadual aparece se a busca é por uma cidade do mesmo estado
          matchesCity = partnerStateAbbr === searchStateAbbr;
        } else {
          // Parceiro normal: busca padrão por cidade
          matchesCity = partner.city.toLowerCase().includes(searchCityLower);
        }
      }
      
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
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        </div>

        {/* Filters */}
        <div
          className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <CitySearchAutocomplete
                  value={searchCity}
                  onChange={handleCityChange}
                  placeholder="Buscar por cidade..."
                />
                {searchCity && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCity}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {cityFromGroup && searchCity && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                    <MapPin className="w-3 h-3" />
                    Filtrado pelo grupo
                  </span>
                  {groupOrigin && (
                    <a
                      href={`/grupo/${groupOrigin.id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full hover:bg-secondary/80 transition-colors shadow-sm"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <Handshake className="w-3 h-3" />
                      Voltar para {groupOrigin.name}
                    </a>
                  )}
                </div>
              )}
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
            <div className="mb-6 p-4 bg-card rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-300">
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
            </div>
          )}

          {/* Feedback de filtragem por cidade */}
          {useProximity && geoError && profile?.city && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  Mostrando parceiros de <strong>{extractCityName(profile.city)}</strong> (cidade do seu cadastro)
                </span>
              </div>
            </div>
          )}

          {/* Erro de geolocalização sem cidade de fallback */}
          {geoError && useProximity && !profile?.city && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {geoError}. Você pode buscar por cidade ou fazer login para usar a cidade do seu perfil.
            </div>
          )}

          {/* Collapsible Category Filters */}
          <CategoryFilters
            categories={availableCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Partners Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : paginatedPartners.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPartners.map((partner, index) => (
                <div
                  key={partner.id}
                  className={`bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-400 ${
                    (partner.tier === 'ouro' || partner.tier === 'premium') ? 'ring-2 ring-yellow-500/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Badge de Tier - apenas Ouro (inclui premium) */}
                  {(partner.tier === 'ouro' || partner.tier === 'premium') && (
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
                </div>
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
          <div className="text-center py-12 animate-in fade-in duration-300">
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
          </div>
        )}

        <RecommendPartnerModal
          open={isRecommendModalOpen}
          onOpenChange={setIsRecommendModalOpen}
        />
      </div>
    </section>
  );
};
