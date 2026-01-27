import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AdminGroup } from "@/hooks/useAdminGroups";

interface UserOption {
  user_id: string;
  full_name: string;
  email: string;
  city: string | null;
}

interface AddMemberToGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AdminGroup | null;
  onAdd: (userId: string, userName: string) => void;
  isLoading: boolean;
  fetchAllUsers: () => Promise<UserOption[]>;
}

export const AddMemberToGroupModal = ({
  open,
  onOpenChange,
  group,
  onAdd,
  isLoading,
  fetchAllUsers,
}: AddMemberToGroupModalProps) => {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      setSearchTerm("");
      setSelectedUser(null);
      fetchAllUsers()
        .then(setUsers)
        .catch(console.error)
        .finally(() => setLoadingUsers(false));
    }
  }, [open, fetchAllUsers]);

  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.city?.toLowerCase().includes(search)
    );
  });

  const handleAdd = () => {
    if (selectedUser) {
      onAdd(selectedUser.user_id, selectedUser.full_name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Membro</DialogTitle>
          <DialogDescription>
            Adicione um usuário ao grupo <strong>{group?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Usuário</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nome, email ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-[250px] rounded-md border">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado
                </p>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.user_id}
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedUser?.user_id === u.user_id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="font-medium">{u.full_name}</div>
                      <div className={`text-sm ${
                        selectedUser?.user_id === u.user_id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}>
                        {u.email} {u.city && `• ${u.city}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isLoading || !selectedUser}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
