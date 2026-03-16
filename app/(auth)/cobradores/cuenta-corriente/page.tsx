"use client";

import { MovementList } from "@/components/cuenta-corriente/movement-list";

import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCobradoresActivos } from "@/hooks/api/cobradores/useCobradoresActivos";
import {
  useCuentaCorrienteCobrador,
  useRegistrarPagoCobrador,
} from "@/hooks/api/cobradores/useCobradorCuentaCorriente";
import { SummarySection } from "@/components/cuenta-corriente/summary-section";
import { FiltersSection } from "@/components/cuenta-corriente/filters-section";
import {
  getDefaultDateRange,
  filterMovimientosByDateRange,
  calculatePeriodSummary,
  TipoMovimiento,
} from "@/lib/cuenta-corriente-utils";
import { UserRound, Plus, ChevronDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function CuentaCorrienteCobradoresPage() {
  const [cobradorId, setCobradorId] = useState(0);
  const [monto, setMonto] = useState("");
  const [referencia, setReferencia] = useState("");
  const [showPagoForm, setShowPagoForm] = useState(false);

  // Date range filter state
  const [startDate, setStartDate] = useState<Date>(() => {
    const { startDate } = getDefaultDateRange();
    return startDate;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const { endDate } = getDefaultDateRange();
    return endDate;
  });

  // Movement type filter state (instant filter)
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento | "TODOS">("TODOS");

  // Socio search filter state (instant filter)
  const [busquedaSocio, setBusquedaSocio] = useState("");
  const { data: cobradores } = useCobradoresActivos();
  const { data, isLoading } = useCuentaCorrienteCobrador(cobradorId);
  const pagoMutation = useRegistrarPagoCobrador(cobradorId);


  const movimientosVisibles = useMemo(() => {
    if (!data?.movimientos) return [];
    return data.movimientos.filter((mov) => mov.tipoMovimiento !== "AJUSTE");
  }, [data?.movimientos]);

  useEffect(() => {
    if (cobradores && cobradores.length > 0 && cobradorId === 0) {
      setCobradorId(cobradores[0].id);
    }
  }, [cobradores, cobradorId]);

  // Filter movements by date range
  const dateFilteredMovimientos = useMemo(() => {
    return filterMovimientosByDateRange(movimientosVisibles, startDate, endDate);
  }, [movimientosVisibles, startDate, endDate]);

  // Apply movement type filter (instant)
  const tipoFilteredMovimientos = useMemo(() => {
    if (tipoMovimiento === "TODOS") return dateFilteredMovimientos;
    return dateFilteredMovimientos.filter((mov) => mov.tipoMovimiento === tipoMovimiento);
  }, [dateFilteredMovimientos, tipoMovimiento]);

  // Apply socio search filter (instant)
  const filteredMovimientos = useMemo(() => {
    if (!busquedaSocio.trim()) return tipoFilteredMovimientos;
    const termino = busquedaSocio.toLowerCase().trim();
    return tipoFilteredMovimientos.filter((mov) => {
      const socio = mov.detalleCobro?.socio;
      if (!socio) return false;
      const nombreCompleto = `${socio.nombre} ${socio.apellido}`.toLowerCase();
      const apellidoNombre = `${socio.apellido} ${socio.nombre}`.toLowerCase();
      return nombreCompleto.includes(termino) || apellidoNombre.includes(termino);
    });
  }, [tipoFilteredMovimientos, busquedaSocio]);

  // Calculate period summary from filtered movements
  const periodSummary = useMemo(() => {
    return calculatePeriodSummary(filteredMovimientos);
  }, [filteredMovimientos]);

  // Check if active filters are applied
  const hasActiveFilters = useMemo(() => {
    const defaultRange = getDefaultDateRange();
    return (
      tipoMovimiento !== "TODOS" ||
      busquedaSocio.trim() !== "" ||
      startDate.toDateString() !== defaultRange.startDate.toDateString() ||
      endDate.toDateString() !== defaultRange.endDate.toDateString()
    );
  }, [tipoMovimiento, busquedaSocio, startDate, endDate]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleTipoMovimientoChange = (tipo: TipoMovimiento | "TODOS") => {
    setTipoMovimiento(tipo);
  };

  const handleClearFilters = () => {
    const { startDate, endDate } = getDefaultDateRange();
    setStartDate(startDate);
    setEndDate(endDate);
    setTipoMovimiento("TODOS");
    setBusquedaSocio("");
  };

  const handleRegistrarPago = () => {
    if (!monto || Number(monto) <= 0) return;
    pagoMutation.mutate({
      monto: Number(monto),
      referencia,
      usuarioRegistra: "operador_web",
    });
    setMonto("");
    setReferencia("");
    setShowPagoForm(false);
  };

  return (
    <DashboardLayout
      title="Cuenta Corriente de Cobradores"
      description="Movimientos y saldo por cobrador"
    >
      <div className="space-y-5">
        {/* Encabezado: Selector de cobrador + acción de pago */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5 sm:min-w-[280px]">
            <Label htmlFor="cobrador-selector" className="text-xs font-medium text-muted-foreground">
              Cobrador
            </Label>
            <Select
              value={cobradorId ? String(cobradorId) : ""}
              onValueChange={(value) => setCobradorId(Number(value))}
            >
              <SelectTrigger id="cobrador-selector" className="h-9">
                <SelectValue placeholder="Seleccioná un cobrador" />
              </SelectTrigger>
              <SelectContent>
                {cobradores?.map((cobrador) => (
                  <SelectItem key={cobrador.id} value={String(cobrador.id)}>
                    {cobrador.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {cobradorId > 0 && (
            <Collapsible open={showPagoForm} onOpenChange={setShowPagoForm}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Registrar pago
                  <ChevronDown className={`h-3 w-3 transition-transform ${showPagoForm ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-end">
                  <div className="space-y-1 sm:flex-1">
                    <Label className="text-xs">Importe</Label>
                    <Input
                      type="number"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="0.00"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1 sm:flex-[2]">
                    <Label className="text-xs">Detalle</Label>
                    <Input
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Ej: Pago parcial, Saldo anterior..."
                      className="h-8"
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={pagoMutation.isPending || !monto || Number(monto) <= 0}
                    onClick={handleRegistrarPago}
                  >
                    Registrar
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {cobradorId === 0 ? (
          <Alert>
            <UserRound className="h-4 w-4" />
            <AlertTitle>Seleccioná un cobrador para comenzar</AlertTitle>
            <AlertDescription>
              Elegí un cobrador arriba para ver su resumen, filtros y movimientos.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Resumen compacto */}
            <SummarySection
              saldoActual={data?.saldo ?? 0}
              periodSummary={periodSummary}
              isLoading={isLoading}
            />

            {/* Filtros inline */}
            <FiltersSection
              startDate={startDate}
              endDate={endDate}
              tipoMovimiento={tipoMovimiento}
              busquedaSocio={busquedaSocio}
              onDateRangeChange={handleDateRangeChange}
              onTipoMovimientoChange={handleTipoMovimientoChange}
              onBusquedaSocioChange={setBusquedaSocio}
              onClearFilters={handleClearFilters}
            />

            {/* Movimientos */}
            <MovementList
              movimientos={filteredMovimientos}
              cobradorId={cobradorId}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
