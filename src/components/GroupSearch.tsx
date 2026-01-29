import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Lock, Globe, Loader2, UserPlus, Users, CheckCircle2, MapPin, X, Clock } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SearchGroup {
  id: string;
  name: string;
  city: string;
  leader_name: string | null;
  is_private: boolean;
  description: string | null;
}

interface City {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
      };
    };
  };
}

interface GroupSearchProps {
  onRequireAuth: () => void;
  userMemberships: string[];
}

type SearchType = "name" | "city";

export const GroupSearch = ({ onRequireAuth, userMemberships }: GroupSearchProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { joinGroup } = useGroups();
  
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchGroup[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [actionGroupId, setActionGroupId] = useState<string | null>(null);
  const [pendingRequestGroupIds, setPendingRequestGroupIds] = useState<string[]>([]);
  
  // City autocomplete state
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<{ nome: string; uf: string }[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedCityIndex, setSelectedCityIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch pending join requests for current user
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user) {
        setPendingRequestGroupIds([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("group_join_requests")
          .select("group_id")
          .eq("user_id", user.id)
          .eq("status", "pending");
        
        if (error) throw error;
        
        setPendingRequestGroupIds((data || []).map(r => r.group_id));
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };
    
    fetchPendingRequests();
  }, [user]);

  // Fetch cities on mount for city search
  useEffect(() => {
    const fetchCities = async () => {
      setIsCitiesLoading(true);
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"
        );
        if (response.ok) {
          const data: City[] = await response.json();
          setCities(data);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setIsCitiesLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Filter cities for autocomplete
  useEffect(() => {
    if (searchType !== "city" || !searchQuery || searchQuery.length < 2) {
      setFilteredCities([]);
      return;
    }

    const normalizedQuery = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const filtered = cities
      .filter((city) => {
        const normalizedName = city.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return normalizedName.includes(normalizedQuery);
      })
      .slice(0, 8)
      .map((city) => ({
        nome: city.nome,
        uf: city.microrregiao.mesorregiao.UF.sigla,
      }));

    setFilteredCities(filtered);
    setSelectedCityIndex(-1);
  }, [searchQuery, cities, searchType]);

  // Handle click outside for city dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search when type changes
  useEffect(() => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setIsCityDropdownOpen(false);
  }, [searchType]);

  const handleSearch = async (cityOverride?: string) => {
    const query = cityOverride || searchQuery.trim();
    
    if (!query || query.length < 3) {
      toast({
        title: "Busca inválida",
        description: "Digite pelo menos 3 caracteres para buscar.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setIsCityDropdownOpen(false);

    try {
      // Buscar grupos usando view pública que ignora RLS
      const columnToSearch = searchType === "name" ? "name" : "city";
      const { data, error } = await supabase
        .from("groups_search" as any)
        .select("id, name, city, leader_name, is_private, description")
        .ilike(columnToSearch, `%${query}%`)
        .limit(15);

      if (error) throw error;

      // Cast para o tipo correto - mostrar todos os grupos encontrados
      const results = (data || []) as unknown as SearchGroup[];
      setSearchResults(results);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar grupos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCitySelect = (cityName: string) => {
    setSearchQuery(cityName);
    setIsCityDropdownOpen(false);
    handleSearch(cityName);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setIsCityDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleJoinPublicGroup = async (groupId: string, groupName: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    setActionGroupId(groupId);

    try {
      const profile = user.user_metadata;
      await joinGroup.mutateAsync({
        groupId,
        name: profile?.full_name || user.email || "Membro",
      });

      // Remover grupo da lista e navegar
      setSearchResults((prev) => prev.filter((g) => g.id !== groupId));
      navigate(`/grupo/${groupId}`);
    } catch (error: any) {
      // Error handled by mutation
    } finally {
      setActionGroupId(null);
    }
  };

  const handleRequestJoin = async (groupId: string, groupName: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    setActionGroupId(groupId);

    try {
      // Verificar se já existe solicitação pendente
      const { data: existingRequest } = await supabase
        .from("group_join_requests")
        .select("id, status")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === "pending") {
          toast({
            title: "Solicitação já enviada",
            description: "Aguarde a aprovação do líder do grupo.",
          });
        } else if (existingRequest.status === "rejected") {
          toast({
            title: "Solicitação rejeitada",
            description: "Sua solicitação anterior foi rejeitada pelo líder.",
            variant: "destructive",
          });
        } else if (existingRequest.status === "approved") {
          toast({
            title: "Já aprovado!",
            description: "Sua solicitação já foi aprovada. Recarregue a página.",
          });
        }
        return;
      }

      // Obter nome do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const userName = profile?.full_name || user.user_metadata?.full_name || user.email || "Usuário";

      // Criar solicitação
      const { error } = await supabase
        .from("group_join_requests")
        .insert({
          group_id: groupId,
          user_id: user.id,
          user_name: userName,
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada! 📨",
        description: `Sua solicitação para entrar em "${groupName}" foi enviada ao líder.`,
      });

      // Adicionar grupo à lista de pendentes
      setPendingRequestGroupIds((prev) => [...prev, groupId]);
    } catch (error: any) {
      console.error("Erro ao solicitar entrada:", error);
      toast({
        title: "Erro ao solicitar entrada",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setActionGroupId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchType === "city" && isCityDropdownOpen && filteredCities.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedCityIndex((prev) =>
            prev < filteredCities.length - 1 ? prev + 1 : prev
          );
          return;
        case "ArrowUp":
          e.preventDefault();
          setSelectedCityIndex((prev) => (prev > 0 ? prev - 1 : 0));
          return;
        case "Enter":
          e.preventDefault();
          if (selectedCityIndex >= 0) {
            handleCitySelect(filteredCities[selectedCityIndex].nome);
          }
          return;
        case "Escape":
          setIsCityDropdownOpen(false);
          return;
      }
    }
    
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Buscar Grupo
            </span>
          </div>
          
          <ToggleGroup 
            type="single" 
            value={searchType} 
            onValueChange={(value) => value && setSearchType(value as SearchType)}
            className="bg-background border rounded-lg p-0.5"
          >
            <ToggleGroupItem 
              value="name" 
              size="sm"
              className="text-xs px-2 py-1 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Por Nome
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="city" 
              size="sm"
              className="text-xs px-2 py-1 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Por Cidade
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex gap-2" ref={containerRef}>
          <div className="relative flex-1">
            {searchType === "city" && (
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            )}
            <Input
              ref={inputRef}
              placeholder={searchType === "name" ? "Digite o nome do grupo..." : "Digite a cidade..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (searchType === "city") {
                  setIsCityDropdownOpen(true);
                }
              }}
              onFocus={() => {
                if (searchType === "city" && searchQuery.length >= 2) {
                  setIsCityDropdownOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              className={cn("flex-1", searchType === "city" && "pl-10 pr-8")}
            />
            {searchType === "city" && searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* City autocomplete dropdown */}
            {searchType === "city" && isCityDropdownOpen && filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city.nome}-${city.uf}`}
                    type="button"
                    onClick={() => handleCitySelect(city.nome)}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors",
                      index === selectedCityIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{city.nome}</span>
                    <span className="text-muted-foreground text-xs">{city.uf}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSearch()}
            disabled={isSearching || isCitiesLoading}
            aria-label="Buscar grupos"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Resultados da busca */}
        {hasSearched && (
          <div className="mt-3 space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg border gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {group.description ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => navigate(`/grupo/${group.id}`)}
                              className="font-medium text-foreground truncate hover:text-primary hover:underline transition-colors text-left"
                            >
                              {group.name}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{group.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate(`/grupo/${group.id}`)}
                          className="font-medium text-foreground truncate hover:text-primary hover:underline transition-colors text-left"
                        >
                          {group.name}
                        </button>
                      )}
                      {userMemberships.includes(group.id) && (
                        <span className="shrink-0 bg-emerald-500/90 px-1.5 py-0.5 rounded text-[10px] text-white flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Membro
                        </span>
                      )}
                      {group.is_private ? (
                        <span className="shrink-0 bg-secondary/80 px-1.5 py-0.5 rounded text-[10px] text-secondary-foreground flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          Privado
                        </span>
                      ) : (
                        <span className="shrink-0 bg-primary/80 px-1.5 py-0.5 rounded text-[10px] text-primary-foreground flex items-center gap-0.5">
                          <Globe className="w-2.5 h-2.5" />
                          Público
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {group.city} • Líder: {group.leader_name || "Não informado"}
                    </p>
                  </div>
                  
                  {userMemberships.includes(group.id) ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled
                      className="shrink-0 text-muted-foreground"
                    >
                      Já participa
                    </Button>
                  ) : pendingRequestGroupIds.includes(group.id) ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled
                      className="shrink-0 text-amber-600"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Pendente
                    </Button>
                  ) : group.is_private ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestJoin(group.id, group.name)}
                      disabled={actionGroupId === group.id}
                      className="shrink-0"
                    >
                      {actionGroupId === group.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Solicitar
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleJoinPublicGroup(group.id, group.name)}
                      disabled={actionGroupId === group.id}
                      className="shrink-0"
                    >
                      {actionGroupId === group.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Users className="w-4 h-4 mr-1" />
                          Participar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhum grupo encontrado com esse nome.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
