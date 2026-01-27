import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAdminInvitations, type AdminInvitation } from "@/hooks/useAdminInvitations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Trash2,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Search,
  Mail,
  Link as LinkIcon,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Copy,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: "Pendente",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  },
  accepted: {
    label: "Aceito",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-green-500/20 text-green-700 border-green-500/30",
  },
  expired: {
    label: "Expirado",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-500/20 text-red-700 border-red-500/30",
  },
};

const AdminInvitations = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { invitations, stats, isLoading, renewInvitation, revokeInvitation } = useAdminInvitations();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<AdminInvitation | null>(null);

  useEffect(() => {
    if (authLoading || adminLoading) return;
    if (!user || isAdmin === false) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        <Button onClick={() => navigate("/")}>Voltar para o início</Button>
      </div>
    );
  }

  const getDisplayStatus = (invitation: AdminInvitation) => {
    if (invitation.status === "accepted") return "accepted";
    if (invitation.status === "pending" && isPast(new Date(invitation.expires_at))) return "expired";
    return invitation.status;
  };

  const filteredInvitations = invitations?.filter((inv) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      inv.group_name?.toLowerCase().includes(search) ||
      inv.email?.toLowerCase().includes(search) ||
      inv.invited_by_name?.toLowerCase().includes(search) ||
      inv.invite_code?.toLowerCase().includes(search);

    const displayStatus = getDisplayStatus(inv);
    const matchesStatus = statusFilter === "all" || displayStatus === statusFilter;
    const matchesType = typeFilter === "all" || inv.invite_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleRevoke = (invitation: AdminInvitation) => {
    setInvitationToDelete(invitation);
    setDeleteDialogOpen(true);
  };

  const confirmRevoke = () => {
    if (invitationToDelete) {
      revokeInvitation.mutate(invitationToDelete.id);
      setDeleteDialogOpen(false);
      setInvitationToDelete(null);
    }
  };

  const handleRenew = (invitation: AdminInvitation) => {
    renewInvitation.mutate(invitation.id);
  };

  const copyInviteLink = (invitation: AdminInvitation) => {
    const link = `https://metasolidaria.com.br?invite=${invitation.invite_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <h1 className="text-3xl font-bold">Administração de Convites</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os convites de grupos da plataforma
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{stats.total_invitations}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-2xl font-bold">{stats.pending_invitations}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aceitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">{stats.accepted_invitations}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expirados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold">{stats.expired_invitations}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Aceitação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{stats.acceptance_rate}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por grupo, email, convidado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="accepted">Aceitos</SelectItem>
              <SelectItem value="expired">Expirados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Email/Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Convidado por</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead className="w-[140px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum convite encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvitations?.map((inv) => {
                    const displayStatus = getDisplayStatus(inv);
                    const config = statusConfig[displayStatus] || statusConfig.pending;
                    const canRenew = displayStatus === "expired" || displayStatus === "pending";

                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {inv.group_name}
                        </TableCell>
                        <TableCell>
                          {inv.invite_type === "link" ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <LinkIcon className="h-4 w-4" />
                              Link
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              Email
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {inv.invite_type === "email" ? inv.email : (
                            <span className="text-xs font-mono text-muted-foreground">
                              {inv.invite_code.substring(0, 8)}...
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.className}>
                            <span className="flex items-center gap-1">
                              {config.icon}
                              {config.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {inv.invited_by_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(inv.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(inv.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {inv.invite_type === "link" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => copyInviteLink(inv)}
                                title="Copiar link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                            {canRenew && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleRenew(inv)}
                                disabled={renewInvitation.isPending}
                                title="Renovar convite"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRevoke(inv)}
                              title="Revogar convite"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredInvitations && (
          <p className="text-sm text-muted-foreground mt-4">
            {filteredInvitations.length} convite{filteredInvitations.length !== 1 ? "s" : ""} encontrado{filteredInvitations.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar Convite</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja revogar este convite para o grupo <strong>{invitationToDelete?.group_name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminInvitations;
