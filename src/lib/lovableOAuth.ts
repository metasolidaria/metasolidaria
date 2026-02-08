import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

const PUBLISHED_BROKER_ORIGIN = "https://metasolidaria.lovable.app";

function resolveBrokerOrigin() {
  // On Lovable-hosted domains, the broker route (/~oauth/initiate) exists on the same origin.
  // On custom domains, that route may not be available, causing a SPA 404.
  const host = window.location.hostname;
  const isLovableHosted =
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host.includes("lovableproject.com");

  return isLovableHosted ? window.location.origin : PUBLISHED_BROKER_ORIGIN;
}

function createAuthForCurrentOrigin() {
  const brokerOrigin = resolveBrokerOrigin();
  return createLovableAuth({
    oauthBrokerUrl: `${brokerOrigin}/~oauth/initiate`,
    supportedOAuthOrigins: ["https://oauth.lovable.app"],
  });
}

export async function signInWithCloudOAuth(
  provider: "google" | "apple",
  opts?: { redirect_uri?: string; extraParams?: Record<string, string> }
): Promise<
  | { tokens: { access_token: string; refresh_token: string }; error: null; redirected?: false }
  | { tokens?: undefined; error: Error; redirected?: false }
  | { tokens?: undefined; error: null; redirected: true }
> {
  const auth = createAuthForCurrentOrigin();
  const result = await auth.signInWithOAuth(provider, opts);

  if (result.redirected) return result;
  if (result.error) return result;

  try {
    await supabase.auth.setSession(result.tokens);
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }

  return result;
}
