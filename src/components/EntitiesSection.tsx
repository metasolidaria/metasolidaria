import { useState, useMemo } from "react";
import { Building2, Plus, MapPin, Loader2, Search, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useEntities, DONATION_OPTIONS } from "@/hooks/useEntities";
import { useAuth } from "@/hooks/useAuth";
import { CityAutocomplete } from "./CityAutocomplete";
import { CitySearchAutocomplete } from "./CitySearchAutocomplete";

interface EntitiesSectionProps {
  onRequireAuth: () => void;
}

interface NewEntityState {
  name: string;
  city: string;
  phone: string;
  accepted_donations: string[];
  observations: string;
}

const initialEntityState: NewEntityState = {
  name: "",
  city: "",
  phone: "",
  accepted_donations: [],
  observations: "",
};

export const EntitiesSection = ({ onRequireAuth }: EntitiesSectionProps) => {
  const { entities, isLoading, createEntity } = useEntities();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntity, setNewEntity] = useState<NewEntityState>(initialEntityState);
  const [searchCity, setSearchCity] = useState("");
  const [showAll, setShowAll] = useState(false);

  const shouldShowEntities = showAll || searchCity.trim().length > 0;

  const filteredEntities = useMemo(() => {
    if (!searchCity.trim()) return entities;
    return entities.filter((entity) =>
      entity.city.toLowerCase().includes(searchCity.toLowerCase())
    );
  }, [entities, searchCity]);

  const handleOpenModal = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateEntity = async () => {
    if (!newEntity.name.trim() || !newEntity.city.trim()) return;

    try {
      await createEntity.mutateAsync({
        name: newEntity.name,
        city: newEntity.city,
        phone: newEntity.phone,
        accepted_donations: newEntity.accepted_donations,
        observations: newEntity.observations,
      });
      setNewEntity(initialEntityState);
      setIsModalOpen(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const toggleDonation = (value: string) => {
    setNewEntity((prev) => ({
      ...prev,
      accepted_donations: prev.accepted_donations.includes(value)
        ? prev.accepted_donations.filter((d) => d !== value)
        : [...prev.accepted_donations, value],
    }));
  };

  const getDonationLabel = (value: string) => {
    return DONATION_OPTIONS.find((opt) => opt.value === value)?.label || value;
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Instituições Beneficentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Organizações que recebem as doações dos grupos solidários
          </p>
          <Button onClick={handleOpenModal} size="lg">
            <Plus className="w-5 h-5" />
            Cadastrar Instituição
          </Button>

          {/* Filtro por cidade */}
          <div className="max-w-md mx-auto mt-6">
            <CitySearchAutocomplete
              value={searchCity}
              onChange={setSearchCity}
              placeholder="Buscar por cidade..."
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !shouldShowEntities ? (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Busque por uma cidade ou clique em "Ver Todas" para visualizar as instituições cadastradas.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
              className="mt-4"
            >
              Ver Todas
            </Button>
          </div>
        ) : entities.length === 0 ? (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma instituição cadastrada ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Seja o primeiro a cadastrar uma instituição beneficente!
            </p>
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma instituição encontrada em "{searchCity}".
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Tente buscar por outra cidade.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEntities.map((entity, index) => (
              <div
                key={entity.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-400"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="h-full hover:shadow-soft transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {entity.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{entity.city}</span>
                        </div>
                        
                        {/* Tipos de doação aceitos */}
                        {entity.accepted_donations && entity.accepted_donations.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                              <Package className="w-3 h-3" />
                              <span>Aceita:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {entity.accepted_donations.slice(0, 3).map((donation) => (
                                <Badge key={donation} variant="secondary" className="text-xs">
                                  {getDonationLabel(donation)}
                                </Badge>
                              ))}
                              {entity.accepted_donations.length > 3 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs cursor-help">
                                        +{entity.accepted_donations.length - 3}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="flex flex-col gap-1">
                                        {entity.accepted_donations.slice(3).map((donation) => (
                                          <span key={donation}>{getDonationLabel(donation)}</span>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Observações */}
                        {entity.observations && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 cursor-help">
                                  {entity.observations}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{entity.observations}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Nova Instituição Beneficente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="entity-name">Nome da Instituição *</Label>
              <Input
                id="entity-name"
                placeholder="Ex: Lar dos Idosos"
                value={newEntity.name}
                onChange={(e) =>
                  setNewEntity((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade *</Label>
              <CityAutocomplete
                value={newEntity.city}
                onChange={(city) =>
                  setNewEntity((prev) => ({ ...prev, city }))
                }
                placeholder="Digite a cidade..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-phone">Telefone (opcional)</Label>
              <Input
                id="entity-phone"
                placeholder="(00) 00000-0000"
                value={newEntity.phone}
                onChange={(e) =>
                  setNewEntity((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            {/* Tipos de doação aceitos */}
            <div className="space-y-3">
              <Label>O que a instituição aceita receber? (opcional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {DONATION_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`donation-${option.value}`}
                      checked={newEntity.accepted_donations.includes(option.value)}
                      onCheckedChange={() => toggleDonation(option.value)}
                    />
                    <Label
                      htmlFor={`donation-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="entity-observations">Observações (opcional)</Label>
              <Textarea
                id="entity-observations"
                placeholder="Ex: Aceita apenas arroz e macarrão, prefere roupas de inverno..."
                value={newEntity.observations}
                onChange={(e) =>
                  setNewEntity((prev) => ({ ...prev, observations: e.target.value }))
                }
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setNewEntity(initialEntityState);
                  setIsModalOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateEntity}
                disabled={
                  !newEntity.name.trim() ||
                  !newEntity.city.trim() ||
                  createEntity.isPending
                }
              >
                {createEntity.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
