import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

interface NotificationPayload {
  event_type: "join_request" | "new_donation" | "new_member";
  leader_id: string;
  group_id: string;
  group_name: string;
  actor_name: string;
  details: {
    amount?: number;
    donation_type?: string;
    description?: string;
    request_id?: string;
    message?: string;
    member_id?: string;
  };
}

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

function generateNotificationContent(payload: NotificationPayload): {
  title: string;
  body: string;
} {
  const { event_type, group_name, actor_name, details } = payload;

  switch (event_type) {
    case "join_request":
      return {
        title: `Nova solicitação - ${group_name}`,
        body: `${actor_name} solicitou entrada no grupo`,
      };
    case "new_donation": {
      const amount = details.amount || 0;
      const donationType = details.donation_type || "doação";
      return {
        title: `Nova doação - ${group_name}`,
        body: `${actor_name} registrou ${amount} ${donationType}`,
      };
    }
    case "new_member":
      return {
        title: `Novo membro - ${group_name}`,
        body: `${actor_name} entrou no grupo`,
      };
    default:
      return {
        title: "Notificação",
        body: "Você tem uma nova notificação",
      };
  }
}

// Web push placeholder (não envia)
async function sendWebPush(): Promise<boolean> {
  return false;
}

async function sendFCM(
  subscription: PushSubscription,
  notification: { title: string; body: string },
  fcmServerKey: string
): Promise<boolean> {
  if (!subscription.device_token) return false;

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${fcmServerKey}`,
      },
      body: JSON.stringify({
        to: subscription.device_token,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: "/icon-192x192.png",
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        data: {
          title: notification.title,
          body: notification.body,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FCM error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending FCM:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 🔐 Internal protection (required)
  const internalSecret = Deno.env.get("INTERNAL_SECRET");
  const incoming = req.headers.get("x-internal-secret");
  if (!internalSecret || incoming !== internalSecret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { event_type, leader_id, group_id } = payload;

    if (!event_type || !leader_id || !group_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase env vars not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", leader_id)
      .single();

    const defaultPrefs: NotificationPreferences = {
      join_requests: true,
      new_donations: true,
      new_members: true,
    };
    const userPrefs = preferences || defaultPrefs;

    const shouldNotify =
      (event_type === "join_request" && userPrefs.join_requests) ||
      (event_type === "new_donation" && userPrefs.new_donations) ||
      (event_type === "new_member" && userPrefs.new_members);

    if (!shouldNotify) {
      return new Response(
        JSON.stringify({ success: true, message: "Notification disabled by user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", leader_id);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const notification = generateNotificationContent(payload);

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

    const results = await Promise.allSettled(
      subscriptions.map(async (sub: PushSubscription) => {
        if (sub.platform === "web" && vapidPublicKey && vapidPrivateKey) {
          return sendWebPush();
        } else if ((sub.platform === "android" || sub.platform === "ios") && fcmServerKey) {
          return sendFCM(sub, notification, fcmServerKey);
        }
        return false;
      })
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value === true
    ).length;

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: subscriptions.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
