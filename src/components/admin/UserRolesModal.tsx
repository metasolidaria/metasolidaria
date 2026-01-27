import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, User, Plus, X, Loader2 } from "lucide-react";
import type { AdminUser, AppRole } from "@/hooks/useAdminUsers";

interface UserRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onAddRole: (role: AppRole) => void;
  onRemoveRole: (role: AppRole) => void;
  isLoading: boolean;
}

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; className: string }> = {
  admin: {
    label: "Administrador",
    icon: <ShieldCheck className="h-3 w-3" />,
    className: "bg-red-500/20 text-red-700 border-red-500/30",
  },
  moderator: {
    label: "Moderador",
    icon: <Shield className="h-3 w-3" />,
    className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  },
  user: {
    label: "Usuário",
    icon: <User className="h-3 w-3" />,
    className: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  },
};

const allRoles: AppRole[] = ["admin", "moderator", "user"];

export const UserRolesModal = ({
  open,
  onOpenChange,
  user,
  onAddRole,
  onRemoveRole,
  isLoading,
}: UserRolesModalProps) => {
  const userRoles = user?.roles || [];
  const availableRoles = allRoles.filter((role) => !userRoles.includes(role));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Papéis</DialogTitle>
          <DialogDescription>
            Gerencie os papéis de {user?.full_name || user?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Papéis Atuais</h4>
            {userRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum papel atribuído</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userRoles.map((role) => {
                  const config = roleConfig[role];
                  return (
                    <Badge
                      key={role}
                      variant="outline"
                      className={`${config.className} pr-1 flex items-center gap-1`}
                    >
                      {config.icon}
                      {config.label}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={() => onRemoveRole(role)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {availableRoles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Adicionar Papel</h4>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((role) => {
                  const config = roleConfig[role];
                  return (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => onAddRole(role)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      {config.icon}
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
