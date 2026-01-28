import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAdminPartners } from "@/hooks/useAdminPartners";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { EditPartnerModal } from "@/components/EditPartnerModal";
import { CreatePartnerModal } from "@/components/CreatePartnerModal";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Gem,
  Medal,
  Heart,
  ShieldAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarIcon,
  X,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, parseLocalDate } from "@/lib/utils";
import { partnerSpecialties } from "@/lib/partnerSpecialties";
import type { Partner, PartnerTier } from "@/hooks/usePartners";

type SortColumn = "name" | "city" | "specialty" | "tier" | "is_approved" | "created_at" | "expires_at";
type SortDirection = "asc" | "desc";

const tierOrder: Record<PartnerTier, number> = {
  premium: 1,
  ouro: 2,
  apoiador: 3,
};

const tierConfig: Record<PartnerTier, { label: string; icon: React.ReactNode; className: string }> = {
  premium: {
    label: "Premium",
    icon: <Gem className="h-3 w-3" />,
    className: "bg-cyan-500/20 text-cyan-700 border-cyan-500/30",
  },
  ouro: {
    label: "Ouro",
    icon: <Medal className="h-3 w-3" />,
    className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  },
  apoiador: {
    label: "Apoiador",
    icon: <Heart className="h-3 w-3" />,
    className: "bg-rose-500/20 text-rose-700 border-rose-500/30",
  },
};

