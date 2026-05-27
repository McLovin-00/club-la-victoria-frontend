"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Info,
  Calendar,
  CalendarRange,
  Loader2,
  Banknote,
  ArrowLeftRight,
  CreditCard,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useReporteCobranza } from "@/hooks/api/cobros/useReporteCobranza";
import { useReporteCobranzaRango } from "@/hooks/api/cobros/useReporteCobranzaRango";
import { MonthRangePicker } from "@/components/cobros/MonthRangePicker";

const MESES = [
  { valor: "01", nombre: "Enero" },
  { valor: "02", nombre: "Febrero" },
  { valor: "03", nombre: "Marzo" },
  { valor: "04", nombre: "Abril" },
  { valor: "05", nombre: "Mayo" },
  { valor: "06", nombre: "Junio" },
  { valor: "07", nombre: "Julio" },
  { valor: "08", nombre: "Agosto" },
  { valor: "09", nombre: "Septiembre" },
  { valor: "10", nombre: "Octubre" },
  { valor: "11", nombre: "Noviembre" },
  { valor: "12", nombre: "Diciembre" },
];

const getAniosDisponibles = () => {
  const anioActual = new Date().getFullYear();
  return [anioActual - 2, anioActual - 1, anioActual, anioActual + 1];
};

export default function ReportesPage() {
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");

  const periodo = mes && anio ? `${anio}-${mes}` : "";

  const [rango, setRango] = useState({ desde: "", hasta: "" });

  const {
    data: reporte,
    isLoading: isLoadingMes,
    isError: isErrorMes,
    error: errorMes,
    refetch: refetchMes,
  } = useReporteCobranza(periodo);

  const {
    data: reporteRango,
    isLoading: isLoadingRango,
    refetch: refetchRango,
  } = useReporteCobranzaRango({
    periodoDesde: rango.desde,
    periodoHasta: rango.hasta,
    enabled: rango.desde !== "" && rango.hasta !== "",
  });

  const handleMesChange = (newMes: string) => {
    setMes(newMes);
  };

  const handleAnioChange = (newAnio: string) => {
    setAnio(newAnio);
  };

  const handlePeriodoActual = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    setMes(month);
    setAnio(String(year));
  };

  const handleBuscarReporte = () => {
    if (periodo) {
      refetchMes();
    }
  };

  const handleBuscarRango = () => {
    refetchRango();
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const getNombreMes = (periodoStr: string) => {
    const [anio, mes] = periodoStr.split("-");
    const mesesNombres = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${mesesNombres[parseInt(mes, 10) - 1]} ${anio}`;
  };

  return (
    <DashboardLayout title="Reportes de Cobranza" description="Consulte reportes de cobranza y morosidad">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Reportes de cobranza</h1>
          <p className="page-description">
            Analiza cobranza y morosidad por mes o por rangos de períodos.
          </p>
        </div>

        <Tabs defaultValue="mes" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="mes" className="gap-2">
              <Calendar className="h-4 w-4" />
              Mes Específico
            </TabsTrigger>
            <TabsTrigger value="rango" className="gap-2">
              <CalendarRange className="h-4 w-4" />
              Rango de Meses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Reporte de Cobranza
                </CardTitle>
                <CardDescription>
                  Consulte el estado de cobranza de un período específico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mes</Label>
                    <Select value={mes} onValueChange={handleMesChange}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {MESES.map((m) => (
                          <SelectItem key={m.valor} value={m.valor}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Año</Label>
                    <Select value={anio} onValueChange={handleAnioChange}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Año" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAniosDisponibles().map((a) => (
                          <SelectItem key={a} value={String(a)}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={handlePeriodoActual}>
                    Actual
                  </Button>
                  <Button onClick={handleBuscarReporte} disabled={!periodo}>
                    Buscar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoadingMes && (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">Cargando reporte...</p>
                </CardContent>
              </Card>
            )}

            {isErrorMes && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">
                        Sin datos para el período
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        {(errorMes as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                          "No hay cuotas generadas para el período seleccionado. Pruebe con otro período o genere las cuotas primero."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {reporte && (
              <Card>
                <CardHeader>
                  <CardTitle>Reporte del Período {reporte.periodo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-sm font-medium">Total Generado</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatMonto(reporte.totalGenerado)}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-medium">Total Cobrado</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {formatMonto(reporte.totalCobrado)}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-medium">% Cobranza</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">
                        {reporte.porcentajeCobranza.toFixed(1)}%
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <TrendingDown className="h-5 w-5" />
                        <span className="text-sm font-medium">% Morosidad</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">
                        {reporte.morosidad.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Cuotas Pagadas</p>
                      <p className="text-xl font-bold text-green-600">
                        {reporte.cuotasPagadas}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Cuotas Pendientes</p>
                      <p className="text-xl font-bold text-orange-600">
                        {reporte.cuotasPendientes}
                      </p>
                    </div>
                  </div>

                  {/* Gráfico de donut animado - Estado de cobranza */}
                  <div className="mt-6 p-4 rounded-lg border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4">
                      Estado de Cobranza
                    </p>
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Cobrado", value: reporte.totalCobrado, color: "#22c55e" },
                              { name: "Pendiente", value: reporte.totalGenerado - reporte.totalCobrado, color: "#f97316" },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            {[
                              { name: "Cobrado", value: reporte.totalCobrado, color: "#22c55e" },
                              { name: "Pendiente", value: reporte.totalGenerado - reporte.totalCobrado, color: "#f97316" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatMonto(value)}
                            contentStyle={{
                              backgroundColor: "rgba(255,255,255,0.95)",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => (
                              <span className="text-sm text-slate-600 dark:text-slate-300">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Desglose por Método de Pago */}
                  {reporte.desglosePorMetodoPago && reporte.desglosePorMetodoPago.length > 0 && (
                    <div className="mt-6 p-4 rounded-lg border">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4">
                        Desglose por Método de Pago
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {reporte.desglosePorMetodoPago.map((metodo) => (
                          <div
                            key={metodo.metodoPago}
                            className="flex items-center justify-between rounded-lg border bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-3"
                          >
                            <div className="flex items-center gap-2">
                              {metodo.metodoPago.toLowerCase().includes("transferencia") ? (
                                <ArrowLeftRight className="h-4 w-4 text-indigo-600" />
                              ) : (
                                <Banknote className="h-4 w-4 text-emerald-600" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{metodo.metodoPago}</p>
                                <p className="text-xs text-muted-foreground">{metodo.cantidadPagos} pagos</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-green-700">{formatMonto(metodo.totalCobrado)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resumen Tarjeta del Centro */}
                  {reporte.tarjetaCentro && reporte.tarjetaCentro.sociosConTarjeta > 0 && (
                    <div className="mt-6 p-4 rounded-lg border border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950 dark:to-sky-950">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="h-5 w-5 text-cyan-600" />
                        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                          Tarjeta del Centro
                        </p>
                      </div>
                      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                        <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border">
                          <p className="text-xs text-muted-foreground">Socios con Tarjeta</p>
                          <p className="text-lg font-bold text-cyan-700">{reporte.tarjetaCentro.sociosConTarjeta}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border">
                          <p className="text-xs text-muted-foreground">Cuotas Pagadas</p>
                          <p className="text-lg font-bold text-green-600">{reporte.tarjetaCentro.cuotasPagadasTarjeta}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border">
                          <p className="text-xs text-muted-foreground">Total Cobrado</p>
                          <p className="text-lg font-bold text-green-700">{formatMonto(reporte.tarjetaCentro.totalCobradoTarjeta)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border">
                          <p className="text-xs text-muted-foreground">Pendiente</p>
                          <p className="text-lg font-bold text-orange-600">{formatMonto(reporte.tarjetaCentro.totalPendienteTarjeta)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rango">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarRange className="h-5 w-5" />
                  Reporte por Rango de Meses
                </CardTitle>
                <CardDescription>
                  Consulte el estado de cobranza consolidado para un rango de meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MonthRangePicker
                  value={rango}
                  onChange={setRango}
                  onBuscar={handleBuscarRango}
                  isLoading={isLoadingRango}
                />
              </CardContent>
            </Card>

            {isLoadingRango && (
              <Card>
                <CardContent className="py-8 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <p className="text-muted-foreground">Cargando reporte...</p>
                </CardContent>
              </Card>
            )}

            {reporteRango && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Resumen Consolidado: {getNombreMes(reporteRango.periodoDesde)} - {getNombreMes(reporteRango.periodoHasta)}
                    </CardTitle>
                    <CardDescription>
                      {reporteRango.cantidadMeses} {reporteRango.cantidadMeses === 1 ? "mes" : "meses"} en el rango
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                          <DollarSign className="h-5 w-5" />
                          <span className="text-sm font-medium">Total Generado</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatMonto(reporteRango.totalGenerado)}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                          <TrendingUp className="h-5 w-5" />
                          <span className="text-sm font-medium">Total Cobrado</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                          {formatMonto(reporteRango.totalCobrado)}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                          <TrendingUp className="h-5 w-5" />
                          <span className="text-sm font-medium">% Cobranza</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">
                          {reporteRango.porcentajeCobranza.toFixed(1)}%
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="flex items-center gap-2 text-orange-600 mb-2">
                          <TrendingDown className="h-5 w-5" />
                          <span className="text-sm font-medium">% Morosidad</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">
                          {reporteRango.morosidad.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Cuotas Pagadas</p>
                        <p className="text-xl font-bold text-green-600">
                          {reporteRango.cuotasPagadas}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Cuotas Pendientes</p>
                        <p className="text-xl font-bold text-orange-600">
                          {reporteRango.cuotasPendientes}
                        </p>
                      </div>
                    </div>

                    {/* Gráfico de donut animado - Resumen consolidado */}
                    <div className="mt-6 p-4 rounded-lg border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4">
                        Resumen Consolidado
                      </p>
                      <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Cobrado", value: reporteRango.totalCobrado, color: "#22c55e" },
                                { name: "Pendiente", value: reporteRango.totalGenerado - reporteRango.totalCobrado, color: "#f97316" },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              animationBegin={0}
                              animationDuration={800}
                              animationEasing="ease-out"
                            >
                              {[
                                { name: "Cobrado", value: reporteRango.totalCobrado, color: "#22c55e" },
                                { name: "Pendiente", value: reporteRango.totalGenerado - reporteRango.totalCobrado, color: "#f97316" },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => formatMonto(value)}
                              contentStyle={{
                                backgroundColor: "rgba(255,255,255,0.95)",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              formatter={(value) => (
                                <span className="text-sm text-slate-600 dark:text-slate-300">{value}</span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Desglose por Método de Pago */}
                    {reporteRango.desglosePorMetodoPago && reporteRango.desglosePorMetodoPago.length > 0 && (
                      <div className="mt-6 p-4 rounded-lg border">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4">
                          Desglose por Método de Pago (Consolidado)
                        </p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {reporteRango.desglosePorMetodoPago.map((metodo) => (
                            <div
                              key={metodo.metodoPago}
                              className="flex items-center justify-between rounded-lg border bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-3"
                            >
                              <div className="flex items-center gap-2">
                                {metodo.metodoPago.toLowerCase().includes("transferencia") ? (
                                  <ArrowLeftRight className="h-4 w-4 text-indigo-600" />
                                ) : (
                                  <Banknote className="h-4 w-4 text-emerald-600" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{metodo.metodoPago}</p>
                                  <p className="text-xs text-muted-foreground">{metodo.cantidadPagos} pagos</p>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-green-700">{formatMonto(metodo.totalCobrado)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resumen Tarjeta del Centro */}
                    {reporteRango.tarjetaCentro && reporteRango.tarjetaCentro.sociosConTarjeta > 0 && (
                      <div className="mt-6 p-4 rounded-lg border border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950 dark:to-sky-950">
                        <div className="flex items-center gap-2 mb-4">
                          <CreditCard className="h-5 w-5 text-cyan-600" />
                          <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                            Tarjeta del Centro (Consolidado)
                          </p>
                        </div>
                        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                          <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border">
                            <p className="text-xs text-muted-foreground">Socios con Tarjeta</p>
                            <p className="text-lg font-bold text-cyan-700">{reporteRango.tarjetaCentro.sociosConTarjeta}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border">
                            <p className="text-xs text-muted-foreground">Cuotas Pagadas</p>
                            <p className="text-lg font-bold text-green-600">{reporteRango.tarjetaCentro.cuotasPagadasTarjeta}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border">
                            <p className="text-xs text-muted-foreground">Total Cobrado</p>
                            <p className="text-lg font-bold text-green-700">{formatMonto(reporteRango.tarjetaCentro.totalCobradoTarjeta)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 border">
                            <p className="text-xs text-muted-foreground">Pendiente</p>
                            <p className="text-lg font-bold text-orange-600">{formatMonto(reporteRango.tarjetaCentro.totalPendienteTarjeta)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Gráfico de barras animado - Tendencias mensuales */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Tendencia de Cobranza por Mes
                    </CardTitle>
                    <CardDescription>
                      Evolución del total generado vs cobrado en el rango de meses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={reporteRango.meses.map((mes) => ({
                          periodo: getNombreMes(mes.periodo).split(" ")[0].slice(0, 3),
                          Generado: mes.totalGenerado,
                          Cobrado: mes.totalCobrado,
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                          dataKey="periodo"
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          formatter={(value: number) => formatMonto(value)}
                          contentStyle={{
                            backgroundColor: "rgba(255,255,255,0.95)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          labelStyle={{ fontWeight: 600, color: "#1e293b" }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "20px" }}
                          formatter={(value) => (
                            <span className="text-sm font-medium text-slate-600">{value}</span>
                          )}
                        />
                        <Bar
                          dataKey="Generado"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          animationBegin={0}
                          animationDuration={800}
                          animationEasing="ease-out"
                        />
                        <Bar
                          dataKey="Cobrado"
                          fill="#22c55e"
                          radius={[4, 4, 0, 0]}
                          animationBegin={200}
                          animationDuration={800}
                          animationEasing="ease-out"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Desglose por Mes</CardTitle>
                    <CardDescription>
                      Detalle de cobranza de cada mes en el rango seleccionado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveTable
                      data={reporteRango.meses}
                      keyExtractor={(mes) => mes.periodo}
                      columns={[
                        {
                          key: "periodo",
                          header: "Período",
                          cell: (mes) => (
                            <span className="font-medium">{getNombreMes(mes.periodo)}</span>
                          ),
                        },
                        {
                          key: "totalGenerado",
                          header: "Total Generado",
                          headerClassName: "text-right",
                          cellClassName: "text-right",
                          cell: (mes) => formatMonto(mes.totalGenerado),
                        },
                        {
                          key: "totalCobrado",
                          header: "Total Cobrado",
                          headerClassName: "text-right",
                          cellClassName: "text-right text-green-600",
                          cell: (mes) => formatMonto(mes.totalCobrado),
                        },
                        {
                          key: "porcentajeCobranza",
                          header: "% Cobranza",
                          headerClassName: "text-right",
                          cellClassName: "text-right",
                          cell: (mes) => (
                            <span className={`font-medium ${mes.porcentajeCobranza >= 70 ? "text-green-600" : mes.porcentajeCobranza >= 50 ? "text-amber-600" : "text-red-600"}`}>
                              {mes.porcentajeCobranza.toFixed(1)}%
                            </span>
                          ),
                        },
                        {
                          key: "cuotasPagadas",
                          header: "Cuotas Pagadas",
                          headerClassName: "text-center",
                          cellClassName: "text-center text-green-600",
                          cell: (mes) => mes.cuotasPagadas,
                        },
                        {
                          key: "cuotasPendientes",
                          header: "Cuotas Pendientes",
                          headerClassName: "text-center",
                          cellClassName: "text-center text-orange-600",
                          cell: (mes) => mes.cuotasPendientes,
                        },
                        {
                          key: "morosidad",
                          header: "% Morosidad",
                          headerClassName: "text-right",
                          cellClassName: "text-right",
                          cell: (mes) => (
                            <span className={`font-medium ${mes.morosidad <= 20 ? "text-green-600" : mes.morosidad <= 40 ? "text-amber-600" : "text-red-600"}`}>
                              {mes.morosidad.toFixed(1)}%
                            </span>
                          ),
                        },
                      ]}
                      renderCard={(mes) => (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{getNombreMes(mes.periodo)}</p>
                            <span className={`font-bold ${mes.porcentajeCobranza >= 70 ? "text-green-600" : mes.porcentajeCobranza >= 50 ? "text-amber-600" : "text-red-600"}`}>
                              {mes.porcentajeCobranza.toFixed(1)}% cobranza
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 rounded bg-blue-50 border border-blue-200">
                              <p className="text-xs text-blue-600">Generado</p>
                              <p className="font-bold text-blue-700">{formatMonto(mes.totalGenerado)}</p>
                            </div>
                            <div className="p-2 rounded bg-green-50 border border-green-200">
                              <p className="text-xs text-green-600">Cobrado</p>
                              <p className="font-bold text-green-700">{formatMonto(mes.totalCobrado)}</p>
                            </div>
                            <div className="p-2 rounded border">
                              <p className="text-xs text-muted-foreground">Pagadas</p>
                              <p className="font-bold text-green-600">{mes.cuotasPagadas}</p>
                            </div>
                            <div className="p-2 rounded border">
                              <p className="text-xs text-muted-foreground">Pendientes</p>
                              <p className="font-bold text-orange-600">{mes.cuotasPendientes}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Morosidad:</span>
                              <span className={`font-bold ${mes.morosidad <= 20 ? "text-green-600" : mes.morosidad <= 40 ? "text-amber-600" : "text-red-600"}`}>
                                {mes.morosidad.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
