import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Insight {
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
}

interface Prediction {
  willReachGoal: boolean;
  estimatedCompletion: string;
  confidence: number;
  message: string;
}

export interface ProgressAnalysis {
  summary: string;
  insights: Insight[];
  recommendations: string[];
  prediction: Prediction;
}

interface GroupData {
  name: string;
  city: string;
  donation_type: string;
  goal_2026: number;
  created_at: string;
}

interface GroupMember {
  id: string;
  name: string;
  total_contributed: number;
}

interface ProgressEntry {
  id: string;
  amount: number;
  description: string | null;
  created_at: string;
  member_name: string;
}

interface DonationType {
  label: string;
  unit: string;
}

export const useProgressAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeProgress = async (
    group: GroupData,
    members: GroupMember[],
    progressEntries: ProgressEntry[],
    totalProgress: number,
    donationType: DonationType
  ) => {
    if (!progressEntries.length) {
      toast({
        title: "Sem dados suficientes",
        description: "O grupo precisa ter pelo menos uma doação registrada para gerar análise.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const progressPercentage = (totalProgress / group.goal_2026) * 100;

      // Prepare member contributions with percentages
      const memberContributions = members
        .filter((m) => m.total_contributed > 0)
        .map((m) => ({
          name: m.name,
          total_contributed: m.total_contributed,
          percentage_of_total: totalProgress > 0 ? (m.total_contributed / totalProgress) * 100 : 0,
        }))
        .sort((a, b) => b.total_contributed - a.total_contributed);

      // Prepare recent activity
      const recentActivity = progressEntries.slice(0, 10).map((entry) => ({
        amount: entry.amount,
        date: format(new Date(entry.created_at), "dd/MM/yyyy", { locale: ptBR }),
        description: entry.description,
      }));

      // Get user session for authenticated request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Você precisa estar logado para gerar análises.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            group: {
              name: group.name,
              city: group.city,
              donation_type: group.donation_type,
              goal_2026: group.goal_2026,
              created_at: group.created_at,
            },
            stats: {
              totalProgress,
              progressPercentage,
              memberCount: members.length,
              entryCount: progressEntries.length,
            },
            memberContributions,
            recentActivity,
            donationLabel: donationType.label,
            donationUnit: donationType.unit,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Limite de requisições atingido. Aguarde alguns segundos.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao gerar análise");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing progress:", error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível gerar a análise",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => setAnalysis(null);

  return { analyzeProgress, analysis, isLoading, clearAnalysis };
};
