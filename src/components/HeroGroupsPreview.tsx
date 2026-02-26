import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Users, Heart, ArrowRight, Search, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { useNavigate } from "react-router-dom";

const useTopGroups = () => {
  return useQuery({
    queryKey: ["topGroupsPreview"],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups_public")
        .select("id, name, city, donation_type, member_count, total_goals, total_donations")
        .eq("is_private", false)
        .eq("is_test", false)
        .order("member_count", { ascending: false })
        .limit(3);

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

const GroupCard = ({ group, onClick }: { group: any; onClick: () => void }) => (
  <div className="bg-card rounded-xl p-4 shadow-soft hover:shadow-glow transition-all duration-300 text-left w-full">
    <div className="flex items-start justify-between gap-2 mb-2">
      <h3 className="font-bold text-foreground text-sm line-clamp-1">{group.name}</h3>
      <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
        {group.donation_type}
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
    <Button size="sm" variant="default" className="w-full" onClick={onClick}>
      <Users className="w-4 h-4" />
      Entrar no Grupo
    </Button>
  </div>
);

const GroupCardSkeleton = () => (
  <div className="bg-card rounded-xl p-4">
    <div className="flex justify-between mb-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <div className="flex gap-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

export const HeroGroupsPreview = () => {
  const { data: groups, isLoading } = useTopGroups();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: isSearching } = useSearchGroups(searchQuery);

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

        <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-6">
          {isLoading
            ? [1, 2, 3].map(i => <GroupCardSkeleton key={i} />)
            : groups?.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onClick={() => navigate(`/grupo/${group.id}`)}
                />
              ))
          }
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
