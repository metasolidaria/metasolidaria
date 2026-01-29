import { UserPlus, Check, X, Clock, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useJoinRequests } from "@/hooks/useJoinRequests";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface JoinRequestsPanelProps {
  groupId: string;
}

export const JoinRequestsPanel = ({ groupId }: JoinRequestsPanelProps) => {
  const { pendingRequests, isLoading, approveRequest, rejectRequest } = useJoinRequests(groupId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-card rounded-2xl p-6 shadow-soft border-2 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-primary" />
        Solicitações de Entrada ({pendingRequests.length})
      </h2>

      <div className="space-y-3">
        {pendingRequests.map((request) => (
          <div 
            key={request.id}
            className="p-4 bg-muted/50 rounded-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">
                      {request.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {request.user_name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(request.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                {request.message && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    "{request.message}"
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => rejectRequest.mutate(request.id)}
                  disabled={rejectRequest.isPending || approveRequest.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => approveRequest.mutate(request.id)}
                  disabled={approveRequest.isPending || rejectRequest.isPending}
                >
                  {approveRequest.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
