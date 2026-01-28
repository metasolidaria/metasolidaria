import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAdminGroups, type AdminGroup } from "@/hooks/useAdminGroups";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { EditGroupAdminModal } from "@/components/admin/EditGroupAdminModal";
import { GroupMembersModal } from "@/components/admin/GroupMembersModal";
import { AddMemberToGroupModal } from "@/components/admin/AddMemberToGroupModal";
import { CreateGroupAdminModal } from "@/components/admin/CreateGroupAdminModal";
import { LeaderInfoPopover } from "@/components/admin/LeaderInfoPopover";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  ShieldAlert,
  Users,
  Search,
  Lock,
  Globe,
  ExternalLink,
  UserPlus,
  Plus,
  Link,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminGroups = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const {
    groups,
    isLoading,
    fetchGroupMembers,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    fetchAllUsers,
  } = useAdminGroups();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedGroup, setSelectedGroup] = useState<AdminGroup | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<AdminGroup | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [groupToInvite, setGroupToInvite] = useState<AdminGroup | null>(null);

  // Redirect non-admins
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

  const filteredGroups = groups?.filter((g) => {
    const search = searchTerm.toLowerCase();
    return (
      g.name?.toLowerCase().includes(search) ||
      g.city?.toLowerCase().includes(search) ||
      g.leader_name?.toLowerCase().includes(search) ||
      g.donation_type?.toLowerCase().includes(search)
    );
  });

  const sortedGroups = filteredGroups?.slice().sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: string | number | boolean | null = null;
    let bValue: string | number | boolean | null = null;

    switch (sortColumn) {
      case "name":
        aValue = a.name?.toLowerCase() ?? "";
        bValue = b.name?.toLowerCase() ?? "";
        break;
      case "city":
        aValue = a.city?.toLowerCase() ?? "";
        bValue = b.city?.toLowerCase() ?? "";
        break;
      case "donation_type":
        aValue = a.donation_type?.toLowerCase() ?? "";
        bValue = b.donation_type?.toLowerCase() ?? "";
        break;
      case "is_private":
        aValue = a.is_private ? 1 : 0;
        bValue = b.is_private ? 1 : 0;
        break;
      case "member_count":
        aValue = a.member_count ?? 0;
        bValue = b.member_count ?? 0;
        break;
      case "total_goals":
        aValue = a.total_goals ?? 0;
        bValue = b.total_goals ?? 0;
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

  const handleEdit = (group: AdminGroup) => {
    setSelectedGroup(group);
    setEditModalOpen(true);
  };

  const handleViewMembers = (group: AdminGroup) => {
    setSelectedGroup(group);
    setMembersModalOpen(true);
  };

  const handleAddMember = (group: AdminGroup) => {
    setSelectedGroup(group);
    setAddMemberModalOpen(true);
  };

  const handleInvite = (group: AdminGroup) => {
    setGroupToInvite(group);
    setInviteModalOpen(true);
  };

  const handleDelete = (group: AdminGroup) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (groupToDelete) {
      deleteGroup.mutate(groupToDelete.id);
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const handleSaveEdit = (updates: Parameters<typeof updateGroup.mutate>[0]["updates"]) => {
    if (selectedGroup) {
      updateGroup.mutate(
        { groupId: selectedGroup.id, updates },
        {
          onSuccess: () => {
            setEditModalOpen(false);
            setSelectedGroup(null);
          },
        }
      );
    }
  };

  const handleAddMemberSubmit = (userId: string, userName: string) => {
    if (selectedGroup) {
      addMemberToGroup.mutate(
        { groupId: selectedGroup.id, userId, userName },
        {
          onSuccess: () => {
            setAddMemberModalOpen(false);
            setSelectedGroup(null);
          },
        }
      );
    }
  };

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
              <h1 className="text-3xl font-bold">Administração de Grupos</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os grupos cadastrados na plataforma
              </p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Grupo
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cidade, líder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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
                  <TableHead><SortableHeader column="name">Nome</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="city">Cidade</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="donation_type">Tipo</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="is_private">Visibilidade</SortableHeader></TableHead>
                  <TableHead className="text-right"><SortableHeader column="member_count">Membros</SortableHeader></TableHead>
                  <TableHead className="text-right"><SortableHeader column="total_goals">Metas</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="created_at">Criação</SortableHeader></TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedGroups?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum grupo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedGroups?.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell>{g.city}</TableCell>
                      <TableCell>{g.donation_type}</TableCell>
                      <TableCell>
                        {g.is_private ? (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                            <Lock className="h-3 w-3 mr-1" />
                            Privado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500/30">
                            <Globe className="h-3 w-3 mr-1" />
                            Público
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{g.member_count}</TableCell>
                      <TableCell className="text-right">
                        {g.total_goals && g.total_goals > 0 ? g.total_goals : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(g.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => navigate(`/grupo/${g.id}`)}
                            title="Ver grupo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <LeaderInfoPopover
                            leaderName={g.leader_name}
                            leaderWhatsapp={g.leader_whatsapp}
                            leaderEmail={g.leader_email}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleViewMembers(g)}
                            title="Ver membros"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600 hover:text-green-700"
                            onClick={() => handleAddMember(g)}
                            title="Adicionar membro"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700"
                            onClick={() => handleInvite(g)}
                            title="Gerar link de convite"
                          >
                            <Link className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEdit(g)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(g)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Total count */}
        {sortedGroups && (
          <p className="text-sm text-muted-foreground mt-4">
            {sortedGroups.length} grupo{sortedGroups.length !== 1 ? "s" : ""} encontrado{sortedGroups.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <EditGroupAdminModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        group={selectedGroup}
        onSave={handleSaveEdit}
        isLoading={updateGroup.isPending}
      />

      <GroupMembersModal
        open={membersModalOpen}
        onOpenChange={setMembersModalOpen}
        group={selectedGroup}
        fetchGroupMembers={fetchGroupMembers}
      />

      <AddMemberToGroupModal
        open={addMemberModalOpen}
        onOpenChange={setAddMemberModalOpen}
        group={selectedGroup}
        onAdd={handleAddMemberSubmit}
        isLoading={addMemberToGroup.isPending}
        fetchAllUsers={fetchAllUsers}
      />

      <CreateGroupAdminModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo <strong>{groupToDelete?.name}</strong>?
              Esta ação irá remover todos os membros e dados associados. Esta ação não pode ser desfeita.
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

      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        groupId={groupToInvite?.id ?? null}
        groupName={groupToInvite?.name ?? undefined}
        groupDescription={groupToInvite?.description ?? undefined}
      />
    </div>
  );
};

export default AdminGroups;
