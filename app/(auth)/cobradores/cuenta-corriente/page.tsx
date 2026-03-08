"use client";
import { MovementList } from "@/components/cuenta-corriente/movement-list";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  useRegistrarAjusteCobrador,
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
import { UserRound } from "lucide-react";

export default function CuentaCorrienteCobradoresPage() {
  const [cobradorId, setCobradorId] = useState(0);
  const [monto, setMonto] = useState("0");
  const [observacion, setObservacion] = useState("");
  const [referencia, setReferencia] = useState("");

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

  const { data: cobradores } = useCobradoresActivos();
  const { data, isLoading } = useCuentaCorrienteCobrador(cobradorId);
  const pagoMutation = useRegistrarPagoCobrador(cobradorId);
  const ajusteMutation = useRegistrarAjusteCobrador(cobradorId);

  // Filter movements by date range
  const dateFilteredMovimientos = useMemo(() => {
    if (!data?.movimientos) return [];
    return filterMovimientosByDateRange(data.movimientos, startDate, endDate);
  }, [data?.movimientos, startDate, endDate]);

  // Apply movement type filter (instant)
  const filteredMovimientos = useMemo(() => {
    if (tipoMovimiento === "TODOS") return dateFilteredMovimientos;
    return dateFilteredMovimientos.filter((mov) => mov.tipoMovimiento === tipoMovimiento);
  }, [dateFilteredMovimientos, tipoMovimiento]);

  // Calculate period summary from filtered movements
  const periodSummary = useMemo(() => {
    return calculatePeriodSummary(filteredMovimientos);
  }, [filteredMovimientos]);

  // Check if active filters are applied
  const hasActiveFilters = useMemo(() => {
    const defaultRange = getDefaultDateRange();
    return (
      tipoMovimiento !== "TODOS" ||
      startDate.toDateString() !== defaultRange.startDate.toDateString() ||
      endDate.toDateString() !== defaultRange.endDate.toDateString()
    );
  }, [tipoMovimiento, startDate, endDate]);
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
  };

  const payload = {
    monto: Number(monto),
    observacion,
    referencia,
    usuarioRegistra: "operador_web",
  };

  return (
    <DashboardLayout
      title="Cuenta Corriente de Cobradores"
      description="Movimientos y saldo por cobrador"
    >
      <div className="space-y-6">
        <Card className="py-3">
          <CardContent className="py-0">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="cobrador-selector">Cobrador</Label>
                <Select
                  value={cobradorId ? String(cobradorId) : ""}
                  onValueChange={(value) => setCobradorId(Number(value))}
                >
                  <SelectTrigger id="cobrador-selector">
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

              <div className="rounded-md border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
                {cobradorId > 0
                  ? "Vista enfocada: resumen, filtros y movimientos."
                  : "Elegí un cobrador para cargar la cuenta corriente."}
              </div>
            </div>
          </CardContent>
        </Card>

        {cobradorId === 0 ? (
          <Alert>
            <UserRound className="h-4 w-4" />
            <AlertTitle>Seleccioná un cobrador para comenzar</AlertTitle>
            <AlertDescription>
              Mostramos la información en pasos para que la pantalla sea más clara: primero elegí
              el cobrador y luego vas a ver filtros, resumen y movimientos.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <FiltersSection
              startDate={startDate}
              endDate={endDate}
              tipoMovimiento={tipoMovimiento}
              onDateRangeChange={handleDateRangeChange}
              onTipoMovimientoChange={handleTipoMovimientoChange}
              onClearFilters={handleClearFilters}
            />

            <SummarySection
              saldoActual={data?.saldo ?? 0}
              periodSummary={periodSummary}
              isLoading={isLoading}
            />

            <Card>
              <CardHeader>
                <CardTitle>Registrar movimiento</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Monto</Label>
                  <Input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referencia</Label>
                  <Input
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observación</Label>
                  <Input
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    disabled={pagoMutation.isPending}
                    onClick={() => pagoMutation.mutate(payload)}
                  >
                    Registrar pago
                  </Button>
                  <Button
                    disabled={ajusteMutation.isPending}
                    onClick={() => ajusteMutation.mutate(payload)}
                  >
                    Registrar ajuste
                  </Button>
                </div>
              </CardContent>
            </Card>

            <MovementList
              movimientos={filteredMovimientos}
              cobradorId={cobradorId}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
