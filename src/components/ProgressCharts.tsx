import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users } from "lucide-react";

interface ProgressEntry {
  id: string;
  group_id: string;
  member_id: string;
  user_id: string;
  amount: number;
  description: string | null;
  created_at: string;
  member_name: string;
}

interface GroupMember {
  id: string;
  name: string;
  user_id: string | null;
  goals_reached: number;
  total_contributed: number;
}

interface DonationType {
  label: string;
  unit: string;
}

interface ProgressChartsProps {
  progressEntries: ProgressEntry[];
  members: GroupMember[];
  goal: number;
  donationType: DonationType;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const ProgressCharts = ({
  progressEntries,
  members,
  goal,
  donationType,
}: ProgressChartsProps) => {
  // Process data for cumulative chart
  const cumulativeData = useMemo(() => {
    if (!progressEntries.length) return [];

    const sorted = [...progressEntries].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let cumulative = 0;
    const dataByDate: Record<string, { date: string; fullDate: string; amount: number; cumulative: number }> = {};

    sorted.forEach((entry) => {
      const dateKey = format(new Date(entry.created_at), "dd/MM", { locale: ptBR });
      const fullDate = format(new Date(entry.created_at), "dd 'de' MMMM", { locale: ptBR });
      cumulative += entry.amount;

      if (dataByDate[dateKey]) {
        dataByDate[dateKey].amount += entry.amount;
        dataByDate[dateKey].cumulative = cumulative;
      } else {
        dataByDate[dateKey] = {
          date: dateKey,
          fullDate,
          amount: entry.amount,
          cumulative,
        };
      }
    });

    return Object.values(dataByDate);
  }, [progressEntries]);

  // Process data for member contributions chart
  const memberContributions = useMemo(() => {
    return members
      .map((m) => ({
        name: m.name.length > 12 ? m.name.substring(0, 12) + "..." : m.name,
        fullName: m.name,
        total: m.total_contributed,
      }))
      .filter((m) => m.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8 contributors
  }, [members]);

  const chartConfig = {
    cumulative: {
      label: `Total (${donationType.unit})`,
      color: "hsl(var(--primary))",
    },
    total: {
      label: `Contribuição (${donationType.unit})`,
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  if (!progressEntries.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Ainda não há doações registradas para exibir gráficos.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="evolution" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="evolution" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Evolução
        </TabsTrigger>
        <TabsTrigger value="members" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Por Membro
        </TabsTrigger>
      </TabsList>

      <TabsContent value="evolution" className="mt-0">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart
            data={cumulativeData}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
              tickFormatter={(value) => `${value}`}
            />
            <ReferenceLine
              y={goal}
              stroke="hsl(var(--destructive))"
              strokeDasharray="5 5"
              label={{
                value: `Meta: ${goal}`,
                position: "right",
                fill: "hsl(var(--destructive))",
                fontSize: 11,
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    if (payload?.[0]?.payload?.fullDate) {
                      return payload[0].payload.fullDate;
                    }
                    return "";
                  }}
                  formatter={(value, name) => {
                    if (name === "cumulative") {
                      return [`${value} ${donationType.unit}`, "Total acumulado"];
                    }
                    return [value, name];
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorCumulative)"
            />
          </AreaChart>
        </ChartContainer>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Evolução acumulada das doações ao longo do tempo
        </p>
      </TabsContent>

      <TabsContent value="members" className="mt-0">
        {memberContributions.length > 0 ? (
          <>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart
                data={memberContributions}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        if (payload?.[0]?.payload?.fullName) {
                          return payload[0].payload.fullName;
                        }
                        return "";
                      }}
                      formatter={(value) => [`${value} ${donationType.unit}`, "Contribuição"]}
                    />
                  }
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {memberContributions.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Ranking de contribuições por membro
            </p>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum membro contribuiu ainda.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
