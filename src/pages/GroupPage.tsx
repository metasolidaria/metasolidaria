import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Target, MapPin, Lock, Globe, Plus, Trash2, Loader2, LogOut, TrendingUp, Sparkles, Pencil, CalendarDays, Building2, UserPlus, Mail, Send, Clock, CheckCircle, XCircle, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useGroupDetails } from "@/hooks/useGroupDetails";
import { useAuth } from "@/hooks/useAuth";
import { useJoinRequests } from "@/hooks/useJoinRequests";
import { AddProgressModal } from "@/components/AddProgressModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import { EditGroupModal } from "@/components/EditGroupModal";
import { EditMemberGoalModal } from "@/components/EditMemberGoalModal";
import { ProgressCharts } from "@/components/ProgressCharts";
import { ProgressAnalysisModal } from "@/components/ProgressAnalysisModal";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { JoinRequestsPanel } from "@/components/JoinRequestsPanel";
import { useProgressAnalysis } from "@/hooks/useProgressAnalysis";
import { GoldPartnersCarousel } from "@/components/GoldPartnersCarousel";
import { PremiumLogosCarousel } from "@/components/PremiumLogosCarousel";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const donationTypeLabels: Record<string, { label: string; icon: string; unit: string }> = {
  alimentos: { label: "Alimentos", icon: "🍎", unit: "kg" },
  livros: { label: "Livros", icon: "📚", unit: "livros" },
  roupas: { label: "Roupas", icon: "👕", unit: "peças" },
  cobertores: { label: "Cobertores", icon: "🛏️", unit: "cobertores" },
  sopas: { label: "Sopas", icon: "🍲", unit: "porções" },
  brinquedos: { label: "Brinquedos", icon: "🧸", unit: "brinquedos" },
  higiene: { label: "Kits de Higiene", icon: "🧴", unit: "kits" },
  outro: { label: "Outro", icon: "📦", unit: "itens" },
};

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addProgressOpen, setAddProgressOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<{
    id: string;
    name: string | null;
    metric: string;
    ratio: number;
    donation_amount: number;
    personal_goal: number;
  } | null>(null);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  
  const { analyzeProgress, analysis, isLoading: analysisLoading, clearAnalysis } = useProgressAnalysis();

  const { 
    group, 
    members, 
    progressEntries, 
    totalProgress,
    totalGroupGoal,
    userMember,
    hasFullAccess,
    isLoading, 
    deleteProgress,
    removeMember,
    leaveGroup,
    updateGroup,
    updateMemberGoal,
  } = useGroupDetails(id);

  // Hook for join requests - MUST be called before any early returns
  const { userRequest, createRequest, isLoading: requestsLoading } = useJoinRequests(id);

  const handleLeaveGroup = () => {
    leaveGroup.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  const handleRemoveMember = () => {
    if (memberToRemove) {
      removeMember.mutate(memberToRemove.id, {
        onSuccess: () => {
          setMemberToRemove(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Grupo não encontrado</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }


  // Show limited view for non-members of private groups
  if (!hasFullAccess && group.is_private) {
    const hasPendingRequest = userRequest?.status === "pending";
    const wasRejected = userRequest?.status === "rejected";
    const wasApproved = userRequest?.status === "approved";

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-secondary" />
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {group.name}
              </h1>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{group.city}</span>
              </div>

              <span className="inline-flex items-center gap-1 bg-secondary/20 px-3 py-1 rounded-full text-sm text-secondary-foreground mb-6">
                <Lock className="w-3 h-3" />
                Grupo Privado
              </span>

              {group.description && (
                <p className="text-muted-foreground mb-6">
                  {group.description}
                </p>
              )}

              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Quer participar deste grupo?
                </h2>
                
                {!user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Faça login para solicitar sua entrada no grupo.
                    </p>
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => navigate("/?login=true")}
                    >
                      Fazer Login
                    </Button>
                  </div>
                ) : hasPendingRequest ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Solicitação Pendente</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sua solicitação foi enviada e está aguardando aprovação do líder.
                    </p>
                  </div>
                ) : wasRejected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-destructive">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Solicitação Recusada</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Infelizmente sua solicitação foi recusada pelo líder do grupo.
                    </p>
                  </div>
                ) : wasApproved ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Solicitação Aprovada!</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Você já faz parte do grupo. Recarregue a página para ver o conteúdo.
                    </p>
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => window.location.reload()}
                    >
                      Recarregar Página
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm mb-4">
                      Envie uma solicitação e aguarde a aprovação do líder.
                    </p>
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => createRequest.mutate({ groupId: id! })}
                      disabled={createRequest.isPending || requestsLoading}
                    >
                      {createRequest.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Solicitar Entrada
                        </>
                      )}
                    </Button>
                    {group.leader_name && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Líder: {group.leader_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const donationType = donationTypeLabels[group.donation_type] || donationTypeLabels.outro;
  const effectiveGoal = totalGroupGoal > 0 ? totalGroupGoal : group.goal_2026;
  const progressPercentage = effectiveGoal > 0 ? Math.min((totalProgress / effectiveGoal) * 100, 100) : 0;
  const isLeader = user?.id === group.leader_id;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            {userMember && !isLeader && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLeaveDialogOpen(true)}
                disabled={leaveGroup.isPending}
                className="ml-auto flex-shrink-0"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair do Grupo
              </Button>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {group.is_private ? (
                  <span className="bg-secondary/80 px-2 py-1 rounded-full text-xs text-secondary-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Privado
                  </span>
                ) : (
                  <span className="bg-primary/80 px-2 py-1 rounded-full text-xs text-primary-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Público
                  </span>
                )}
                <span className="bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground flex items-center gap-1">
                  {donationType.icon} {donationType.label}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {group.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {group.city}
                </span>
                {group.end_date && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    Meta até {format(new Date(group.end_date), "dd/MM/yyyy")}
                  </span>
                )}
                {(group as any).entity ? (
                  <span className="flex items-center gap-1 text-primary">
                    <Building2 className="w-4 h-4" />
                    {(group as any).entity.name} ({(group as any).entity.city})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground/70 italic">
                    <Building2 className="w-4 h-4" />
                    Entidade não definida
                  </span>
                )}
              </div>
            </div>

            {/* Premium Logos Carousel */}
            <div className="shrink-0">
              <PremiumLogosCarousel />
            </div>
          </motion.div>

          {/* Leader Action Buttons */}
          {isLeader && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-2 mt-4"
            >
              <Button 
                variant="default"
                className="flex-1 sm:flex-none"
                onClick={() => setAddMemberOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Membro
              </Button>
              <Button 
                variant="default"
                className="flex-1 sm:flex-none"
                onClick={() => setInviteModalOpen(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Convite
              </Button>
              <Button 
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => setEditGroupOpen(true)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar Grupo
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
        {/* Gold Partners Carousel - Full Width */}
        {group.city && (
          <GoldPartnersCarousel groupCity={group.city} groupId={group.id} groupName={group.name} />
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Join Requests Panel for Leaders */}
            {isLeader && id && (
              <JoinRequestsPanel groupId={id} />
            )}
            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-soft"
            >
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary shrink-0" />
                <span className="truncate">Meta do grupo</span>
              </h2>
              
              <div className="mb-4">
                <div className="flex flex-wrap justify-between text-sm mb-2 gap-2">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium text-foreground">
                    {totalProgress} / {effectiveGoal} {donationType.unit}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex flex-wrap justify-between text-sm text-muted-foreground mt-1 gap-2">
                  <span>
                    {members?.filter(m => m.commitments?.some(c => c.personal_goal > 0)).length || 0} membro(s) com meta definida
                  </span>
                  <span>{progressPercentage.toFixed(1)}% concluído</span>
                </div>
              </div>
            </motion.div>

            {/* Progress Charts - Temporariamente desabilitado
            {progressEntries && progressEntries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-card rounded-2xl p-6 shadow-soft"
              >
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Evolução do Progresso
                </h2>
                
                <ProgressCharts
                  progressEntries={progressEntries}
                  members={members || []}
                  goal={effectiveGoal}
                  donationType={donationType}
                />
              </motion.div>
            )}
            */}

            {/* Progress Entries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-6 shadow-soft"
            >
              <h2 className="text-xl font-bold text-foreground mb-4 truncate">
                Histórico de Doações
              </h2>

              {progressEntries && progressEntries.length > 0 ? (
                <div className="space-y-3">
                  {progressEntries.map((entry) => (
                    <div 
                      key={entry.id}
                      className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="font-medium text-foreground">
                            +{entry.amount} {donationType.unit}
                          </span>
                          <span className="text-sm text-muted-foreground truncate">
                            por {entry.member_name}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mt-1 break-words">
                            {entry.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(entry.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      
                      {entry.user_id === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProgress.mutate(entry.id)}
                          disabled={deleteProgress.isPending}
                          className="text-destructive hover:text-destructive flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma doação registrada ainda. Seja o primeiro!
                </p>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members - Show based on visibility settings */}
            {(() => {
              const membersVisible = (group as any).members_visible !== false;
              const showAllMembers = membersVisible || isLeader;
              // Filter to show only user's own member when list is hidden
              const displayMembers = showAllMembers 
                ? members 
                : members?.filter(m => m.user_id === user?.id);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl p-6 shadow-soft"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2 min-w-0">
                      <Users className="w-5 h-5 text-primary shrink-0" />
                      <span className="truncate">Membros ({members?.length || 0})</span>
                    </h2>
                    {!membersVisible && isLeader && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                        <EyeOff className="w-3 h-3" />
                        Oculto para outros
                      </span>
                    )}
                  </div>

                  {/* Hidden members notice with aggregated totals for regular members */}
                  {!showAllMembers && (
                    <div className="mb-4 bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <EyeOff className="w-4 h-4" />
                        <span className="text-sm">Lista de membros oculta pelo líder</span>
                      </div>
                      
                      {/* Aggregated totals */}
                      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border/50">
                        <div>
                          <div className="text-lg font-bold text-foreground">
                            {members?.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Participantes</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-primary">
                            {members?.reduce((sum, m) => sum + ((m.commitments || []).reduce((s, c) => s + (c.personal_goal || 0), 0)), 0) || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Meta Total</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-secondary">
                            {members?.reduce((sum, m) => sum + (m.total_contributed || 0), 0) || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Doações</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {displayMembers && displayMembers.length > 0 ? (
                    <div className="space-y-3">
                      {!showAllMembers && userMember && (
                        <p className="text-xs text-primary font-medium mb-2">Seus dados:</p>
                      )}
                      {displayMembers.map((member) => (
                        <div 
                          key={member.id}
                          className="p-3 bg-muted/30 rounded-lg"
                        >
                          {/* Header: Avatar + Name + Edit Button */}
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {member.name}
                                {member.user_id === group.leader_id && (
                                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    Líder
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.total_contributed || 0} / {(member.commitments || []).reduce((sum, c) => sum + (c.personal_goal || 0), 0)} {donationType.unit}
                              </p>
                            </div>
                            {member.user_id === user?.id && (
                              <div className="w-full sm:w-auto flex justify-end">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={(member.commitments || []).length === 0 ? "default" : "ghost"}
                                      size="sm"
                                      onClick={() => setEditGoalOpen(true)}
                                      className={`flex-shrink-0 w-full sm:w-auto justify-center ${(member.commitments || []).length === 0
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                        : "text-primary hover:text-primary hover:bg-primary/10"
                                      }`}
                                    >
                                      <Target className="w-4 h-4" />
                                      <span className="ml-1">{(member.commitments || []).length === 0 ? "Definir Meta" : "Editar Meta"}</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p className="text-sm">
                                      {(member.commitments || []).length === 0 
                                        ? "Defina sua meta pessoal de doação e compromisso para este grupo" 
                                        : "Edite sua meta pessoal, valor de compromisso ou métrica de doação"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                          
                          {/* Commitments list */}
                          {member.commitments && member.commitments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {member.commitments.map((c, idx) => (
                                <div key={c.id || idx} className="bg-muted/30 rounded-md p-2">
                                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-primary break-words">
                                        📌 {c.name ? `${c.name}: ` : ''}{c.ratio} {c.metric} = {c.donation_amount} {donationType.unit}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Meta: {c.personal_goal} {donationType.unit}
                                      </p>
                                      {c.penalty_donation && c.penalty_donation > 0 && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                          🔥 Desafio: {c.penalty_donation} {donationType.unit}
                                        </p>
                                      )}
                                    </div>
                                    {member.user_id === user?.id && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedCommitment({
                                            id: c.id,
                                            name: c.name,
                                            metric: c.metric,
                                            ratio: c.ratio,
                                            donation_amount: c.donation_amount,
                                            personal_goal: c.personal_goal,
                                          });
                                          setAddProgressOpen(true);
                                        }}
                                        className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 flex-shrink-0 w-full sm:w-auto justify-center"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span className="ml-1 text-xs">Incluir Evolução</span>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Leader remove button */}
                          {isLeader && member.user_id !== group.leader_id && (
                            <div className="mt-2 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMemberToRemove({ id: member.id, name: member.name })}
                                disabled={removeMember.isPending}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="ml-1">Remover</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      {showAllMembers ? "Nenhum membro ainda" : "Você ainda não é membro deste grupo"}
                    </p>
                  )}
                </motion.div>
              );
            })()}

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground"
            >
              <h3 className="font-bold mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="opacity-80">Total doado</span>
                  <span className="font-bold">{totalProgress} {donationType.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Meta do grupo</span>
                  <span className="font-bold">{effectiveGoal} {donationType.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Membros</span>
                  <span className="font-bold">{members?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Registros</span>
                  <span className="font-bold">{progressEntries?.length || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {userMember && (
        <AddProgressModal
          open={addProgressOpen}
          onOpenChange={(open) => {
            setAddProgressOpen(open);
            if (!open) setSelectedCommitment(null);
          }}
          groupId={id!}
          memberId={userMember.id}
          donationType={donationType}
          commitment={selectedCommitment || undefined}
        />
      )}

      {/* Add Member Modal (for leaders) */}
      {isLeader && group && (
        <AddMemberModal
          open={addMemberOpen}
          onOpenChange={setAddMemberOpen}
          groupId={group.id}
          groupName={group.name}
        />
      )}

      {/* Invite Member Modal (for leaders) */}
      {isLeader && group && (
        <InviteMemberModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          groupId={group.id}
          groupName={group.name}
          groupDescription={group.description || undefined}
        />
      )}

      {/* Edit Group Modal (for leaders) */}
      {isLeader && group && (
        <EditGroupModal
          open={editGroupOpen}
          onOpenChange={setEditGroupOpen}
          group={group}
          onSave={(data) => {
            updateGroup.mutate(data, {
              onSuccess: () => setEditGroupOpen(false),
            });
          }}
          isPending={updateGroup.isPending}
        />
      )}

      {/* Edit Member Goal Modal */}
      {userMember && (
        <EditMemberGoalModal
          open={editGoalOpen}
          onOpenChange={setEditGoalOpen}
          memberName={userMember.name}
          currentCommitments={(userMember.commitments || []).map(c => ({
            id: c.id,
            name: c.name || "",
            metric: c.metric,
            ratio: c.ratio,
            donation_amount: c.donation_amount,
            personal_goal: c.personal_goal || 0,
            penalty_donation: c.penalty_donation || null,
          }))}
          onSave={(data) => {
            updateMemberGoal.mutate(
              { 
                memberId: userMember.id, 
                commitments: data.commitments,
              },
              { onSuccess: () => setEditGoalOpen(false) }
            );
          }}
          isPending={updateMemberGoal.isPending}
          unit={donationType.unit}
        />
      )}

      {/* Leave Group Confirmation Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja sair do grupo "{group.name}"? 
              Suas doações registradas permanecerão no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLeaveGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair do Grupo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja remover "{memberToRemove?.name}" do grupo? 
              As doações registradas por este membro permanecerão no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover Membro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Progress Analysis Modal */}
      <ProgressAnalysisModal
        open={analysisModalOpen}
        onOpenChange={(open) => {
          setAnalysisModalOpen(open);
          if (!open) clearAnalysis();
        }}
        analysis={analysis}
        isLoading={analysisLoading}
        groupName={group?.name || ""}
      />
    </div>
  );
}