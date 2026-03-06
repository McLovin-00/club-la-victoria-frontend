// components/cuenta-corriente/summary-section.tsx
"use client";

import { StatCard } from "@/components/ui/stat-card";
import { PeriodSummary } from "@/lib/cuenta-corriente-utils";
import { formatCurrency } from "@/lib/cuenta-corriente-utils";
import { DollarSign, TrendingUp, CreditCard, RefreshCw } from "lucide-react";

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
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Saldo Actual"
        value={formatCurrency(saldoActual)}
        description="Balance total del cobrador"
        icon={DollarSign}
        isLoading={isLoading}
      />
      <StatCard
        title="Comisiones Generadas"
        value={formatCurrency(periodSummary.totalComisiones)}
        description={`${periodSummary.totalMovimientos} movimientos en el período`}
        icon={TrendingUp}
        isLoading={isLoading}
      />
      <StatCard
        title="Pagos al Cobrador"
        value={formatCurrency(periodSummary.totalPagos)}
        description="Total de pagos recibidos"
        icon={CreditCard}
        isLoading={isLoading}
      />
      <StatCard
        title="Ajustes"
        value={formatCurrency(periodSummary.totalAjustes)}
        description="Ajustes manuales"
        icon={RefreshCw}
        isLoading={isLoading}
      />
    </div>
  );
}
