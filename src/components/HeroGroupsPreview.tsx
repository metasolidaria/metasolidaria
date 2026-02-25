import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Users, Heart, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
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

const GroupCard = ({ group, onClick }: { group: any; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-card rounded-xl p-4 shadow-soft hover:shadow-glow transition-all duration-300 text-left w-full hover:scale-[1.02] cursor-pointer"
  >
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
    <span className="text-xs font-semibold text-primary flex items-center gap-1">
      Participar <ArrowRight className="w-3 h-3" />
    </span>
  </button>
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
