import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

// =========================
// Coordenadas das cidades
// =========================

const rawCityCoordinates: Record<string, { lat: number; lng: number }> = {
  "são paulo": { lat: -23.5505, lng: -46.6333 },
  "rio de janeiro": { lat: -22.9068, lng: -43.1729 },
  "brasília": { lat: -15.7975, lng: -47.8919 },
  "belo horizonte": { lat: -19.9167, lng: -43.9345 },
  "curitiba": { lat: -25.4284, lng: -49.2733 },
  "porto alegre": { lat: -30.0346, lng: -51.2177 },
  "campinas": { lat: -22.9099, lng: -47.0626 },
  "ribeirão preto": { lat: -21.1704, lng: -47.8103 },
  "santos": { lat: -23.9618, lng: -46.3322 },
  "sorocaba": { lat: -23.5015, lng: -47.4526 },
  "pouso alegre": { lat: -22.2300, lng: -45.9361 },
  "itajubá": { lat: -22.4256, lng: -45.4528 },
  "ouro fino": { lat: -22.2844, lng: -46.3694 },
  // Você pode expandir depois
};

// =========================
// Normalização
// =========================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Criar dicionário normalizado
const cityCoordinates: Record<string, { lat: number; lng: number }> =
  Object.fromEntries(
    Object.entries(rawCityCoordinates).map(([city, coords]) => [
      normalizeText(city),
      coords,
    ])
  );

function findCityCoordinates(cityName: string): { lat: number; lng: number } | null {
  if (!cityName) return null;

  const normalized = normalizeText(cityName.split(",")[0]);

  if (cityCoordinates[normalized]) {
    return cityCoordinates[normalized];
  }

  // Busca parcial
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return coords;
    }
  }

  return null;
}

// =========================
// Server
// =========================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 🔐 Proteção CRON
  const cronSecret = Deno.env.get("CRON_SECRET");
  const incomingSecret = req.headers.get("x-cron-secret");

  if (!cronSecret || incomingSecret !== cronSecret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase env vars not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: partners, error: fetchError } = await supabase
      .from("partners")
      .select("id, city")
      .is("latitude", null)
      .limit(100);

    if (fetchError) throw fetchError;

    if (!partners || partners.length === 0) {
      return new Response(
        JSON.stringify({
          message: "Nenhum parceiro sem coordenadas encontrado",
          updated: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let updated = 0;
    let notFound = 0;

    for (const partner of partners) {
      const coords = findCityCoordinates(partner.city);

      if (coords) {
        const { error: updateError } = await supabase
          .from("partners")
          .update({ latitude: coords.lat, longitude: coords.lng })
          .eq("id", partner.id);

        if (!updateError) updated++;
      } else {
        notFound++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Geocodificação concluída",
        total: partners.length,
        updated,
        notFound,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
