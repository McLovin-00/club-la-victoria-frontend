// components/cuenta-corriente/summary-section.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PeriodSummary, formatCurrency } from "@/lib/cuenta-corriente-utils";
import { TrendingUp, CreditCard, Banknote, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "Saldo actual",
      value: formatCurrency(saldoActual),
      icon: Banknote,
      color: "text-foreground",
      accent: saldoActual > 0 ? "border-l-amber-500" : "border-l-emerald-500",
      emphasis: true,
    },
    {
      label: "Comisiones",
      value: formatCurrency(periodSummary.totalComisiones),
      icon: TrendingUp,
      color: "text-green-700",
      accent: "border-l-green-500",
    },
    {
      label: "Pagos",
      value: formatCurrency(periodSummary.totalPagos),
      icon: CreditCard,
      color: "text-blue-700",
      accent: "border-l-blue-500",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Métricas principales en una fila */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={cn(
                "rounded-lg border border-l-[3px] p-3 transition-colors",
                metric.accent,
              )}
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className={cn("h-3.5 w-3.5", metric.color)} />
                <span>{metric.label}</span>
              </div>
              <p className={cn(
                "mt-1 font-semibold tabular-nums",
                metric.emphasis ? "text-lg" : "text-sm",
                metric.color,
              )}>
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Desglose por método de pago — solo si hay datos, inline y compacto */}
      {periodSummary.desglosePorMetodoPago.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">Cobros por método:</span>
          {periodSummary.desglosePorMetodoPago.map((metodo) => {
            const isTransferencia = metodo.metodoPago.toLowerCase().includes("transferencia");
            const Icon = isTransferencia ? ArrowLeftRight : Banknote;
            const colorClass = isTransferencia ? "text-indigo-600" : "text-emerald-600";
            return (
              <span key={metodo.metodoPago} className="inline-flex items-center gap-1">
                <Icon className={cn("h-3 w-3", colorClass)} />
                <span>{metodo.metodoPago}</span>
                <span className={cn("font-semibold", colorClass)}>
                  {formatCurrency(metodo.totalCobrado)}
                </span>
                <span className="text-muted-foreground/50">({metodo.cantidadPagos})</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
