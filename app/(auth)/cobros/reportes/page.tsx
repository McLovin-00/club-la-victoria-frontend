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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Info,
  Calendar,
  CalendarRange,
  Loader2,
} from "lucide-react";
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

  // Período formateado para el backend
  const periodo = mes && anio ? `${anio}-${mes}` : "";

  // Estado para rango de meses
  const [rango, setRango] = useState({ desde: "", hasta: "" });

  // Hooks
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

        {/* Tabs para seleccionar tipo de reporte */}
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

          {/* Tab: Mes Específico */}
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

            {/* Resultado mes específico */}
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Rango de Meses */}
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

            {/* Resultado rango */}
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
                {/* Resumen Consolidado */}
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
                  </CardContent>
                </Card>

                {/* Tabla desglosada por mes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Desglose por Mes</CardTitle>
                    <CardDescription>
                      Detalle de cobranza de cada mes en el rango seleccionado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[140px]">Período</TableHead>
                            <TableHead className="text-right">Total Generado</TableHead>
                            <TableHead className="text-right">Total Cobrado</TableHead>
                            <TableHead className="text-right">% Cobranza</TableHead>
                            <TableHead className="text-center">Cuotas Pagadas</TableHead>
                            <TableHead className="text-center">Cuotas Pendientes</TableHead>
                            <TableHead className="text-right">% Morosidad</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reporteRango.meses.map((mes) => (
                            <TableRow key={mes.periodo}>
                              <TableCell className="font-medium">
                                {getNombreMes(mes.periodo)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatMonto(mes.totalGenerado)}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {formatMonto(mes.totalCobrado)}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-medium ${mes.porcentajeCobranza >= 70 ? "text-green-600" : mes.porcentajeCobranza >= 50 ? "text-amber-600" : "text-red-600"}`}>
                                  {mes.porcentajeCobranza.toFixed(1)}%
                                </span>
                              </TableCell>
                              <TableCell className="text-center text-green-600">
                                {mes.cuotasPagadas}
                              </TableCell>
                              <TableCell className="text-center text-orange-600">
                                {mes.cuotasPendientes}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-medium ${mes.morosidad <= 20 ? "text-green-600" : mes.morosidad <= 40 ? "text-amber-600" : "text-red-600"}`}>
                                  {mes.morosidad.toFixed(1)}%
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
