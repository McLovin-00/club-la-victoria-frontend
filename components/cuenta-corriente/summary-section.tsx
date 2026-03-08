// components/cuenta-corriente/summary-section.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PeriodSummary } from "@/lib/cuenta-corriente-utils";
import { formatCurrency } from "@/lib/cuenta-corriente-utils";
import { CreditCard, RefreshCw, TrendingUp } from "lucide-react";

interface SummarySectionProps {
  saldoActual: number;
  periodSummary: PeriodSummary;
  isLoading?: boolean;
}

export function SummarySection({
  saldoActual,
  periodSummary,
  isLoading = false,
}: SummarySectionProps) {
  const items = [
    {
      label: "Comisiones",
      value: formatCurrency(periodSummary.totalComisiones),
      icon: TrendingUp,
      className: "text-green-700",
    },
    {
      label: "Pagos",
      value: formatCurrency(periodSummary.totalPagos),
      icon: CreditCard,
      className: "text-blue-700",
    },
    {
      label: "Ajustes",
      value: formatCurrency(periodSummary.totalAjustes),
      icon: RefreshCw,
      className: "text-orange-700",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saldo actual</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-9 w-40" />
          ) : (
            <>
              <p className="text-3xl font-semibold">{formatCurrency(saldoActual)}</p>
              <p className="text-xs text-muted-foreground">Balance total del cobrador</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium">Resumen del periodo</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {periodSummary.totalMovimientos} movimientos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            items.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className={`h-4 w-4 ${item.className}`} />
                    <span>{item.label}</span>
                  </div>
                  <p className={`text-sm font-semibold ${item.className}`}>{item.value}</p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
