"use client";

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
import {
  getDefaultDateRange,
  filterMovimientosByDateRange,
  calculatePeriodSummary,
  aggregateMovimientosForChart,
} from "@/lib/cuenta-corriente-utils";

export default function CuentaCorrienteCobradoresPage() {
  const [cobradorId, setCobradorId] = useState(0);
  const [monto, setMonto] = useState("0");
  const [observacion, setObservacion] = useState("");
  const [referencia, setReferencia] = useState("");

  // Get default date range (current month)
  const { startDate, endDate } = useMemo(() => getDefaultDateRange(), []);

  const { data: cobradores } = useCobradoresActivos();
  const { data, isLoading } = useCuentaCorrienteCobrador(cobradorId);
  const pagoMutation = useRegistrarPagoCobrador(cobradorId);
  const ajusteMutation = useRegistrarAjusteCobrador(cobradorId);

  // Filter movements by default date range (current month)
  const filteredMovimientos = useMemo(() => {
    if (!data?.movimientos) return [];
    return filterMovimientosByDateRange(data.movimientos, startDate, endDate);
  }, [data?.movimientos, startDate, endDate]);

  // Calculate period summary from filtered movements
  const periodSummary = useMemo(() => {
    return calculatePeriodSummary(filteredMovimientos);
  }, [filteredMovimientos]);

  // Aggregate movements for time series chart
  const chartData = useMemo(() => {
    return aggregateMovimientosForChart(filteredMovimientos);
  }, [filteredMovimientos]);

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

        {/* Movements List */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredMovimientos.map((movimiento) => (
                <div
                  key={movimiento.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{movimiento.tipoMovimiento}</p>
                    <p className="text-muted-foreground">
                      {movimiento.observacion ?? "Sin observación"}
                    </p>
                  </div>
                  <p className="font-semibold">${movimiento.monto}</p>
                </div>
              ))}
              {!filteredMovimientos.length && cobradorId > 0 && (
                <p className="text-sm text-muted-foreground">
                  Sin movimientos en el período actual.
                </p>
              )}
              {cobradorId === 0 && (
                <p className="text-sm text-muted-foreground">
                  Seleccione un cobrador para ver sus movimientos.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
