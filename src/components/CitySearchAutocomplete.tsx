import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2, X, MapPin } from "lucide-react";
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

interface CitySearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CitySearchAutocomplete = ({
  value,
  onChange,
  placeholder = "Buscar por cidade...",
  className,
}: CitySearchAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<{ nome: string; uf: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasFetched, setHasFetched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch cities only when user focuses on input (deferred loading)
  const fetchCities = useCallback(async () => {
    if (hasFetched || isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"
      );
      if (response.ok) {
        const data: City[] = await response.json();
        setCities(data);
        setHasFetched(true);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched, isLoading]);

  // Sync query with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

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
    (cityName: string) => {
      setQuery(cityName);
      onChange(cityName);
      setIsOpen(false);
      setFilteredCities([]);
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setIsOpen(true);
    onChange(newValue);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
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
          handleSelect(city.nome);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <Input
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          fetchCities();
          if (query.length >= 2) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("pl-10 pr-10", className)}
        autoComplete="off"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
      )}
      {!isLoading && query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && filteredCities.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredCities.map((city, index) => (
            <button
              key={`${city.nome}-${city.uf}`}
              type="button"
              onClick={() => handleSelect(city.nome)}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors",
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
            >
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-foreground">{city.nome}</span>
              <span className="text-muted-foreground">{city.uf}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
