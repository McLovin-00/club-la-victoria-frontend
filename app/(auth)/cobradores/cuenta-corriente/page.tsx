"use client";
import { MovementList } from "@/components/cuenta-corriente/movement-list";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { useCobradoresActivos } from "@/hooks/api/cobradores/useCobradoresActivos";
import {
  useCuentaCorrienteCobrador,
  useRegistrarAjusteCobrador,
  useRegistrarPagoCobrador,
} from "@/hooks/api/cobradores/useCobradorCuentaCorriente";
import { SummarySection } from "@/components/cuenta-corriente/summary-section";
import { TimeSeriesChart } from "@/components/cuenta-corriente/time-series-chart";
import { FiltersSection } from "@/components/cuenta-corriente/filters-section";
import {
  getDefaultDateRange,
  filterMovimientosByDateRange,
  calculatePeriodSummary,
  aggregateMovimientosForChart,
  TipoMovimiento,
} from "@/lib/cuenta-corriente-utils";

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

  // Aggregate movements for time series chart
  const chartData = useMemo(() => {
    return aggregateMovimientosForChart(filteredMovimientos);
  }, [filteredMovimientos]);

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
        {/* Cobrador Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar cobrador</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={cobradorId ? String(cobradorId) : ""}
              onValueChange={(value) => setCobradorId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione cobrador" />
              </SelectTrigger>
              <SelectContent>
                {cobradores?.map((cobrador) => (
                  <SelectItem key={cobrador.id} value={String(cobrador.id)}>
                    {cobrador.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Filters - Only show when cobrador is selected */}
        {cobradorId > 0 && (
          <FiltersSection
            startDate={startDate}
            endDate={endDate}
            tipoMovimiento={tipoMovimiento}
            onDateRangeChange={handleDateRangeChange}
            onTipoMovimientoChange={handleTipoMovimientoChange}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Summary Section - Only show when cobrador is selected */}
        {cobradorId > 0 && (
          <>
            <SummarySection
              saldoActual={data?.saldo ?? 0}
              periodSummary={periodSummary}
              isLoading={isLoading}
            />

            {/* Time Series Chart */}
            <TimeSeriesChart data={chartData} isLoading={isLoading} />

            <Separator />
          </>
        )}

        {/* Register Movement Form */}
        <Card>
          <CardHeader>
            <CardTitle>Registrar movimiento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
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
                disabled={cobradorId <= 0 || pagoMutation.isPending}
                onClick={() => pagoMutation.mutate(payload)}
              >
                Registrar pago
              </Button>
              <Button
                disabled={cobradorId <= 0 || ajusteMutation.isPending}
                onClick={() => ajusteMutation.mutate(payload)}
              >
                Registrar ajuste
              </Button>
            </div>
          </CardContent>
        </Card>

        <MovementList movimientos={filteredMovimientos} cobradorId={cobradorId} />
      </div>
    </DashboardLayout>
  );
}
