import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Info, Lightbulb, Target, Loader2, Sparkles } from "lucide-react";
import type { ProgressAnalysis } from "@/hooks/useProgressAnalysis";

interface ProgressAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: ProgressAnalysis | null;
  isLoading: boolean;
  groupName: string;
}

const InsightIcon = ({ type }: { type: "positive" | "warning" | "info" }) => {
  switch (type) {
    case "positive":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "info":
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const insightStyles = {
  positive: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
  info: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
};

export const ProgressAnalysisModal = ({
  open,
  onOpenChange,
  analysis,
  isLoading,
  groupName,
}: ProgressAnalysisModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Análise do Grupo
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div
            className="py-12 text-center animate-in fade-in duration-200"
          >
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Analisando dados do grupo...</p>
            <p className="text-sm text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
          </div>
        ) : analysis ? (
          <div
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {/* Summary */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-2">Resumo</h3>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </div>

            {/* Insights */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Insights
              </h3>
              <div className="space-y-3">
                {analysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${insightStyles[insight.type]} animate-in fade-in slide-in-from-left-2 duration-300`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <InsightIcon type={insight.type} />
                      <div>
                        <h4 className="font-medium text-foreground">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Recomendações</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-muted-foreground animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <span className="text-primary font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prediction */}
            <div
              className={`rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                analysis.prediction.willReachGoal
                  ? "bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-900"
                  : "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
              }`}
              style={{ animationDelay: "500ms" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Previsão de Meta</h3>
                <Badge
                  variant={analysis.prediction.willReachGoal ? "default" : "secondary"}
                  className="ml-auto"
                >
                  {Math.round(analysis.prediction.confidence * 100)}% confiança
                </Badge>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Probabilidade de sucesso</span>
                  <span className="font-medium">
                    {analysis.prediction.willReachGoal ? "Alta" : "Moderada"}
                  </span>
                </div>
                <Progress 
                  value={analysis.prediction.confidence * 100} 
                  className="h-2"
                />
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                <strong>Previsão:</strong> {analysis.prediction.estimatedCompletion}
              </p>
              <p className="text-sm text-foreground italic">
                "{analysis.prediction.message}"
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
