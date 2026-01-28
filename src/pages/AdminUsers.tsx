import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAdminUsers, type AdminUser, type AppRole } from "@/hooks/useAdminUsers";
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
import { EditUserModal } from "@/components/admin/EditUserModal";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { UserRolesModal } from "@/components/admin/UserRolesModal";
import { UserGroupsModal } from "@/components/admin/UserGroupsModal";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ShieldAlert,
  Shield,
  Users,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; className: string }> = {
  admin: {
    label: "Admin",
    icon: <ShieldCheck className="h-3 w-3" />,
    className: "bg-red-500/20 text-red-700 border-red-500/30",
  },
  moderator: {
    label: "Mod",
    icon: <Shield className="h-3 w-3" />,
    className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  },
  user: {
    label: "User",
    icon: <User className="h-3 w-3" />,
    className: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  },
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const {
    users,
    isLoading,
    fetchUserGroups,
    updateUser,
    deleteUser,
    addRole,
    removeRole,
    createUser,
  } = useAdminUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [groupsModalOpen, setGroupsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

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

  const filteredUsers = users?.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.city?.toLowerCase().includes(search) ||
      u.whatsapp?.includes(search)
    );
  });

  const sortedUsers = filteredUsers?.slice().sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: string | number | null = null;
    let bValue: string | number | null = null;

    switch (sortColumn) {
      case "full_name":
        aValue = a.full_name?.toLowerCase() ?? "";
        bValue = b.full_name?.toLowerCase() ?? "";
        break;
      case "email":
        aValue = a.email?.toLowerCase() ?? "";
        bValue = b.email?.toLowerCase() ?? "";
        break;
      case "city":
        aValue = a.city?.toLowerCase() ?? "";
        bValue = b.city?.toLowerCase() ?? "";
        break;
      case "roles":
        aValue = a.roles?.length ?? 0;
        bValue = b.roles?.length ?? 0;
        break;
      case "created_at":
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case "last_sign_in_at":
        aValue = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
        bValue = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
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

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleManageRoles = (user: AdminUser) => {
    setSelectedUser(user);
    setRolesModalOpen(true);
  };

  const handleViewGroups = (user: AdminUser) => {
    setSelectedUser(user);
    setGroupsModalOpen(true);
  };

  const handleDelete = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete.user_id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSaveEdit = (updates: { full_name?: string; whatsapp?: string; city?: string | null }) => {
    if (selectedUser) {
      updateUser.mutate(
        { userId: selectedUser.user_id, updates },
        {
          onSuccess: () => {
            setEditModalOpen(false);
            setSelectedUser(null);
          },
        }
      );
    }
  };

  const handleCreate = (userData: {
    email: string;
    password: string;
    full_name: string;
    whatsapp: string;
    city?: string;
  }) => {
    createUser.mutate(userData, {
      onSuccess: () => {
        setCreateModalOpen(false);
      },
    });
  };

  const handleAddRole = (role: AppRole) => {
    if (selectedUser) {
      addRole.mutate({ userId: selectedUser.user_id, role });
    }
  };

  const handleRemoveRole = (role: AppRole) => {
    if (selectedUser) {
      removeRole.mutate({ userId: selectedUser.user_id, role });
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
              <h1 className="text-3xl font-bold">Administração de Usuários</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os usuários cadastrados na plataforma
              </p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, cidade..."
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
                  <TableHead><SortableHeader column="full_name">Nome</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="email">Email</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="city">Cidade</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="roles">Papéis</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="created_at">Cadastro</SortableHeader></TableHead>
                  <TableHead><SortableHeader column="last_sign_in_at">Último Login</SortableHeader></TableHead>
                  <TableHead className="w-[180px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedUsers?.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.city || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((role) => {
                              const config = roleConfig[role];
                              return (
                                <Badge key={role} variant="outline" className={config.className}>
                                  <span className="flex items-center gap-1">
                                    {config.icon}
                                    {config.label}
                                  </span>
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(u.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.last_sign_in_at 
                          ? format(new Date(u.last_sign_in_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleViewGroups(u)}
                            title="Ver grupos"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleManageRoles(u)}
                            title="Gerenciar papéis"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEdit(u)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(u)}
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
        {sortedUsers && (
          <p className="text-sm text-muted-foreground mt-4">
            {sortedUsers.length} usuário{sortedUsers.length !== 1 ? "s" : ""} encontrado{sortedUsers.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <EditUserModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={selectedUser}
        onSave={handleSaveEdit}
        isLoading={updateUser.isPending}
      />

      <CreateUserModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreate}
        isLoading={createUser.isPending}
      />

      <UserRolesModal
        open={rolesModalOpen}
        onOpenChange={setRolesModalOpen}
        user={selectedUser}
        onAddRole={handleAddRole}
        onRemoveRole={handleRemoveRole}
        isLoading={addRole.isPending || removeRole.isPending}
      />

      <UserGroupsModal
        open={groupsModalOpen}
        onOpenChange={setGroupsModalOpen}
        user={selectedUser}
        fetchUserGroups={fetchUserGroups}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o perfil de <strong>{userToDelete?.full_name}</strong>?
              Esta ação não pode ser desfeita.
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

export default AdminUsers;
