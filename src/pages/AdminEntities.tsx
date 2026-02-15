import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAdminEntities, type AdminEntity } from "@/hooks/useAdminEntities";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CreateEntityModal } from "@/components/admin/CreateEntityModal";
import { EditEntityModal } from "@/components/admin/EditEntityModal";
import { Search, Plus, Pencil, Trash2, Building2, Phone, MapPin, Loader2, Gift, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminEntities = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { entities, isLoading, createEntity, updateEntity, deleteEntity } = useAdminEntities();

  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<AdminEntity | null>(null);

  useEffect(() => {
    if (!isAdminLoading && isAdmin === false) {
      navigate("/");
    }
  }, [isAdmin, isAdminLoading, navigate]);

  if (isAdminLoading || isAdmin === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const normalizeText = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredEntities = entities.filter((entity) => {
    const searchNormalized = normalizeText(search);
    return (
      normalizeText(entity.name).includes(searchNormalized) ||
      normalizeText(entity.city).includes(searchNormalized)
    );
  });

  const sortedEntities = filteredEntities.slice().sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: string | number | null = null;
    let bValue: string | number | null = null;

    switch (sortColumn) {
      case "name":
        aValue = a.name?.toLowerCase() ?? "";
        bValue = b.name?.toLowerCase() ?? "";
        break;
      case "city":
        aValue = a.city?.toLowerCase() ?? "";
        bValue = b.city?.toLowerCase() ?? "";
        break;
      case "groups_count":
        aValue = a.groups_count ?? 0;
        bValue = b.groups_count ?? 0;
        break;
      case "total_donated":
        aValue = a.total_donated ?? 0;
        bValue = b.total_donated ?? 0;
        break;
      case "created_at":
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(column)}
      className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground hover:bg-transparent"
    >
      {children}
      {sortColumn === column ? (
        sortDirection === "asc" ? (
          <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  );

  const handleCreate = (data: { name: string; city: string; phone?: string }) => {
    createEntity.mutate(data, {
      onSuccess: () => setCreateModalOpen(false),
    });
  };

  const handleEdit = (data: { id: string; name: string; city: string; phone?: string }) => {
    updateEntity.mutate(data, {
      onSuccess: () => {
        setEditModalOpen(false);
        setSelectedEntity(null);
      },
    });
  };

  const handleDelete = () => {
    if (!selectedEntity) return;
    deleteEntity.mutate(selectedEntity.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedEntity(null);
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onAuthClick={() => {}} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                Administração de Instituições
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as instituições beneficentes cadastradas
              </p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Instituição
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader column="name">Nome</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="city">Cidade</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="groups_count">Grupos</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="total_donated">Doações</SortableHeader></TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead><SortableHeader column="created_at">Cadastrado em</SortableHeader></TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : sortedEntities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {search ? "Nenhuma instituição encontrada" : "Nenhuma instituição cadastrada"}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {entity.city}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {entity.groups_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium text-primary">
                          <Gift className="w-3 h-3" />
                          {entity.total_donated.toLocaleString("pt-BR")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entity.phone ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {entity.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(entity.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEntity(entity);
                              setEditModalOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedEntity(entity);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Stats */}
          <p className="text-sm text-muted-foreground">
            {sortedEntities.length} instituiç{sortedEntities.length !== 1 ? "ões" : "ão"} encontrada{sortedEntities.length !== 1 ? "s" : ""}
          </p>
        </div>
      </main>

      <Footer />

      {/* Create Modal */}
      <CreateEntityModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
        isLoading={createEntity.isPending}
      />

      {/* Edit Modal */}
      <EditEntityModal
        entity={selectedEntity}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSubmit={handleEdit}
        isLoading={updateEntity.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
             <AlertDialogTitle>Excluir Instituição</AlertDialogTitle>
             <AlertDialogDescription>
               Tem certeza que deseja excluir a instituição "{selectedEntity?.name}"? 
               Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEntity.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEntities;
