import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Coordenadas aproximadas das capitais e principais cidades brasileiras
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  "são paulo": { lat: -23.5505, lng: -46.6333 },
  "rio de janeiro": { lat: -22.9068, lng: -43.1729 },
  "brasília": { lat: -15.7975, lng: -47.8919 },
  "salvador": { lat: -12.9714, lng: -38.5014 },
  "fortaleza": { lat: -3.7172, lng: -38.5433 },
  "belo horizonte": { lat: -19.9167, lng: -43.9345 },
  "manaus": { lat: -3.1190, lng: -60.0217 },
  "curitiba": { lat: -25.4284, lng: -49.2733 },
  "recife": { lat: -8.0476, lng: -34.8770 },
  "porto alegre": { lat: -30.0346, lng: -51.2177 },
  "belém": { lat: -1.4558, lng: -48.4902 },
  "goiânia": { lat: -16.6869, lng: -49.2648 },
  "guarulhos": { lat: -23.4543, lng: -46.5337 },
  "campinas": { lat: -22.9099, lng: -47.0626 },
  "são luís": { lat: -2.5297, lng: -44.3028 },
  "são gonçalo": { lat: -22.8268, lng: -43.0634 },
  "maceió": { lat: -9.6658, lng: -35.7353 },
  "duque de caxias": { lat: -22.7858, lng: -43.3116 },
  "natal": { lat: -5.7945, lng: -35.2110 },
  "teresina": { lat: -5.0892, lng: -42.8019 },
  "campo grande": { lat: -20.4697, lng: -54.6201 },
  "são bernardo do campo": { lat: -23.6914, lng: -46.5646 },
  "nova iguaçu": { lat: -22.7590, lng: -43.4510 },
  "joão pessoa": { lat: -7.1195, lng: -34.8450 },
  "santo andré": { lat: -23.6737, lng: -46.5432 },
  "osasco": { lat: -23.5325, lng: -46.7917 },
  "são josé dos campos": { lat: -23.1791, lng: -45.8872 },
  "jaboatão dos guararapes": { lat: -8.1130, lng: -35.0160 },
  "ribeirão preto": { lat: -21.1704, lng: -47.8103 },
  "uberlândia": { lat: -18.9186, lng: -48.2772 },
  "contagem": { lat: -19.9318, lng: -44.0539 },
  "sorocaba": { lat: -23.5015, lng: -47.4526 },
  "aracaju": { lat: -10.9472, lng: -37.0731 },
  "feira de santana": { lat: -12.2669, lng: -38.9666 },
  "cuiabá": { lat: -15.6014, lng: -56.0979 },
  "joinville": { lat: -26.3045, lng: -48.8487 },
  "juiz de fora": { lat: -21.7642, lng: -43.3496 },
  "londrina": { lat: -23.3045, lng: -51.1696 },
  "aparecida de goiânia": { lat: -16.8198, lng: -49.2469 },
  "niterói": { lat: -22.8833, lng: -43.1033 },
  "ananindeua": { lat: -1.3655, lng: -48.3724 },
  "porto velho": { lat: -8.7612, lng: -63.9004 },
  "serra": { lat: -20.1285, lng: -40.3075 },
  "belford roxo": { lat: -22.7640, lng: -43.3988 },
  "caxias do sul": { lat: -29.1634, lng: -51.1797 },
  "campos dos goytacazes": { lat: -21.7545, lng: -41.3244 },
  "florianópolis": { lat: -27.5954, lng: -48.5480 },
  "mauá": { lat: -23.6678, lng: -46.4614 },
  "vila velha": { lat: -20.3297, lng: -40.2925 },
  "são joão de meriti": { lat: -22.8058, lng: -43.3729 },
  "são josé do rio preto": { lat: -20.8113, lng: -49.3758 },
  "santos": { lat: -23.9618, lng: -46.3322 },
  "mogi das cruzes": { lat: -23.5225, lng: -46.1852 },
  "betim": { lat: -19.9679, lng: -44.1984 },
  "diadema": { lat: -23.6863, lng: -46.6228 },
  "jundiaí": { lat: -23.1857, lng: -46.8978 },
  "maringá": { lat: -23.4205, lng: -51.9333 },
  "montes claros": { lat: -16.7281, lng: -43.8619 },
  "piracicaba": { lat: -22.7255, lng: -47.6492 },
  "carapicuíba": { lat: -23.5225, lng: -46.8353 },
  "olinda": { lat: -8.0089, lng: -34.8553 },
  "cariacica": { lat: -20.2639, lng: -40.4167 },
  "bauru": { lat: -22.3246, lng: -49.0871 },
  "anápolis": { lat: -16.3281, lng: -48.9534 },
  "vitória": { lat: -20.3155, lng: -40.3128 },
  "caucaia": { lat: -3.7365, lng: -38.6531 },
  "itaquaquecetuba": { lat: -23.4862, lng: -46.3486 },
  "blumenau": { lat: -26.9194, lng: -49.0661 },
  "franca": { lat: -20.5386, lng: -47.4008 },
  "ponta grossa": { lat: -25.0916, lng: -50.1668 },
  "paulista": { lat: -7.9406, lng: -34.8728 },
  "canoas": { lat: -29.9178, lng: -51.1839 },
  "petrolina": { lat: -9.3891, lng: -40.5027 },
  "pelotas": { lat: -31.7654, lng: -52.3376 },
  "vitória da conquista": { lat: -14.8615, lng: -40.8442 },
  "cascavel": { lat: -24.9555, lng: -53.4552 },
  "ribeirão das neves": { lat: -19.7667, lng: -44.0833 },
  "praia grande": { lat: -24.0058, lng: -46.4022 },
  "santa maria": { lat: -29.6868, lng: -53.8149 },
  "guarujá": { lat: -23.9935, lng: -46.2564 },
  "governador valadares": { lat: -18.8510, lng: -41.9494 },
  "são vicente": { lat: -23.9608, lng: -46.3958 },
  "novo hamburgo": { lat: -29.6787, lng: -51.1306 },
  "juazeiro do norte": { lat: -7.2130, lng: -39.3150 },
  "são josé dos pinhais": { lat: -25.5304, lng: -49.2065 },
  "limeira": { lat: -22.5649, lng: -47.4013 },
  "caruaru": { lat: -8.2760, lng: -35.9819 },
  "sumaré": { lat: -22.8209, lng: -47.2669 },
  "taboão da serra": { lat: -23.6218, lng: -46.7582 },
  "barueri": { lat: -23.5057, lng: -46.8768 },
  "palmas": { lat: -10.2128, lng: -48.3603 },
  "embu das artes": { lat: -23.6491, lng: -46.8519 },
  "várzea grande": { lat: -15.6469, lng: -56.1322 },
  "taubaté": { lat: -23.0259, lng: -45.5558 },
  "suzano": { lat: -23.5444, lng: -46.3106 },
  "gravataí": { lat: -29.9436, lng: -50.9917 },
  "volta redonda": { lat: -22.5232, lng: -44.1041 },
  "viamão": { lat: -30.0811, lng: -51.0233 },
  "imperatriz": { lat: -5.5264, lng: -47.4916 },
  "ipatinga": { lat: -19.4686, lng: -42.5365 },
  "mossoró": { lat: -5.1878, lng: -37.3442 },
  "parnamirim": { lat: -5.9156, lng: -35.2627 },
  "cotia": { lat: -23.6035, lng: -46.9192 },
  "são carlos": { lat: -22.0087, lng: -47.8909 },
  "araraquara": { lat: -21.7845, lng: -48.1756 },
  "jacareí": { lat: -23.3050, lng: -45.9658 },
  "são leopoldo": { lat: -29.7545, lng: -51.1477 },
  "americana": { lat: -22.7392, lng: -47.3316 },
  "marília": { lat: -22.2140, lng: -49.9458 },
  "presidente prudente": { lat: -22.1259, lng: -51.3885 },
  "itaboraí": { lat: -22.7434, lng: -42.8594 },
  "santa luzia": { lat: -19.7696, lng: -43.8514 },
  "divinópolis": { lat: -20.1394, lng: -44.8839 },
  "macapá": { lat: 0.0356, lng: -51.0705 },
  "sete lagoas": { lat: -19.4658, lng: -44.2467 },
  "rio branco": { lat: -9.9754, lng: -67.8249 },
  "cabo frio": { lat: -22.8894, lng: -42.0286 },
  "boa vista": { lat: 2.8235, lng: -60.6758 },
  "uberaba": { lat: -19.7473, lng: -47.9381 },
  "magé": { lat: -22.6527, lng: -43.0406 },
  "itabuna": { lat: -14.7876, lng: -39.2781 },
  "hortolândia": { lat: -22.8584, lng: -47.2200 },
  "são josé": { lat: -27.6136, lng: -48.6366 },
  "indaiatuba": { lat: -23.0903, lng: -47.2181 },
  "itapecerica da serra": { lat: -23.7168, lng: -46.8493 },
  "itapevi": { lat: -23.5489, lng: -46.9344 },
  "colombo": { lat: -25.2927, lng: -49.2241 },
  "santa bárbara d'oeste": { lat: -22.7541, lng: -47.4141 },
  "criciúma": { lat: -28.6775, lng: -49.3697 },
  "alvorada": { lat: -29.9905, lng: -51.0811 },
  "ferraz de vasconcelos": { lat: -23.5412, lng: -46.3689 },
  "angra dos reis": { lat: -23.0067, lng: -44.3181 },
  "marabá": { lat: -5.3687, lng: -49.1178 },
  "rondonópolis": { lat: -16.4673, lng: -54.6372 },
  "arapiraca": { lat: -9.7522, lng: -36.6611 },
  "luziânia": { lat: -16.2525, lng: -47.9501 },
  "rio grande": { lat: -32.0349, lng: -52.0986 },
  "foz do iguaçu": { lat: -25.5478, lng: -54.5882 },
  "passo fundo": { lat: -28.2576, lng: -52.4091 },
  "teresópolis": { lat: -22.4121, lng: -42.9655 },
  "francisco morato": { lat: -23.2819, lng: -46.7453 },
  "novo gama": { lat: -16.0594, lng: -48.0406 },
  "dourados": { lat: -22.2211, lng: -54.8056 },
  "são caetano do sul": { lat: -23.6229, lng: -46.5548 },
  "águas lindas de goiás": { lat: -15.7619, lng: -48.2817 },
  "poços de caldas": { lat: -21.7878, lng: -46.5614 },
  "pindamonhangaba": { lat: -22.9242, lng: -45.4617 },
  "barra mansa": { lat: -22.5444, lng: -44.1714 },
  "cachoeirinha": { lat: -29.9511, lng: -51.0939 },
  "ji-paraná": { lat: -10.8853, lng: -61.9517 },
  "ilhéus": { lat: -14.7881, lng: -39.0493 },
  "campina grande": { lat: -7.2306, lng: -35.8811 },
  "sinop": { lat: -11.8606, lng: -55.5094 },
  "santarém": { lat: -2.4306, lng: -54.7028 },
  "sobral": { lat: -3.6861, lng: -40.3508 },
  "itajaí": { lat: -26.9078, lng: -48.6619 },
  "chapecó": { lat: -27.0964, lng: -52.6183 },
  "lages": { lat: -27.8161, lng: -50.3261 },
  "macaé": { lat: -22.3768, lng: -41.7869 },
  "resende": { lat: -22.4686, lng: -44.4467 },
  "valparaíso de goiás": { lat: -16.0681, lng: -47.9750 },
  // Sul de Minas e região
  "monte sião": { lat: -22.4333, lng: -46.5667 },
  "jacutinga": { lat: -22.2869, lng: -46.6167 },
  "inconfidentes": { lat: -22.3167, lng: -46.3333 },
  "bueno brandão": { lat: -22.4394, lng: -46.3489 },
  "ouro fino": { lat: -22.2844, lng: -46.3694 },
  "águas de lindóia": { lat: -22.4761, lng: -46.6314 },
  "lindóia": { lat: -22.5228, lng: -46.6500 },
  "serra negra": { lat: -22.6119, lng: -46.7008 },
  "socorro": { lat: -22.5906, lng: -46.5289 },
  "borda da mata": { lat: -22.2700, lng: -46.1656 },
  "pouso alegre": { lat: -22.2300, lng: -45.9361 },
  "itajubá": { lat: -22.4256, lng: -45.4528 },
  "santa rita do sapucaí": { lat: -22.2514, lng: -45.7033 },
};

