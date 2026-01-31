import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

// Helper to generate notification content based on event type
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
    case "new_donation":
      const amount = details.amount || 0;
      const donationType = details.donation_type || "doação";
      return {
        title: `Nova doação - ${group_name}`,
        body: `${actor_name} registrou ${amount} ${donationType}`,
      };
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

// Send Web Push notification using fetch (no external library)
async function sendWebPush(
  subscription: PushSubscription,
  notification: { title: string; body: string },
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
    console.log("Missing web push subscription data");
    return false;
  }

  try {
    // For web push, we need to use a proper web push library
    // Since we can't easily use npm packages in Deno edge functions,
    // we'll rely on FCM for both web and native
    // Web clients will use the Firebase SDK for receiving
    console.log("Web push subscription found - using FCM fallback");
    return false;
  } catch (error) {
    console.error("Error sending web push:", error);
    return false;
  }
}

// Send FCM notification (for Android/iOS via Firebase)
async function sendFCM(
  subscription: PushSubscription,
  notification: { title: string; body: string },
  fcmServerKey: string
): Promise<boolean> {
  if (!subscription.device_token) {
    console.log("Missing FCM device token");
    return false;
  }

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

    console.log("FCM notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending FCM:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log("Received notification request:", payload);

    const { event_type, leader_id, group_id, group_name, actor_name, details } =
      payload;

    if (!event_type || !leader_id || !group_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get notification preferences for the leader
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", leader_id)
      .single();

    // Check if leader wants this type of notification
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
      console.log("User has disabled this notification type");
      return new Response(
        JSON.stringify({ success: true, message: "Notification disabled by user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push subscriptions for the leader
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
      console.log("No push subscriptions found for leader");
      return new Response(
        JSON.stringify({ success: true, message: "No subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate notification content
    const notification = generateNotificationContent(payload);
    console.log("Generated notification:", notification);

    // Get secrets for push services
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: PushSubscription) => {
        if (sub.platform === "web" && vapidPublicKey && vapidPrivateKey) {
          return sendWebPush(sub, notification, vapidPublicKey, vapidPrivateKey);
        } else if (
          (sub.platform === "android" || sub.platform === "ios") &&
          fcmServerKey
        ) {
          return sendFCM(sub, notification, fcmServerKey);
        }
        return false;
      })
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value === true
    ).length;

    console.log(`Sent ${successCount}/${subscriptions.length} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total: subscriptions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
