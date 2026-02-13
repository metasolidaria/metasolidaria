import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string | null;
  p256dh: string | null;
  auth: string | null;
  platform: "web" | "android" | "ios";
  device_token: string | null;
}

interface NotificationPreferences {
  join_requests: boolean;
  new_donations: boolean;
  new_members: boolean;
}

// Get VAPID public key from environment (for web push)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    join_requests: true,
    new_donations: true,
    new_members: true,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      // Check for Web Push support
      const webPushSupported =
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window;

      // Check for Capacitor Push support (native apps)
      const capacitorSupported = !!(window as any).Capacitor?.isNativePlatform?.();

      setIsSupported(webPushSupported || capacitorSupported);
    };

    checkSupport();
  }, []);

  // Load current subscription status and preferences
  useEffect(() => {
    const loadStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has any subscriptions
        const { data: subscriptions } = await supabase
          .from("push_subscriptions")
          .select("id")
          .eq("user_id", user.id);

        setIsEnabled(!!subscriptions && subscriptions.length > 0);

        // Load preferences
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (prefs) {
          setPreferences({
            join_requests: prefs.join_requests,
            new_donations: prefs.new_donations,
            new_members: prefs.new_members,
          });
        }
      } catch (error) {
        console.error("Error loading push status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [user?.id]);

  // Request permission and subscribe to push notifications
  const enableNotifications = useCallback(async () => {
    if (!user?.id) {
      toast.error("Você precisa estar logado");
      return false;
    }

    if (!isSupported) {
      toast.error("Notificações não são suportadas neste dispositivo");
      return false;
    }

    try {
      setIsLoading(true);

      // Check if we're on a native platform (Capacitor)
      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();

      if (isNative) {
        return await enableNativeNotifications();
      } else {
        return await enableWebNotifications();
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Erro ao ativar notificações");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isSupported]);

  // Enable web push notifications
  const enableWebNotifications = async (): Promise<boolean> => {
    if (!user?.id) return false;

    // Request notification permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      toast.error("Permissão de notificação negada");
      return false;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    const pushManager = (registration as any).pushManager;

    // Check if already subscribed
    let subscription = await pushManager.getSubscription();

    // If not subscribed, create new subscription
    if (!subscription) {
      if (!VAPID_PUBLIC_KEY) {
        console.error("VAPID public key not configured");
        toast.error("Configuração de notificações incompleta");
        return false;
      }

      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
    }

    // Extract keys from subscription
    const subscriptionJson = subscription.toJSON();
    const p256dh = subscriptionJson.keys?.p256dh || null;
    const auth = subscriptionJson.keys?.auth || null;

    // Save subscription to database
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        platform: "web",
        device_token: null,
      },
      {
        onConflict: "user_id,platform",
        ignoreDuplicates: false,
      }
    );

    if (error) {
      // Try insert if upsert fails
      const { error: insertError } = await supabase
        .from("push_subscriptions")
        .insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
          platform: "web",
          device_token: null,
        });

      if (insertError) {
        console.error("Error saving subscription:", insertError);
        toast.error("Erro ao salvar inscrição");
        return false;
      }
    }

    // Create default preferences if not exists
    await supabase.from("notification_preferences").upsert(
      {
        user_id: user.id,
        join_requests: true,
        new_donations: true,
        new_members: true,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      }
    );

    setIsEnabled(true);
    toast.success("Notificações ativadas!");
    return true;
  };

  // Enable native push notifications (Capacitor)
  const enableNativeNotifications = async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Dynamically import Capacitor Push Notifications
      const { PushNotifications } = await import("@capacitor/push-notifications");

      // Request permission
      const permissionResult = await PushNotifications.requestPermissions();

      if (permissionResult.receive !== "granted") {
        toast.error("Permissão de notificação negada");
        return false;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration token
      return new Promise((resolve) => {
        PushNotifications.addListener("registration", async (token) => {
          console.log("Push registration token:", token.value);

          // Determine platform
          const platform =
            (window as any).Capacitor?.getPlatform?.() === "ios" ? "ios" : "android";

          // Save token to database
          const { error } = await supabase.from("push_subscriptions").upsert(
            {
              user_id: user!.id,
              endpoint: null,
              p256dh: null,
              auth: null,
              platform,
              device_token: token.value,
            },
            {
              onConflict: "user_id,platform",
              ignoreDuplicates: false,
            }
          );

          if (error) {
            // Try insert if upsert fails
            await supabase.from("push_subscriptions").insert({
              user_id: user!.id,
              endpoint: null,
              p256dh: null,
              auth: null,
              platform,
              device_token: token.value,
            });
          }

          // Create default preferences
          await supabase.from("notification_preferences").upsert(
            {
              user_id: user!.id,
              join_requests: true,
              new_donations: true,
              new_members: true,
            },
            {
              onConflict: "user_id",
              ignoreDuplicates: true,
            }
          );

          setIsEnabled(true);
          toast.success("Notificações ativadas!");
          resolve(true);
        });

        PushNotifications.addListener("registrationError", (error) => {
          console.error("Push registration error:", error);
          toast.error("Erro ao registrar notificações");
          resolve(false);
        });
      });
    } catch (error) {
      console.error("Error with native notifications:", error);
      toast.error("Erro ao ativar notificações nativas");
      return false;
    }
  };

  // Disable push notifications
  const disableNotifications = useCallback(async () => {
    if (!user?.id) return false;

    try {
      setIsLoading(true);

      // Delete all subscriptions for this user
      const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting subscriptions:", error);
        toast.error("Erro ao desativar notificações");
        return false;
      }

      // Unsubscribe from web push if applicable
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await (registration as any).pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      setIsEnabled(false);
      toast.success("Notificações desativadas");
      return true;
    } catch (error) {
      console.error("Error disabling notifications:", error);
      toast.error("Erro ao desativar notificações");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Update notification preferences
  const updatePreferences = useCallback(
    async (newPrefs: Partial<NotificationPreferences>) => {
      if (!user?.id) return false;

      try {
        const updatedPrefs = { ...preferences, ...newPrefs };

        const { error } = await supabase
          .from("notification_preferences")
          .upsert(
            {
              user_id: user.id,
              ...updatedPrefs,
            },
            {
              onConflict: "user_id",
            }
          );

        if (error) {
          console.error("Error updating preferences:", error);
          toast.error("Erro ao atualizar preferências");
          return false;
        }

        setPreferences(updatedPrefs);
        toast.success("Preferências atualizadas");
        return true;
      } catch (error) {
        console.error("Error updating preferences:", error);
        toast.error("Erro ao atualizar preferências");
        return false;
      }
    },
    [user?.id, preferences]
  );

  return {
    isSupported,
    isEnabled,
    isLoading,
    preferences,
    enableNotifications,
    disableNotifications,
    updatePreferences,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
