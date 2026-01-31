import { Bell, BellOff, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export const NotificationSettings = () => {
  const {
    isSupported,
    isEnabled,
    isLoading,
    preferences,
    enableNotifications,
    disableNotifications,
    updatePreferences,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <BellOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Notificações push não são suportadas neste navegador/dispositivo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Notificações Push</h3>
            <p className="text-sm text-muted-foreground">
              Receba alertas sobre seus grupos
            </p>
          </div>
        </div>

        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : isEnabled ? (
          <Button
            variant="outline"
            size="sm"
            onClick={disableNotifications}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            Desativar
          </Button>
        ) : (
          <Button
            variant="hero"
            size="sm"
            onClick={enableNotifications}
          >
            Ativar
          </Button>
        )}
      </div>

      {isEnabled && (
        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Notificar quando:
          </p>

          <div className="flex items-center justify-between">
            <Label
              htmlFor="notify-join-requests"
              className="text-sm text-foreground cursor-pointer"
            >
              Alguém solicitar entrada no grupo
            </Label>
            <Switch
              id="notify-join-requests"
              checked={preferences.join_requests}
              onCheckedChange={(checked) =>
                updatePreferences({ join_requests: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label
              htmlFor="notify-donations"
              className="text-sm text-foreground cursor-pointer"
            >
              Membro registrar uma doação
            </Label>
            <Switch
              id="notify-donations"
              checked={preferences.new_donations}
              onCheckedChange={(checked) =>
                updatePreferences({ new_donations: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label
              htmlFor="notify-members"
              className="text-sm text-foreground cursor-pointer"
            >
              Novo membro entrar no grupo
            </Label>
            <Switch
              id="notify-members"
              checked={preferences.new_members}
              onCheckedChange={(checked) =>
                updatePreferences({ new_members: checked })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
