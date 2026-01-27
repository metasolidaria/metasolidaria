import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AdminUser, UserGroup } from "@/hooks/useAdminUsers";

interface UserGroupsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  fetchUserGroups: (userId: string) => Promise<UserGroup[]>;
}

export const UserGroupsModal = ({
  open,
  onOpenChange,
  user,
  fetchUserGroups,
}: UserGroupsModalProps) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setIsLoading(true);
      fetchUserGroups(user.user_id)
        .then(setGroups)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [open, user, fetchUserGroups]);

  const handleViewGroup = (groupId: string) => {
    onOpenChange(false);
    navigate(`/grupo/${groupId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Grupos do Usuário</DialogTitle>
          <DialogDescription>
            Grupos que {user?.full_name || user?.email} participa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : groups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Este usuário não participa de nenhum grupo.
            </p>
          ) : (
            groups.map((group) => (
              <div
                key={group.group_id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{group.group_name}</span>
                      {group.is_leader && (
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                          <Crown className="h-3 w-3 mr-1" />
                          Líder
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Desde {format(new Date(group.joined_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewGroup(group.group_id)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
