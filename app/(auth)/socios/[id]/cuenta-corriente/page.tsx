"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  DollarSign,
  Loader2,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCuentaCorriente } from "@/hooks/api/cobros/useCuentaCorriente";
import { useSocioById } from "@/hooks/api/socios/useSocios";
import { useRegistrarPago, MetodoPago } from "@/hooks/api/cobros/useRegistrarPago";
import { abrirReciboHtml } from "@/hooks/api/cobros/useTalonario";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const meses = [
  { key: "01", label: "Ene" },
  { key: "02", label: "Feb" },
  { key: "03", label: "Mar" },
  { key: "04", label: "Abr" },
  { key: "05", label: "May" },
  { key: "06", label: "Jun" },
  { key: "07", label: "Jul" },
  { key: "08", label: "Ago" },
  { key: "09", label: "Sep" },
  { key: "10", label: "Oct" },
  { key: "11", label: "Nov" },
  { key: "12", label: "Dic" },
];

const currentYear = new Date().getFullYear();
const yearsOptions = [currentYear, currentYear - 1, currentYear - 2];

export default function CuentaCorrientePage() {
  const { id } = useParams();
  const socioId = Number.parseInt(String(id), 10);
  const idValido = Number.isInteger(socioId) && socioId > 0;

const [selectedYear, setSelectedYear] = useState(currentYear);
  const [pagoCuotaId, setPagoCuotaId] = useState<number | null>(null);
  const [historialPage, setHistorialPage] = useState(1);
  const historialPageSize = 10;
  const { data: socio, isLoading: isLoadingSocio } = useSocioById(socioId);
  const { data: cuentaCorriente, isLoading: isLoadingCuenta } = useCuentaCorriente(socioId);
  const { mutate: registrarPago, isPending: isPagando } = useRegistrarPago();

  const isLoading = isLoadingSocio || isLoadingCuenta;

  // Crear un mapa de periodos para acceso rápido filtrado por año seleccionado
  const cuotasPorMes: Record<string, { estado: string; monto: number; id: number }> = {};
  if (cuentaCorriente?.cuotas) {
    cuentaCorriente.cuotas.forEach((cuota) => {
      if (cuota.periodo.startsWith(String(selectedYear))) {
        const mes = cuota.periodo.split("-")[1];
        cuotasPorMes[mes] = {
          estado: cuota.estado,
          monto: Number(cuota.monto),
          id: cuota.id,
        };
      }
    });
  }

  // Filtrar cuotas pendientes para el año seleccionado
  const cuotasPendientes = cuentaCorriente?.cuotas
    ?.filter((cuota) => cuota.estado === "PENDIENTE" && cuota.periodo.startsWith(String(selectedYear)))
    .sort((a, b) => a.periodo.localeCompare(b.periodo)) ?? [];

  const renderEstadoMes = (mesKey: string) => {
    const cuota = cuotasPorMes[mesKey];

    if (cuota?.estado === "PAGADA") {
      return (
        <span className="text-green-600 font-bold text-lg">✓</span>
      );
    }

    if (cuota?.estado === "PENDIENTE") {
      return (
        <span className="text-red-600 font-bold text-lg">✗</span>
      );
    }

    return <span className="text-muted-foreground">-</span>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePagarCuota = (cuotaId: number) => {
    registrarPago({
      cuotaId,
      metodoPago: MetodoPago.EFECTIVO,
    });
    setPagoCuotaId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/socios">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver a socios
            </Button>
          </Link>
        </div>

        {!idValido ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              El identificador del socio no es válido.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="py-10">
              <LoadingSpinner text="Cargando cuenta corriente..." />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header con datos del socio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Cuenta Corriente
                </CardTitle>
                <CardDescription>
                  {socio?.apellido}, {socio?.nombre} - DNI: {socio?.dni}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Resumen de totales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total pagado</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(cuentaCorriente?.totalPagado ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deuda total</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(cuentaCorriente?.totalDeuda ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Meses adeudados</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {cuentaCorriente?.mesesAdeudados ?? 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grilla de estado de pagos por mes */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5" />
                      Estado de pagos
                    </CardTitle>
                    <CardDescription>
                      Vista mensual del estado de cuotas
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="anio" className="text-sm whitespace-nowrap">Año:</Label>
                    <Select
                      value={String(selectedYear)}
                      onValueChange={(value) => setSelectedYear(Number(value))}
                    >
                      <SelectTrigger className="w-[100px]" id="anio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearsOptions.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Socio</TableHead>
                        {meses.map((mes) => (
                          <TableHead key={mes.key} className="text-center min-w-[60px]">
                            {mes.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          {socio?.apellido}, {socio?.nombre}
                        </TableCell>
                        {meses.map((mes) => (
                          <TableCell key={mes.key} className="text-center">
                            {renderEstadoMes(mes.key)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Sección de pago rápido de cuotas pendientes */}
                {cuotasPendientes.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Cuotas pendientes de pago</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Período</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="text-center">Acción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cuotasPendientes.map((cuota) => (
                            <TableRow key={cuota.id}>
                              <TableCell className="font-medium">
                                {cuota.periodo}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(Number(cuota.monto))}
                              </TableCell>
                              <TableCell className="text-center">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      Pagar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar pago</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        ¿Desea registrar el pago de la cuota <strong>{cuota.periodo}</strong> por <strong>{formatCurrency(Number(cuota.monto))}</strong>?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handlePagarCuota(cuota.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        {isPagando ? (
                                          <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Procesando...
                                          </>
                                        ) : (
                                          "Confirmar pago"
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

{/* Historial de cuotas detallado */}
                {cuentaCorriente?.cuotas && cuentaCorriente.cuotas.length > 0 && (() => {
                  const cuotasOrdenadas = [...cuentaCorriente.cuotas].sort((a, b) => b.periodo.localeCompare(a.periodo));
                  const totalCuotas = cuotasOrdenadas.length;
                  const totalPages = Math.ceil(totalCuotas / historialPageSize);
                  const startIndex = (historialPage - 1) * historialPageSize;
                  const endIndex = startIndex + historialPageSize;
                  const cuotasPagina = cuotasOrdenadas.slice(startIndex, endIndex);

                  return (
                    <div className="mt-6 border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Historial de cuotas</h3>
                        <span className="text-sm text-muted-foreground">
                          {totalCuotas} cuotas en total
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Período</TableHead>
                              <TableHead className="text-right">Monto</TableHead>
                              <TableHead className="text-center">Estado</TableHead>
                              <TableHead>Fecha de pago</TableHead>
                              <TableHead className="text-center">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cuotasPagina.map((cuota) => (
                              <TableRow key={cuota.id}>
                                <TableCell className="font-medium">
                                  {cuota.periodo}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(Number(cuota.monto))}
                                </TableCell>
                                <TableCell className="text-center">
                                  {cuota.estado === "PAGADA" ? (
                                    <Badge className="bg-green-100 text-green-700">
                                      Pagada
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-800">
                                      Pendiente
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {cuota.fechaPago
                                    ? new Date(cuota.fechaPago).toLocaleDateString("es-AR")
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={cuota.estado === "PAGADA" 
                                      ? "border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
                                      : "border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                    }
                                    onClick={() => {
                                      if (!idValido) {
                                        return;
                                      }

                                      void abrirReciboHtml(cuota.periodo, socioId);
                                    }}
                                    title="Descargar recibo"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Recibo
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-muted-foreground">
                            Página {historialPage} de {totalPages}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHistorialPage(p => Math.max(1, p - 1))}
                              disabled={historialPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Anterior
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setHistorialPage(p => Math.min(totalPages, p + 1))}
                              disabled={historialPage === totalPages}
                            >
                              Siguiente
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {(!cuentaCorriente?.cuotas || cuentaCorriente.cuotas.length === 0) && (
                  <p className="py-8 text-center text-muted-foreground">
                    No hay cuotas registradas para este socio.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
