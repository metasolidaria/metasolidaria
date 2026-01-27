import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AdminGroup, GroupMember } from "@/hooks/useAdminGroups";

interface GroupMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AdminGroup | null;
  fetchGroupMembers: (groupId: string) => Promise<GroupMember[]>;
}

export const GroupMembersModal = ({
  open,
  onOpenChange,
  group,
  fetchGroupMembers,
}: GroupMembersModalProps) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && group) {
      setLoading(true);
      fetchGroupMembers(group.id)
        .then(setMembers)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, group, fetchGroupMembers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Membros do Grupo</DialogTitle>
          <DialogDescription>
            {group?.name} - {members.length} membro{members.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum membro encontrado.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Realizadas</TableHead>
                <TableHead>Entrada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    {member.user_id ? (
                      <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500/30">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Vinculado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                        <User className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.personal_goal || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.goals_reached}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};
