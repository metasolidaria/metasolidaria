import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GroupData {
  name: string;
  city: string;
  donation_type: string;
  goal_2026: number;
  created_at: string;
}

interface Stats {
  totalProgress: number;
  progressPercentage: number;
  memberCount: number;
  entryCount: number;
}

interface MemberContribution {
  name: string;
  total_contributed: number;
  percentage_of_total: number;
}

interface RecentActivity {
  amount: number;
  date: string;
  description: string | null;
}

interface AnalysisRequest {
  group: GroupData;
  stats: Stats;
  memberContributions: MemberContribution[];
  recentActivity: RecentActivity[];
  donationLabel: string;
  donationUnit: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AnalysisRequest = await req.json();
    const { group, stats, memberContributions, recentActivity, donationLabel, donationUnit } = requestData;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Calculate days until end of 2026
    const endOf2026 = new Date("2026-12-31");
    const today = new Date();
    const daysRemaining = Math.ceil((endOf2026.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate current pace
    const groupCreatedAt = new Date(group.created_at);
    const daysActive = Math.max(1, Math.ceil((today.getTime() - groupCreatedAt.getTime()) / (1000 * 60 * 60 * 24)));
    const avgPerDay = stats.totalProgress / daysActive;
    const projectedTotal = stats.totalProgress + (avgPerDay * daysRemaining);

    const systemPrompt = `Você é um analista especializado em grupos de doação solidária no Brasil.
Analise os dados do grupo e forneça insights acionáveis e motivadores.
Seja conciso, positivo mas realista. Use emojis moderadamente para tornar a análise mais amigável.
Responda APENAS usando a função analyze_group_progress.`;

    const userPrompt = `Analise o grupo "${group.name}" de ${group.city}:

📊 DADOS DO GRUPO:
- Tipo: ${donationLabel}
- Meta 2026: ${group.goal_2026} ${donationUnit}
- Progresso atual: ${stats.totalProgress} ${donationUnit} (${stats.progressPercentage.toFixed(1)}%)
- Membros: ${stats.memberCount}
- Total de registros: ${stats.entryCount}
- Dias ativos: ${daysActive}
- Média diária: ${avgPerDay.toFixed(2)} ${donationUnit}/dia
- Projeção para 2026: ${projectedTotal.toFixed(0)} ${donationUnit}
- Dias restantes até fim de 2026: ${daysRemaining}

👥 CONTRIBUIÇÕES POR MEMBRO (top 5):
${memberContributions.slice(0, 5).map((m, i) => `${i + 1}. ${m.name}: ${m.total_contributed} ${donationUnit} (${m.percentage_of_total.toFixed(1)}%)`).join("\n")}

📅 ATIVIDADE RECENTE (últimos 5):
${recentActivity.slice(0, 5).map(a => `- ${a.date}: ${a.amount} ${donationUnit}${a.description ? ` - "${a.description}"` : ""}`).join("\n")}

Gere uma análise completa com resumo, insights (positivos e alertas), recomendações práticas e previsão de cumprimento da meta.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_group_progress",
              description: "Retorna análise estruturada do progresso do grupo",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "Resumo geral do desempenho do grupo em 2-3 frases",
                  },
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["positive", "warning", "info"],
                          description: "Tipo do insight",
                        },
                        title: {
                          type: "string",
                          description: "Título curto do insight",
                        },
                        description: {
                          type: "string",
                          description: "Descrição detalhada do insight",
                        },
                      },
                      required: ["type", "title", "description"],
                    },
                    description: "Lista de insights sobre o grupo (2-4 itens)",
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de recomendações práticas (2-4 itens)",
                  },
                  prediction: {
                    type: "object",
                    properties: {
                      willReachGoal: {
                        type: "boolean",
                        description: "Se o grupo provavelmente atingirá a meta",
                      },
                      estimatedCompletion: {
                        type: "string",
                        description: "Data estimada de conclusão ou mensagem sobre a previsão",
                      },
                      confidence: {
                        type: "number",
                        description: "Nível de confiança da previsão (0-1)",
                      },
                      message: {
                        type: "string",
                        description: "Mensagem motivacional sobre a previsão",
                      },
                    },
                    required: ["willReachGoal", "estimatedCompletion", "confidence", "message"],
                  },
                },
                required: ["summary", "insights", "recommendations", "prediction"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_group_progress" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Aguarde alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error("Erro ao consultar IA");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("Resposta inválida da IA");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-progress:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
