import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const CityAutocomplete = ({
  value,
  onChange,
  placeholder = "Digite o nome da cidade",
  required = false,
  className,
}: CityAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<{ nome: string; uf: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all cities once on mount
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Filter cities based on query
  useEffect(() => {
    if (!query || query.length < 2) {
      setFilteredCities([]);
      return;
    }

    const normalizedQuery = query
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
      .slice(0, 10)
      .map((city) => ({
        nome: city.nome,
        uf: city.microrregiao.mesorregiao.UF.sigla,
      }));

    setFilteredCities(filtered);
    setSelectedIndex(-1);
  }, [query, cities]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (cityName: string, uf: string) => {
      const formatted = `${cityName}, ${uf}`;
      setQuery(formatted);
      onChange(formatted);
      setIsOpen(false);
      setFilteredCities([]);
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setIsOpen(true);
    // Only update parent if user is typing (not from selection)
    if (!filteredCities.some(c => `${c.nome}, ${c.uf}` === newValue)) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredCities.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const city = filteredCities[selectedIndex];
          handleSelect(city.nome, city.uf);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
      <Input
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("pl-11", className)}
        required={required}
        autoComplete="off"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
      )}

      {/* Dropdown */}
      {isOpen && filteredCities.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredCities.map((city, index) => (
            <button
              key={`${city.nome}-${city.uf}`}
              type="button"
              onClick={() => handleSelect(city.nome, city.uf)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors",
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{city.nome}</span>
                <span className="text-muted-foreground">{city.uf}</span>
              </span>
              {`${city.nome}, ${city.uf}` === value && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && filteredCities.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-3 text-sm text-muted-foreground">
          Nenhuma cidade encontrada
        </div>
      )}
    </div>
  );
};
