import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Users, Heart, ArrowRight, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect } from "react";

const usePublicGroups = () => {
  return useQuery({
    queryKey: ["publicGroupsCarousel"],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups_public")
        .select("id, name, city, donation_type, member_count, total_goals, total_donations")
        .eq("is_private", false)
        .eq("is_test", false)
        .order("member_count", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

const useSearchGroups = (query: string) => {
  return useQuery({
    queryKey: ["searchGroupsPreview", query],
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups_search")
        .select("id, name, city, donation_type")
        .eq("is_private", false)
        .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });
};

const donationTypeLabels: Record<string, string> = {
  alimentos: "🍎 Alimentos",
  livros: "📚 Livros",
  roupas: "👕 Roupas",
  cobertores: "🛏️ Cobertores",
  sopas: "🍲 Sopas",
  brinquedos: "🧸 Brinquedos",
  higiene: "🧴 Higiene",
  mudas: "🌱 Mudas",
  racao: "🐾 Ração",
  sangue: "🩸 Sangue",
  ovos_pascoa: "🍫 Páscoa",
  dinheiro: "💰 Dinheiro",
  outro: "📦 Outro",
};

const GroupCard = ({ group, onClick }: { group: any; onClick: () => void }) => (
  <div className="bg-card rounded-xl p-4 shadow-soft hover:shadow-glow transition-all duration-300 text-left w-full h-full flex flex-col">
    <div className="flex items-start justify-between gap-2 mb-2">
      <h3 className="font-bold text-foreground text-sm line-clamp-1">{group.name}</h3>
      <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
        {donationTypeLabels[group.donation_type] || "📦 Outro"}
      </span>
    </div>
    <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground mb-3">
      <span className="flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {group.city}
      </span>
      <span className="flex items-center gap-1">
        <Users className="w-3 h-3" />
        {group.member_count || 0} membros
      </span>
      {(group.total_donations || 0) > 0 && (
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-destructive" />
          {group.total_donations} doações
        </span>
      )}
    </div>
    <div className="mt-auto">
      <Button size="sm" variant="default" className="w-full" onClick={onClick}>
        <Users className="w-4 h-4" />
        Entrar no Grupo
      </Button>
    </div>
  </div>
);

const GroupCardSkeleton = () => (
  <div className="bg-card rounded-xl p-4">
    <div className="flex justify-between mb-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <div className="flex gap-3 mb-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-8 w-full rounded-md" />
  </div>
);

export const HeroGroupsPreview = () => {
  const { data: groups, isLoading } = usePublicGroups();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: isSearching } = useSearchGroups(searchQuery);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 640px)": { slidesToScroll: 2 },
        "(min-width: 1024px)": { slidesToScroll: 3 },
      },
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const showSearch = searchQuery.length >= 2;

  const scrollToGroups = () => {
    document.getElementById("grupos")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isLoading && (!groups || groups.length === 0)) return null;

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            Grupos em ação agora
          </h2>
          <p className="text-sm text-muted-foreground">
            Veja quem já está transformando metas em doações
          </p>
        </div>

        <div className="max-w-md mx-auto mb-6 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar grupo por nome ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {showSearch && (
            <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              {searchResults && searchResults.length > 0 ? (
                searchResults.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      navigate(`/grupo/${group.id}`);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{group.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {group.city}
                      </p>
                    </div>
                  </button>
                ))
              ) : !isSearching ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  Nenhum grupo encontrado
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative max-w-5xl mx-auto mb-6">
          {/* Navigation Buttons */}
          {groups && groups.length > 3 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full w-8 h-8 bg-card shadow-md hidden sm:flex"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full w-8 h-8 bg-card shadow-md hidden sm:flex"
                onClick={scrollNext}
                disabled={!canScrollNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {isLoading ? (
            <div className="grid sm:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <GroupCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-3">
                {groups?.map(group => (
                  <div
                    key={group.id}
                    className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-3 min-w-0"
                  >
                    <GroupCard
                      group={group}
                      onClick={() => navigate(`/grupo/${group.id}`)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile swipe hint */}
          {groups && groups.length > 1 && (
            <div className="flex justify-center gap-1 mt-3 sm:hidden">
              <span className="text-xs text-muted-foreground">
                ← Deslize para ver mais →
              </span>
            </div>
          )}
        </div>

        <div className="text-center">
          <Button variant="outline" size="sm" onClick={scrollToGroups}>
            Ver todos os grupos
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroGroupsPreview;
