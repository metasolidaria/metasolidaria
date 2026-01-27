import { useState } from "react";
import { Search, Lock, Loader2, UserPlus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useJoinRequests } from "@/hooks/useJoinRequests";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PrivateGroup {
  id: string;
  name: string;
  city: string;
  leader_name: string | null;
}

interface PrivateGroupSearchProps {
  onRequireAuth: () => void;
  userMemberships: string[];
}

export const PrivateGroupSearch = ({ onRequireAuth, userMemberships }: PrivateGroupSearchProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PrivateGroup[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [requestingGroupId, setRequestingGroupId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      toast({
        title: "Busca inválida",
        description: "Digite pelo menos 3 caracteres para buscar.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Buscar grupos privados pelo nome exato ou parcial
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, city, leader_name")
        .eq("is_private", true)
        .ilike("name", `%${searchQuery.trim()}%`)
        .limit(5);

      if (error) throw error;

      // Filtrar grupos dos quais o usuário já é membro
      const filteredResults = (data || []).filter(
        (group) => !userMemberships.includes(group.id)
      );

      setSearchResults(filteredResults);
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

  const handleRequestJoin = async (groupId: string, groupName: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    setRequestingGroupId(groupId);

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

      // Remover grupo da lista de resultados
      setSearchResults((prev) => prev.filter((g) => g.id !== groupId));
    } catch (error: any) {
      console.error("Erro ao solicitar entrada:", error);
      toast({
        title: "Erro ao solicitar entrada",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setRequestingGroupId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Buscar Grupo Privado
          </span>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Digite o nome do grupo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSearch}
            disabled={isSearching}
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
                  className="flex items-center justify-between p-3 bg-card rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-foreground">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.city} • Líder: {group.leader_name || "Não informado"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequestJoin(group.id, group.name)}
                    disabled={requestingGroupId === group.id}
                  >
                    {requestingGroupId === group.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Solicitar
                      </>
                    )}
                  </Button>
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
