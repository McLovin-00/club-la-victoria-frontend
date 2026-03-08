// lib/cuenta-corriente-utils.ts
import { MovimientoCobrador } from "@/hooks/api/cobradores/useCobradorCuentaCorriente";

export type TipoMovimiento = "COMISION_GENERADA" | "PAGO_A_COBRADOR" | "AJUSTE";
export type DateRangePreset =
  | "TODAY"
  | "THIS_WEEK"
  | "LAST_MONTH"
  | "THIS_MONTH"
  | "THIS_YEAR"
  | "LAST_YEAR";

export interface PeriodSummary {
  totalComisiones: number;
  totalPagos: number;
  totalAjustes: number;
  totalMovimientos: number;
}

export interface ChartDataPoint {
  date: string;
  comisiones: number;
  pagos: number;
  ajustes: number;
}

/**
 * Filter movements by date range
 */
export function filterMovimientosByDateRange(
  movimientos: MovimientoCobrador[],
  startDate: Date,
  endDate: Date
): MovimientoCobrador[] {
  return movimientos.filter((mov) => {
    const movDate = new Date(mov.createdAt);
    return movDate >= startDate && movDate <= endDate;
  });
}

/**
 * Calculate period summary from movements
 */
export function calculatePeriodSummary(
  movimientos: MovimientoCobrador[]
): PeriodSummary {
  const summary: PeriodSummary = {
    totalComisiones: 0,
    totalPagos: 0,
    totalAjustes: 0,
    totalMovimientos: movimientos.length,
  };

  movimientos.forEach((mov) => {
    switch (mov.tipoMovimiento) {
      case "COMISION_GENERADA":
        summary.totalComisiones += mov.monto;
        break;
      case "PAGO_A_COBRADOR":
        summary.totalPagos += mov.monto;
        break;
      case "AJUSTE":
        summary.totalAjustes += mov.monto;
        break;
    }
  });

  return summary;
}

/**
 * Aggregate movements by date for time series chart
 */
export function aggregateMovimientosForChart(
  movimientos: MovimientoCobrador[]
): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>();

  // Sort movements by date
  const sorted = [...movimientos].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  sorted.forEach((mov) => {
    const dateKey = new Date(mov.createdAt).toISOString().split("T")[0];

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: dateKey,
        comisiones: 0,
        pagos: 0,
        ajustes: 0,
      });
    }

    const dataPoint = dateMap.get(dateKey)!;
    switch (mov.tipoMovimiento) {
      case "COMISION_GENERADA":
        dataPoint.comisiones += mov.monto;
        break;
      case "PAGO_A_COBRADOR":
        dataPoint.pagos += mov.monto;
        break;
      case "AJUSTE":
        dataPoint.ajustes += mov.monto;
        break;
    }
  });

  return Array.from(dateMap.values());
}

/**
 * Get default date range (current month)
 */
export function getDefaultDateRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startDate, endDate };
}

export function getDateRangeFromPreset(
  preset: DateRangePreset,
): { startDate: Date; endDate: Date } {
  const now = new Date();

  switch (preset) {
    case "TODAY": {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
      );
      return { startDate, endDate };
    }
    case "THIS_WEEK": {
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const startDate = new Date(now);
      startDate.setDate(now.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 0);
      return { startDate, endDate };
    }
    case "LAST_MONTH": {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { startDate, endDate };
    }
    case "THIS_MONTH": {
      return getDefaultDateRange();
    }
    case "THIS_YEAR": {
      const startDate = new Date(now.getFullYear(), 0, 1);
      const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { startDate, endDate };
    }
    case "LAST_YEAR": {
      const startDate = new Date(now.getFullYear() - 1, 0, 1);
      const endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      return { startDate, endDate };
    }
  }
}

export function getPresetFromDateRange(
  startDate: Date,
  endDate: Date,
): DateRangePreset | "CUSTOM" {
  const presets: DateRangePreset[] = [
    "TODAY",
    "THIS_WEEK",
    "LAST_MONTH",
    "THIS_MONTH",
    "THIS_YEAR",
    "LAST_YEAR",
  ];

  for (const preset of presets) {
    const range = getDateRangeFromPreset(preset);
    if (
      range.startDate.getTime() === startDate.getTime() &&
      range.endDate.getTime() === endDate.getTime()
    ) {
      return preset;
    }
  }

  return "CUSTOM";
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format date for chart axis
 */
export function formatChartDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
