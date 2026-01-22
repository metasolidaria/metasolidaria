import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAdminPartners } from "@/hooks/useAdminPartners";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { EditPartnerModal } from "@/components/EditPartnerModal";
import { CreatePartnerModal } from "@/components/CreatePartnerModal";
import {
  ArrowLeft,
  Check,
  X,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Gem,
  Medal,
  Heart,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Partner, PartnerTier } from "@/hooks/usePartners";

const tierConfig: Record<PartnerTier, { label: string; icon: React.ReactNode; className: string }> = {
  diamante: {
    label: "Diamante",
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
    approvePartner,
    rejectPartner,
    updatePartner,
    createPartner,
  } = useAdminPartners();

  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

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
            <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Aprovado</Badge>
          ) : (
            <Badge variant="secondary">Pendente</Badge>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {format(new Date(partner.created_at), "dd/MM/yyyy", { locale: ptBR })}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {!partner.is_approved && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => approvePartner.mutate(partner.id)}
                disabled={approvePartner.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                Pendentes
                {pendingPartners.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {pendingPartners.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Aprovados ({approvedPartners.length})</TabsTrigger>
              <TabsTrigger value="all">Todos ({allPartners?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">{renderTable(pendingPartners)}</TabsContent>
            <TabsContent value="approved">{renderTable(approvedPartners)}</TabsContent>
            <TabsContent value="all">{renderTable(allPartners || [])}</TabsContent>
          </Tabs>
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
