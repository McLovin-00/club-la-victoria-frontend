// components/cuenta-corriente/time-series-chart.tsx
"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint, formatChartDate, formatCurrency } from "@/lib/cuenta-corriente-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeSeriesChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

const chartConfig: ChartConfig = {
  comisiones: {
    label: "Comisiones",
    color: "hsl(var(--chart-1))",
  },
  pagos: {
    label: "Pagos",
    color: "hsl(var(--chart-2))",
  },
};

export function TimeSeriesChart({ data, isLoading = false }: TimeSeriesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolución Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolución Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sin movimientos en el período seleccionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolución Temporal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="comisiones"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pagos"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
