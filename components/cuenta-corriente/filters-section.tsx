// components/cuenta-corriente/filters-section.tsx
"use client";

import { useEffect, useState } from "react";
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
import { CalendarIcon, ChevronDown, X, Search, SlidersHorizontal } from "lucide-react";
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
  COMISION_GENERADA: "Comisiones",
  PAGO_A_COBRADOR: "Pagos",
};

const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset | "CUSTOM", string> = {
  TODAY: "Hoy",
  THIS_WEEK: "Esta semana",
  LAST_MONTH: "Mes pasado",
  THIS_MONTH: "Este mes",
  THIS_YEAR: "Este año",
  LAST_YEAR: "Año pasado",
  CUSTOM: "Personalizado",
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
    () => getPresetFromDateRange(startDate, endDate),
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
    newDate.setHours(23, 59, 59);
    setTempEndDate(newDate);
    setSelectedPreset("CUSTOM");
    setHasPendingChanges(true);
  };

  const handlePresetChange = (value: string) => {
    if (value === "CUSTOM") {
      setSelectedPreset("CUSTOM");
      setIsAdvancedOpen(true);
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
    setIsAdvancedOpen(false);
  };

  const defaults = getDefaultDateRange();
  const hasActiveFilters =
    tipoMovimiento !== "TODOS" ||
    busquedaSocio.trim() !== "" ||
    startDate.toDateString() !== defaults.startDate.toDateString() ||
    endDate.toDateString() !== defaults.endDate.toDateString();

  return (
    <div className="space-y-2">
      {/* Filtros principales — fila inline sin card */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        {/* Buscador de socio */}
        <div className="relative sm:flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="busqueda-socio"
            type="text"
            placeholder="Buscar socio..."
            value={busquedaSocio}
            onChange={(e) => onBusquedaSocioChange(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>

        {/* Tipo de movimiento */}
        <Select
          value={tipoMovimiento}
          onValueChange={(value) =>
            onTipoMovimientoChange(value as TipoMovimiento | "TODOS")
          }
        >
          <SelectTrigger className="h-8 w-auto min-w-[140px] text-sm">
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

        {/* Período rápido */}
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="h-8 w-auto min-w-[130px] text-sm">
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

        {/* Botón para fechas avanzadas */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-muted-foreground"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Fechas
              <ChevronDown
                className={`h-3 w-3 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Panel avanzado de fechas */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent>
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-1 sm:flex-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="fecha-desde">
                  Desde
                </label>
                <input
                  id="fecha-desde"
                  type="date"
                  value={format(tempStartDate, "yyyy-MM-dd")}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-1 sm:flex-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="fecha-hasta">
                  Hasta
                </label>
                <input
                  id="fecha-hasta"
                  type="date"
                  value={format(tempEndDate, "yyyy-MM-dd")}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              {hasPendingChanges && (
                <div className="flex gap-1.5">
                  <Button size="sm" className="h-8" onClick={handleApplyDateRange}>
                    Aplicar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={handleCancelChanges}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
