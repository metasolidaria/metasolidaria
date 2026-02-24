import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const SPONSORS_QUERY = `
query {
  user(login: "metasolidaria") {
    sponsorshipsAsMaintainer(first: 100, activeOnly: true) {
      nodes {
        sponsorEntity {
          ... on User {
            login
            name
            avatarUrl
            url
          }
          ... on Organization {
            login
            name
            avatarUrl
            url
          }
        }
        tier {
          name
          monthlyPriceInCents
        }
      }
    }
  }
}
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const githubPat = Deno.env.get("GITHUB_PAT");
    if (!githubPat) {
      throw new Error("GITHUB_PAT not configured");
    }

    // Fetch sponsors from GitHub GraphQL API
    const ghResponse = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubPat}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SPONSORS_QUERY }),
    });

    if (!ghResponse.ok) {
      const errorText = await ghResponse.text();
      throw new Error(`GitHub API error: ${ghResponse.status} - ${errorText}`);
    }

    const data = await ghResponse.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const nodes =
      data.data?.user?.sponsorshipsAsMaintainer?.nodes ?? [];

    // Connect to Supabase with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mark all existing sponsors as inactive
    await supabase
      .from("github_sponsors")
      .update({ is_active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Upsert active sponsors
    const now = new Date().toISOString();
    for (const node of nodes) {
      const entity = node.sponsorEntity;
      if (!entity?.login) continue;

      await supabase.from("github_sponsors").upsert(
        {
          github_login: entity.login,
          github_name: entity.name || entity.login,
          avatar_url: entity.avatarUrl,
          profile_url: entity.url,
          tier_name: node.tier?.name || null,
          tier_monthly_price: node.tier?.monthlyPriceInCents || 0,
          is_active: true,
          fetched_at: now,
        },
        { onConflict: "github_login" }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        sponsors_count: nodes.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching GitHub sponsors:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
  const cronSecret = Deno.env.get("CRON_SECRET");
const incoming = req.headers.get("x-cron-secret");
if (!cronSecret || incoming !== cronSecret) {
  return new Response("Unauthorized", { status: 401, headers: corsHeaders });
}  );
  }
});
