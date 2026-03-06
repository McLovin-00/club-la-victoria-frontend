// components/cuenta-corriente/filters-section.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TipoMovimiento } from "@/lib/cuenta-corriente-utils";

interface FiltersSectionProps {
  startDate: Date;
  endDate: Date;
  tipoMovimiento: TipoMovimiento | "TODOS";
  onDateRangeChange: (start: Date, end: Date) => void;
  onTipoMovimientoChange: (tipo: TipoMovimiento | "TODOS") => void;
  onClearFilters: () => void;
}

const TIPO_MOVIMIENTO_LABELS: Record<TipoMovimiento | "TODOS", string> = {
  TODOS: "Todos los tipos",
  COMISION_GENERADA: "Comisiones generadas",
  PAGO_A_COBRADOR: "Pagos al cobrador",
  AJUSTE: "Ajustes",
};

export function FiltersSection({
  startDate,
  endDate,
  tipoMovimiento,
  onDateRangeChange,
  onTipoMovimientoChange,
  onClearFilters,
}: FiltersSectionProps) {
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const handleStartDateChange = (value: string) => {
    const newDate = new Date(value);
    setTempStartDate(newDate);
    setHasPendingChanges(true);
  };

  const handleEndDateChange = (value: string) => {
    const newDate = new Date(value);
    newDate.setHours(23, 59, 59); // End of day
    setTempEndDate(newDate);
    setHasPendingChanges(true);
  };

  const handleApplyDateRange = () => {
    onDateRangeChange(tempStartDate, tempEndDate);
    setHasPendingChanges(false);
  };

  const handleCancelChanges = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setHasPendingChanges(false);
  };

  const hasActiveFilters =
    tipoMovimiento !== "TODOS" ||
    startDate.toDateString() !== new Date(new Date().getFullYear(), new Date().getMonth(), 1).toDateString() ||
    endDate.toDateString() !== new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toDateString();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Tipo de Movimiento - Instant filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de movimiento</label>
            <div className="flex items-center gap-2">
              <Select
                value={tipoMovimiento}
                onValueChange={(value) =>
                  onTipoMovimientoChange(value as TipoMovimiento | "TODOS")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_MOVIMIENTO_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                Aplica al instante
              </Badge>
            </div>
          </div>

          {/* Date Range - Requires Apply */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha desde</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={format(tempStartDate, "yyyy-MM-dd")}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha hasta</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={format(tempEndDate, "yyyy-MM-dd")}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Apply/Cancel buttons for date range */}
        {hasPendingChanges && (
          <div className="mt-4 flex items-center gap-2 border-t pt-4">
            <Button size="sm" onClick={handleApplyDateRange}>
              Aplicar rango de fechas
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelChanges}
            >
              Cancelar
            </Button>
            <span className="text-xs text-muted-foreground">
              Los cambios en el rango de fechas requieren aplicar
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
