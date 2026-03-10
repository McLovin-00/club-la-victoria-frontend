// components/cuenta-corriente/filters-section.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, ChevronDown, X, Search } from "lucide-react";
import { format } from "date-fns";
import {
  DateRangePreset,
  TipoMovimiento,
  getDateRangeFromPreset,
  getDefaultDateRange,
  getPresetFromDateRange,
} from "@/lib/cuenta-corriente-utils";

interface FiltersSectionProps {
  startDate: Date;
  endDate: Date;
  tipoMovimiento: TipoMovimiento | "TODOS";
  busquedaSocio: string;
  onDateRangeChange: (start: Date, end: Date) => void;
  onTipoMovimientoChange: (tipo: TipoMovimiento | "TODOS") => void;
  onBusquedaSocioChange: (busqueda: string) => void;
  onClearFilters: () => void;
}

const TIPO_MOVIMIENTO_LABELS: Record<TipoMovimiento | "TODOS", string> = {
  TODOS: "Todos los tipos",
  COMISION_GENERADA: "Comisiones generadas",
  PAGO_A_COBRADOR: "Pagos al cobrador",
  AJUSTE: "Ajustes",
};

const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset | "CUSTOM", string> = {
  TODAY: "Hoy",
  THIS_WEEK: "Esta semana",
  LAST_MONTH: "Mes pasado",
  THIS_MONTH: "Este mes",
  THIS_YEAR: "Este año",
  LAST_YEAR: "Año pasado",
  CUSTOM: "Rango personalizado",
};

export function FiltersSection({
  startDate,
  endDate,
  tipoMovimiento,
  busquedaSocio,
  onDateRangeChange,
  onTipoMovimientoChange,
  onBusquedaSocioChange,
  onClearFilters,
}: FiltersSectionProps) {
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset | "CUSTOM">(
    getPresetFromDateRange(startDate, endDate),
  );
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setSelectedPreset(getPresetFromDateRange(startDate, endDate));
    setHasPendingChanges(false);
  }, [startDate, endDate]);

  useEffect(() => {
    if (hasPendingChanges) {
      setIsAdvancedOpen(true);
    }
  }, [hasPendingChanges]);

  const handleStartDateChange = (value: string) => {
    const newDate = new Date(value);
    setTempStartDate(newDate);
    setSelectedPreset("CUSTOM");
    setHasPendingChanges(true);
  };

  const handleEndDateChange = (value: string) => {
    const newDate = new Date(value);
    newDate.setHours(23, 59, 59); // End of day
    setTempEndDate(newDate);
    setSelectedPreset("CUSTOM");
    setHasPendingChanges(true);
  };

  const handlePresetChange = (value: string) => {
    if (value === "CUSTOM") {
      setSelectedPreset("CUSTOM");
      return;
    }

    const preset = value as DateRangePreset;
    const range = getDateRangeFromPreset(preset);
    setSelectedPreset(preset);
    setTempStartDate(range.startDate);
    setTempEndDate(range.endDate);
    onDateRangeChange(range.startDate, range.endDate);
    setHasPendingChanges(false);
  };

  const handleApplyDateRange = () => {
    onDateRangeChange(tempStartDate, tempEndDate);
    setSelectedPreset(getPresetFromDateRange(tempStartDate, tempEndDate));
    setHasPendingChanges(false);
  };

  const handleCancelChanges = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setSelectedPreset(getPresetFromDateRange(startDate, endDate));
    setHasPendingChanges(false);
  };

  const handleClearAllFilters = () => {
    onClearFilters();
    const defaults = getDefaultDateRange();
    setTempStartDate(defaults.startDate);
    setTempEndDate(defaults.endDate);
    setSelectedPreset("THIS_MONTH");
    setHasPendingChanges(false);
  };

  const defaults = getDefaultDateRange();
  const hasActiveFilters =
    tipoMovimiento !== "TODOS" ||
    busquedaSocio.trim() !== "" ||
    startDate.toDateString() !== defaults.startDate.toDateString() ||
    endDate.toDateString() !== defaults.endDate.toDateString();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Restablecer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {/* Buscador de socio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar socio</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nombre, apellido o DNI..."
                value={busquedaSocio}
                onChange={(e) => onBusquedaSocioChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tipo de movimiento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de movimiento</label>
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
          </div>

          {/* Período rápido */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período rápido</label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATE_RANGE_PRESET_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="mt-3 h-8 px-2 text-xs text-muted-foreground"
            >
              <ChevronDown
                className={`mr-1 h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
              />
              Filtros avanzados por fecha
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2 space-y-4 border-t pt-4">
            <div className="grid gap-4 md:grid-cols-2">
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

            {hasPendingChanges && (
              <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/20 px-3 py-2">
                <Button size="sm" onClick={handleApplyDateRange}>
                  Aplicar rango
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelChanges}>
                  Cancelar
                </Button>
                <span className="text-xs text-muted-foreground">
                  Tenés cambios pendientes en el rango de fechas.
                </span>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

      </CardContent>
    </Card>
  );
}
