import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Target, MapPin, Plus, Heart, Loader2, Lock, Globe, Mail, ChevronLeft, ChevronRight, Crown, EyeOff, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { CreateGroupModal } from "./CreateGroupModal";
import { InviteMemberModal } from "./InviteMemberModal";
import { GroupSearch } from "./GroupSearch";
import { usePaginatedGroups, useUserMemberships } from "@/hooks/usePaginatedGroups";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;
const donationTypeLabels: Record<string, {
  label: string;
  icon: string;
}> = {
  alimentos: { label: "Alimentos", icon: "🍎" },
  livros: { label: "Livros", icon: "📚" },
  roupas: { label: "Roupas", icon: "👕" },
  cobertores: { label: "Cobertores", icon: "🛏️" },
  sopas: { label: "Sopas", icon: "🍲" },
  brinquedos: { label: "Brinquedos", icon: "🧸" },
  higiene: { label: "Kits de Higiene", icon: "🧴" },
  outro: { label: "Outro", icon: "📦" }
};
const placeholderImages = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400",
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400",
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400",
  "https://images.unsplash.com/photo-1523464862212-d6631d073194?w=400"
];

interface GroupsSectionProps {
  onRequireAuth: () => void;
}

export const GroupsSection = ({ onRequireAuth }: GroupsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { userMemberships, isLoading: membershipsLoading } = useUserMemberships();
  const { groups, totalCount, isLoading, joinGroup, toggleMembersVisibility } = usePaginatedGroups({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    filter,
    userMemberships,
    membershipsLoading,
  });

  const isUserMember = (groupId: string) => userMemberships.includes(groupId);

  // Ativar filtro "Meus Grupos" quando usuário logar e memberships carregarem
  useEffect(() => {
    if (user && !membershipsLoading) {
      setFilter("mine");
    }
  }, [user, membershipsLoading]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleGroupAction = (groupId: string, isPrivate: boolean) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    if (isUserMember(groupId)) {
      navigate(`/grupo/${groupId}`);
      return;
    }
    if (isPrivate) {
      toast({
        title: "Grupo Privado 🔒",
        description: "Este grupo requer um convite. Peça ao líder para enviar um convite.",
        variant: "destructive"
      });
      return;
    }
    const profile = user.user_metadata;
    joinGroup.mutate({
      groupId,
      name: profile?.full_name || user.email || "Membro"
    }, {
      onSuccess: () => {
        navigate(`/grupo/${groupId}`);
      }
    });
  };

  const handleInviteMembers = (group: { id: string; name: string; description?: string | null }) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setSelectedGroup({ id: group.id, name: group.name, description: group.description || undefined });
    setInviteModalOpen(true);
  };

  const handleCreateGroup = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setIsModalOpen(true);
  };

  const isGroupLeader = (leaderId: string) => user?.id === leaderId;

  return (
    <section id="grupos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Grupos Ativos
            </h2>
            <p className="text-muted-foreground max-w-xl text-sm">Encontre um grupo perto de você ou crie o seu próprio.<br />Os grupos privados só aparecerão se enviado convite pelo líder.</p>
          </div>
          <Button size="lg" variant="hero" onClick={handleCreateGroup}>
            <Plus className="w-5 h-5" />
            Criar Novo Grupo
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {user && <div className="flex flex-wrap gap-2">
                <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")} className="whitespace-nowrap">
                  <Globe className="w-4 h-4 mr-1 shrink-0" />
                  <span className="truncate">Todos</span>
                </Button>
                <Button variant={filter === "mine" ? "default" : "outline"} size="sm" onClick={() => setFilter("mine")} className="whitespace-nowrap">
                  <Users className="w-4 h-4 mr-1 shrink-0" />
                  <span className="truncate">Meus Grupos</span>
                  {userMemberships.length > 0 && <span className="ml-1 bg-primary-foreground/20 px-1.5 py-0.5 rounded-full text-xs shrink-0">
                      {userMemberships.length}
                    </span>}
                </Button>
              </div>}
          </div>

          {/* Busca de grupos por nome */}
          <div className="w-full sm:max-w-md">
            <GroupSearch onRequireAuth={onRequireAuth} userMemberships={userMemberships} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : groups && groups.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group, index) => (
                <div
                  key={group.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-4 duration-400"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={group.image_url || placeholderImages[index % placeholderImages.length]} 
                      alt={group.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {isGroupLeader(group.leader_id) && (
                        <span className="bg-amber-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Líder
                        </span>
                      )}
                      {group.is_private ? <span className="bg-secondary/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-secondary-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Privado
                        </span> : <span className="bg-primary/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-primary-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Público
                        </span>}
                      {group.members_visible === false && (
                        <span className="bg-muted/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-muted-foreground flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          Membros ocultos
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-primary-foreground/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-primary-foreground flex items-center gap-1">
                        <span>{donationTypeLabels[group.donation_type]?.icon || "📦"}</span>
                        {donationTypeLabels[group.donation_type]?.label || "Doações"}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-primary-foreground">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-1 text-primary-foreground/80 text-sm">
                        <MapPin className="w-3 h-3" />
                        {group.city}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {group.member_count || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Membros</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <Target className="w-4 h-4" />
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {group.total_goals || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Metas</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div className="text-lg font-bold text-secondary">
                          {group.total_donations || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Doações</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isGroupLeader(group.leader_id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMembersVisibility.mutate({ 
                              groupId: group.id, 
                              visible: group.members_visible === false 
                            });
                          }}
                          disabled={toggleMembersVisibility.isPending}
                          className="flex-shrink-0"
                          title={group.members_visible === false ? "Mostrar membros" : "Ocultar membros"}
                        >
                          {group.members_visible === false ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      {isGroupLeader(group.leader_id) && group.is_private && (
                        <Button variant="outline" size="sm" onClick={() => handleInviteMembers(group)} className="flex-1">
                          <Mail className="w-4 h-4 mr-1" />
                          Convidar
                        </Button>
                      )}
                      <Button 
                        className={isGroupLeader(group.leader_id) ? "flex-1" : "w-full"} 
                        variant={isUserMember(group.id) ? "default" : "outline"} 
                        onClick={() => handleGroupAction(group.id, group.is_private)} 
                        disabled={joinGroup.isPending || (group.is_private && !isUserMember(group.id))}
                      >
                        {isUserMember(group.id) ? <>
                            <Users className="w-4 h-4 mr-1" />
                            Acessar Grupo
                          </> : group.is_private ? <>
                            <Lock className="w-4 h-4 mr-1" />
                            Apenas Convite
                          </> : joinGroup.isPending ? "Entrando..." : "Participar do Grupo"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && <div className="flex items-center justify-center gap-4 mt-8">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({totalCount} grupos)
                </span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>}
          </>
        ) : filter === "mine" ? (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg mb-4">
              Você ainda não faz parte de nenhum grupo.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" onClick={() => setFilter("all")}>
                <Globe className="w-4 h-4 mr-1" />
                Ver Todos os Grupos
              </Button>
              <Button variant="hero" onClick={handleCreateGroup}>
                <Plus className="w-5 h-5" />
                Criar Meu Grupo
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <p className="text-muted-foreground text-lg mb-4">
              Ainda não há grupos cadastrados. Seja o primeiro a criar!
            </p>
            <Button variant="hero" onClick={handleCreateGroup}>
              <Plus className="w-5 h-5" />
              Criar Primeiro Grupo
            </Button>
          </div>
        )}
      </div>

      <CreateGroupModal open={isModalOpen} onOpenChange={setIsModalOpen} onRequireAuth={onRequireAuth} />

      <InviteMemberModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} groupId={selectedGroup?.id || null} groupName={selectedGroup?.name} groupDescription={selectedGroup?.description} />
    </section>
  );
};
