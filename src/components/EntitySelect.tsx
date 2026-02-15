import { useState, useRef, useEffect } from "react";
import { Building2, Plus, Check, ChevronDown, X } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { CityAutocomplete } from "./CityAutocomplete";
import { useEntities, Entity } from "@/hooks/useEntities";
import { cn } from "@/lib/utils";

interface EntitySelectProps {
  value: string | null;
  onChange: (entityId: string | null) => void;
}

export const EntitySelect = ({ value, onChange }: EntitySelectProps) => {
  const { entities, isLoading, createEntity } = useEntities();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newEntity, setNewEntity] = useState({ name: "", city: "" });
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedEntity = entities.find((e) => e.id === value);

  // Filter entities by search
  const filteredEntities = entities.filter((e) =>
    `${e.name} ${e.city}`.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowNewForm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateEntity = async () => {
    if (!newEntity.name.trim() || !newEntity.city.trim()) return;

    try {
      const created = await createEntity.mutateAsync({
        name: newEntity.name,
        city: newEntity.city,
      });
      onChange(created.id);
      setNewEntity({ name: "", city: "" });
      setShowNewForm(false);
      setIsOpen(false);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="text-foreground font-medium">
        Instituição Beneficente
      </Label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
            isOpen ? "border-primary" : "border-border hover:border-primary/50"
          )}
        >
          <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className={cn(
            "flex-1 truncate",
            selectedEntity ? "text-foreground" : "text-muted-foreground"
          )}>
            {selectedEntity 
              ? `${selectedEntity.name} - ${selectedEntity.city}`
              : value === null 
                ? "Ainda não definido"
                : "Selecione uma instituição..."}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            {!showNewForm ? (
              <>
                {/* Search */}
                <div className="p-2 border-b border-border">
                  <Input
                    placeholder="Buscar instituição..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Options */}
                <div className="max-h-48 overflow-y-auto">
                  {/* "Ainda não definido" option */}
                  <button
                    type="button"
                    onClick={() => {
                      onChange(null);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left",
                      value === null && "bg-primary/10"
                    )}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground italic">Ainda não definido</span>
                    {value === null && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>

                  {isLoading ? (
                    <div className="p-3 text-center text-muted-foreground text-sm">
                      Carregando...
                    </div>
                  ) : filteredEntities.length === 0 ? (
                    <div className="p-3 text-center text-muted-foreground text-sm">
                      Nenhuma instituição encontrada
                    </div>
                  ) : (
                    filteredEntities.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        onClick={() => {
                          onChange(entity.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left",
                          value === entity.id && "bg-primary/10"
                        )}
                      >
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-medium truncate">
                            {entity.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {entity.city}
                          </p>
                        </div>
                        {value === entity.id && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Add new button */}
                <div className="p-2 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => setShowNewForm(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Cadastrar nova instituição
                  </Button>
                </div>
              </>
            ) : (
              /* New entity form */
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Nova Instituição</h4>
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="p-1 hover:bg-muted rounded-md"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="entityName" className="text-sm">
                     Nome da Instituição
                   </Label>
                  <Input
                    id="entityName"
                    placeholder="Ex: Lar dos Idosos"
                    value={newEntity.name}
                    onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Cidade</Label>
                  <CityAutocomplete
                    value={newEntity.city}
                    onChange={(city) => setNewEntity({ ...newEntity, city })}
                    placeholder="Cidade da instituição"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowNewForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    onClick={handleCreateEntity}
                    disabled={!newEntity.name.trim() || !newEntity.city.trim() || createEntity.isPending}
                  >
                    {createEntity.isPending ? "Salvando..." : "Cadastrar"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Selecione a instituição que receberá as doações ou cadastre uma nova
      </p>
    </div>
  );
};