const AdminPartners = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const {
    allPartners,
    pendingPartners,
    approvedPartners,
    isLoading,
    togglePartnerStatus,
    rejectPartner,
    updatePartner,
    createPartner,
  } = useAdminPartners();

  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Filters
  const [cityFilter, setCityFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expirationFilter, setExpirationFilter] = useState<string>("all");

  const sortPartners = (partners: Partner[]) => {
    return [...partners].sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "name":
          comparison = a.name.localeCompare(b.name, "pt-BR");
          break;
        case "city":
          comparison = a.city.localeCompare(b.city, "pt-BR");
          break;
        case "specialty":
          comparison = (a.specialty || "").localeCompare(b.specialty || "", "pt-BR");
          break;
        case "tier":
          comparison = tierOrder[a.tier] - tierOrder[b.tier];
          break;
        case "is_approved":
          comparison = (a.is_approved ? 1 : 0) - (b.is_approved ? 1 : 0);
          break;
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "expires_at":
          const dateA = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
          const dateB = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const getDaysRemaining = (expiresAt: string | null): number | null => {
    if (!expiresAt) return null;
    return differenceInDays(parseLocalDate(expiresAt), new Date());
  };

  const getDaysRemainingStyle = (days: number | null) => {
    if (days === null) return { text: "—", className: "text-muted-foreground" };
    if (days < 0) return { text: `${days}`, className: "text-red-600 font-semibold" };
    if (days <= 7) return { text: `${days}`, className: "text-orange-600 font-semibold" };
    if (days <= 30) return { text: `${days}`, className: "text-yellow-600 font-medium" };
    return { text: `${days}`, className: "text-green-600" };
  };

  const handleExpirationChange = (partner: Partner, date: Date | undefined) => {
    updatePartner.mutate({
      id: partner.id,
      expires_at: date ? format(date, "yyyy-MM-dd") : null,
    });
  };

  // Apply filters
  const filterPartners = (partners: Partner[]) => {
    return partners.filter((partner) => {
      // City filter
      if (cityFilter && !partner.city.toLowerCase().includes(cityFilter.toLowerCase())) {
        return false;
      }
      // Specialty filter
      if (specialtyFilter !== "all" && partner.specialty !== specialtyFilter) {
        return false;
      }
      // Tier filter
      if (tierFilter !== "all" && partner.tier !== tierFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === "active" && !partner.is_approved) {
        return false;
      }
      if (statusFilter === "inactive" && partner.is_approved) {
        return false;
      }
      // Expiration filter
      if (expirationFilter !== "all") {
        const daysRemaining = getDaysRemaining(partner.expires_at);
        if (expirationFilter === "expired" && (daysRemaining === null || daysRemaining >= 0)) {
          return false;
        }
        if (expirationFilter === "expiring_soon" && (daysRemaining === null || daysRemaining < 0 || daysRemaining > 30)) {
          return false;
        }
        if (expirationFilter === "expiring_week" && (daysRemaining === null || daysRemaining < 0 || daysRemaining > 7)) {
          return false;
        }
        if (expirationFilter === "no_expiration" && daysRemaining !== null) {
          return false;
        }
      }
      return true;
    });
  };

  const sortedPendingPartners = useMemo(() => sortPartners(filterPartners(pendingPartners)), [pendingPartners, sortColumn, sortDirection, cityFilter, specialtyFilter, tierFilter, statusFilter, expirationFilter]);
  const sortedApprovedPartners = useMemo(() => sortPartners(filterPartners(approvedPartners)), [approvedPartners, sortColumn, sortDirection, cityFilter, specialtyFilter, tierFilter, statusFilter, expirationFilter]);
  const sortedAllPartners = useMemo(() => sortPartners(filterPartners(allPartners || [])), [allPartners, sortColumn, sortDirection, cityFilter, specialtyFilter, tierFilter, statusFilter, expirationFilter]);

  // Get unique cities for filter
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    allPartners?.forEach((p) => cities.add(p.city));
    return Array.from(cities).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [allPartners]);

  const clearFilters = () => {
    setCityFilter("");
    setSpecialtyFilter("all");
    setTierFilter("all");
    setStatusFilter("all");
    setExpirationFilter("all");
  };

  const hasActiveFilters = cityFilter || specialtyFilter !== "all" || tierFilter !== "all" || statusFilter !== "all" || expirationFilter !== "all";

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Redirect non-admins - only after loading is complete
  useEffect(() => {
    // Wait for both auth and admin status to be fully loaded
    if (authLoading || adminLoading) {
      return;
    }
    
    // Only redirect if user is not logged in or confirmed not admin
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

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setEditModalOpen(true);
  };

  const handleDelete = (partner: Partner) => {
    setPartnerToDelete(partner);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (partnerToDelete) {
      rejectPartner.mutate(partnerToDelete.id);
      setDeleteDialogOpen(false);
      setPartnerToDelete(null);
    }
  };

  const handleSaveEdit = (updatedPartner: Partial<Partner> & { id: string }) => {
    updatePartner.mutate(updatedPartner, {
      onSuccess: () => {
        setEditModalOpen(false);
        setSelectedPartner(null);
      },
    });
  };

  const handleCreate = (newPartner: Parameters<typeof createPartner.mutate>[0]) => {
    createPartner.mutate(newPartner, {
      onSuccess: () => {
        setCreateModalOpen(false);
      },
    });
  };

  const renderPartnerRow = (partner: Partner) => {
    const tier = tierConfig[partner.tier] || tierConfig.apoiador;
    const daysRemaining = getDaysRemaining(partner.expires_at);
    const daysStyle = getDaysRemainingStyle(daysRemaining);

    return (
      <TableRow key={partner.id}>
        <TableCell className="font-medium">{partner.name}</TableCell>
        <TableCell>{partner.city}</TableCell>
        <TableCell>{partner.specialty || "-"}</TableCell>
        <TableCell>
          <Badge variant="outline" className={tier.className}>
            <span className="flex items-center gap-1">
              {tier.icon}
              {tier.label}
            </span>
          </Badge>
        </TableCell>
        <TableCell>
          {partner.is_approved ? (
            <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Ativo</Badge>
          ) : (
            <Badge variant="secondary">Inativo</Badge>
          )}
        </TableCell>
        <TableCell className="text-sm">{partner.referrer_name || "—"}</TableCell>
        <TableCell className="text-sm">{partner.referrer_phone || "—"}</TableCell>
        <TableCell>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 px-2 text-left font-normal justify-start",
                  !partner.expires_at && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {partner.expires_at
                  ? format(parseLocalDate(partner.expires_at), "dd/MM/yyyy", { locale: ptBR })
                  : "—"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={partner.expires_at ? parseLocalDate(partner.expires_at) : undefined}
                onSelect={(date) => handleExpirationChange(partner, date)}
                initialFocus
                className="pointer-events-auto"
              />
              {partner.expires_at && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => handleExpirationChange(partner, undefined)}
                  >
                    Remover data
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </TableCell>
        <TableCell className={daysStyle.className}>
          {daysStyle.text}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Switch
              checked={partner.is_approved}
              onCheckedChange={(checked) =>
                togglePartnerStatus.mutate({ partnerId: partner.id, isApproved: checked })
              }
              disabled={togglePartnerStatus.isPending}
              aria-label={partner.is_approved ? "Desativar parceiro" : "Ativar parceiro"}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => handleEdit(partner)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(partner)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderTable = (partners: Partner[]) => (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("name")}>
              <span className="flex items-center">Nome{getSortIcon("name")}</span>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("city")}>
              <span className="flex items-center">Cidade{getSortIcon("city")}</span>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("specialty")}>
              <span className="flex items-center">Especialidade{getSortIcon("specialty")}</span>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("tier")}>
              <span className="flex items-center">Nível{getSortIcon("tier")}</span>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("is_approved")}>
              <span className="flex items-center">Status{getSortIcon("is_approved")}</span>
            </TableHead>
            <TableHead>Indicado por</TableHead>
            <TableHead>WhatsApp Indicador</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("expires_at")}>
              <span className="flex items-center">Expiração{getSortIcon("expires_at")}</span>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("expires_at")}>
              <span className="flex items-center">Dias{getSortIcon("expires_at")}</span>
            </TableHead>
            <TableHead className="w-[140px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                Nenhum parceiro encontrado
              </TableCell>
            </TableRow>
          ) : (
            partners.map(renderPartnerRow)
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Administração de Parceiros</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os parceiros cadastrados na plataforma
              </p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Parceiro
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                <Input
                  placeholder="Filtrar por cidade..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-48"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Especialidade</label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {partnerSpecialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Nível</label>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="ouro">Ouro</SelectItem>
                    <SelectItem value="apoiador">Apoiador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Expiração</label>
                <Select value={expirationFilter} onValueChange={setExpirationFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="expired">Expirados</SelectItem>
                    <SelectItem value="expiring_week">Expira em 7 dias</SelectItem>
                    <SelectItem value="expiring_soon">Expira em 30 dias</SelectItem>
                    <SelectItem value="no_expiration">Sem data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  Pendentes
                  {sortedPendingPartners.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {sortedPendingPartners.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Aprovados ({sortedApprovedPartners.length})</TabsTrigger>
                <TabsTrigger value="all">Todos ({sortedAllPartners.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">{renderTable(sortedPendingPartners)}</TabsContent>
              <TabsContent value="approved">{renderTable(sortedApprovedPartners)}</TabsContent>
              <TabsContent value="all">{renderTable(sortedAllPartners)}</TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <EditPartnerModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        partner={selectedPartner}
        onSave={handleSaveEdit}
        isLoading={updatePartner.isPending}
      />

      <CreatePartnerModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreate}
        isLoading={createPartner.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Parceiro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{partnerToDelete?.name}</strong>? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPartners;
