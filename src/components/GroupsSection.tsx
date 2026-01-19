import { motion } from "framer-motion";
import { useState } from "react";
import { Users, Target, MapPin, Plus, Heart, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { CreateGroupModal } from "./CreateGroupModal";
import { useGroups } from "@/hooks/useGroups";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const donationTypeLabels: Record<string, { label: string; icon: string }> = {
  alimentos: { label: "Alimentos", icon: "🍎" },
  livros: { label: "Livros", icon: "📚" },
  roupas: { label: "Roupas", icon: "👕" },
  cobertores: { label: "Cobertores", icon: "🛏️" },
  sopas: { label: "Sopas", icon: "🍲" },
  brinquedos: { label: "Brinquedos", icon: "🧸" },
  higiene: { label: "Kits de Higiene", icon: "🧴" },
  outro: { label: "Outro", icon: "📦" },
};

const placeholderImages = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400",
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400",
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400",
  "https://images.unsplash.com/photo-1523464862212-d6631d073194?w=400",
];

interface GroupsSectionProps {
  onRequireAuth: () => void;
}

export const GroupsSection = ({ onRequireAuth }: GroupsSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { groups, isLoading, joinGroup } = useGroups();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleJoinGroup = (groupId: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    const profile = user.user_metadata;
    joinGroup.mutate({
      groupId,
      userId: user.id,
      name: profile?.full_name || user.email || "Membro",
    });
  };

  const handleCreateGroup = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <section id="grupos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Grupos Ativos
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Encontre um grupo perto de você ou crie o seu próprio
            </p>
          </div>
          <Button
            size="lg"
            variant="hero"
            onClick={handleCreateGroup}
          >
            <Plus className="w-5 h-5" />
            Criar Novo Grupo
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={placeholderImages[index % placeholderImages.length]}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
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
                        {group.goals_reached || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Metas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-bold text-secondary">
                        {group.goals_reached || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Doações</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={joinGroup.isPending}
                  >
                    {joinGroup.isPending ? "Entrando..." : "Participar do Grupo"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg mb-4">
              Ainda não há grupos cadastrados. Seja o primeiro a criar!
            </p>
            <Button variant="hero" onClick={handleCreateGroup}>
              <Plus className="w-5 h-5" />
              Criar Primeiro Grupo
            </Button>
          </motion.div>
        )}
      </div>

      <CreateGroupModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onRequireAuth={onRequireAuth}
      />
    </section>
  );
};