// Normalizar texto removendo acentos
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Encontrar coordenadas para uma cidade
function findCityCoordinates(cityName: string): { lat: number; lng: number } | null {
  const normalized = normalizeText(cityName.split(",")[0]); // Remove estado se presente
  
  if (cityCoordinates[normalized]) {
    return cityCoordinates[normalized];
  }
  
  // Tentar encontrar parcial
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return coords;
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar parceiros sem coordenadas
    const { data: partners, error: fetchError } = await supabase
      .from("partners")
      .select("id, city")
      .is("latitude", null)
      .limit(100);

    if (fetchError) {
      throw fetchError;
    }

    if (!partners || partners.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum parceiro sem coordenadas encontrado", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let updated = 0;
    let notFound = 0;
    const updates: { id: string; city: string; coords: { lat: number; lng: number } | null }[] = [];

    for (const partner of partners) {
      const coords = findCityCoordinates(partner.city);
      updates.push({ id: partner.id, city: partner.city, coords });
      
      if (coords) {
        const { error: updateError } = await supabase
          .from("partners")
          .update({ latitude: coords.lat, longitude: coords.lng })
          .eq("id", partner.id);

        if (!updateError) {
          updated++;
        }
      } else {
        notFound++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Geocodificação concluída`,
        total: partners.length,
        updated,
        notFound,
        remaining: partners.length > 100 ? "Execute novamente para processar mais" : "Todos processados",
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
