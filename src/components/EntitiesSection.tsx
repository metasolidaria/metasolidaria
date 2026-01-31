import { useState, useMemo } from "react";
import { Building2, Plus, MapPin, Loader2, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useEntities } from "@/hooks/useEntities";
import { useAuth } from "@/hooks/useAuth";
import { CityAutocomplete } from "./CityAutocomplete";
import { CitySearchAutocomplete } from "./CitySearchAutocomplete";

interface EntitiesSectionProps {
  onRequireAuth: () => void;
}

export const EntitiesSection = ({ onRequireAuth }: EntitiesSectionProps) => {
  const { entities, isLoading, createEntity } = useEntities();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntity, setNewEntity] = useState({ name: "", city: "", phone: "" });
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
      });
      setNewEntity({ name: "", city: "", phone: "" });
      setIsModalOpen(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Entidades Beneficiárias
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Organizações que recebem as doações dos grupos solidários
          </p>
          <Button onClick={handleOpenModal} size="lg">
            <Plus className="w-5 h-5" />
            Cadastrar Entidade
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
              Busque por uma cidade ou clique em "Ver Todas" para visualizar as entidades cadastradas.
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
              Nenhuma entidade cadastrada ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Seja o primeiro a cadastrar uma entidade beneficiária!
            </p>
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <Search className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma entidade encontrada em "{searchCity}".
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Nova Entidade Beneficiária
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="entity-name">Nome da Entidade</Label>
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
              <Label>Cidade</Label>
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
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setNewEntity({ name: "", city: "", phone: "" });
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
