"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  DollarSign,
  ListChecks,
  Loader2,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
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
import { ResponsiveTable } from "@/components/ui/responsive-table";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCuentaCorriente } from "@/hooks/api/cobros/useCuentaCorriente";
import { useSocioById } from "@/hooks/api/socios/useSocios";
import { useRegistrarPago } from "@/hooks/api/cobros/useRegistrarPago";
import { useMetodosPago } from "@/hooks/api/cobros/useMetodosPago";
import { usePagoCuotasSeleccionadas } from "@/hooks/api/cobros/usePagoCuotasSeleccionadas";
import { abrirReciboHtml, abrirReciboMultipleHtml } from "@/hooks/api/cobros/useTalonario";
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
  const [historialPage, setHistorialPage] = useState(1);
  const historialPageSize = 10;
  const { data: socio, isLoading: isLoadingSocio } = useSocioById(socioId);
  const { data: cuentaCorriente, isLoading: isLoadingCuenta } = useCuentaCorriente(socioId);
  const { mutate: registrarPago, isPending: isPagando } = useRegistrarPago();
  const pagoMasivoMutation = usePagoCuotasSeleccionadas();
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState<number[]>([]);
  const [metodoPrincipalId, setMetodoPrincipalId] = useState<number>(0);
  const [usarSegundoMetodo, setUsarSegundoMetodo] = useState(false);
  const [metodoSecundarioId, setMetodoSecundarioId] = useState<number>(0);

  const { data: metodosPago } = useMetodosPago();

  useEffect(() => {
    if (metodosPago && metodosPago.length > 0) {
      if (!metodoPrincipalId) setMetodoPrincipalId(metodosPago[0].id);
      if (!metodoSecundarioId) setMetodoSecundarioId(metodosPago.length > 1 ? metodosPago[1].id : metodosPago[0].id);
    }
  }, [metodosPago, metodoPrincipalId, metodoSecundarioId]);
  const [montoMetodoPrincipal, setMontoMetodoPrincipal] = useState("");
  const [montoMetodoSecundario, setMontoMetodoSecundario] = useState("");
  const [observacionesPagoMasivo, setObservacionesPagoMasivo] = useState("");
  const [modalPagoMasivoAbierto, setModalPagoMasivoAbierto] = useState(false);

  const isLoading = isLoadingSocio || isLoadingCuenta;

  // Crear un mapa de periodos para acceso rápido filtrado por año seleccionado
  const cuotasPorMes: Record<string, {
    estado: string;
    monto: number;
    id: number;
    tarjetaCentroEstado: "PENDIENTE_RESPUESTA" | "APROBADA" | "RECHAZADA" | "NO_APLICA";
  }> = {};
  if (cuentaCorriente?.cuotas) {
    cuentaCorriente.cuotas.forEach((cuota) => {
      if (cuota.periodo.startsWith(String(selectedYear))) {
        const mes = cuota.periodo.split("-")[1];
        cuotasPorMes[mes] = {
          estado: cuota.estado,
          monto: Number(cuota.monto),
          id: cuota.id,
          tarjetaCentroEstado: cuota.tarjetaCentroEstado,
        };
      }
    });
  }

  // Mostrar todas las cuotas pendientes para pago rapido
  const cuotasPendientes = useMemo(
    () =>
      (cuentaCorriente?.cuotas ?? [])
        .filter((cuota) => cuota.estado === "PENDIENTE")
        .sort((a, b) => a.periodo.localeCompare(b.periodo)),
    [cuentaCorriente?.cuotas],
  );

  const cuotasPendientesSeleccionadas = useMemo(
    () =>
      cuotasPendientes.filter((cuota) => cuotasSeleccionadas.includes(cuota.id)),
    [cuotasPendientes, cuotasSeleccionadas],
  );

  const totalAdeudadoPendiente = useMemo(
    () => cuotasPendientes.reduce((acc, cuota) => acc + Number(cuota.monto), 0),
    [cuotasPendientes],
  );

  const totalSeleccionado = useMemo(
    () =>
      cuotasPendientesSeleccionadas.reduce(
        (acc, cuota) => acc + Number(cuota.monto),
        0,
      ),
    [cuotasPendientesSeleccionadas],
  );

  const totalIngresadoMetodos = useMemo(() => {
    const principal = Number(montoMetodoPrincipal || 0);
    const secundario = usarSegundoMetodo ? Number(montoMetodoSecundario || 0) : 0;
    return principal + secundario;
  }, [montoMetodoPrincipal, montoMetodoSecundario, usarSegundoMetodo]);

  const montoPrincipalNumerico = Number(montoMetodoPrincipal || 0);
  const montoSecundarioNumerico = Number(montoMetodoSecundario || 0);
  const totalSeleccionadoRedondeado = Number(totalSeleccionado.toFixed(2));
  const totalIngresadoRedondeado = Number(totalIngresadoMetodos.toFixed(2));
  const diferenciaCarga = Number((totalSeleccionadoRedondeado - totalIngresadoRedondeado).toFixed(2));
  const metodosDuplicados = usarSegundoMetodo && metodoPrincipalId === metodoSecundarioId;
  const montosSegundoMetodoValidos = !usarSegundoMetodo ||
    (montoPrincipalNumerico > 0 && montoSecundarioNumerico > 0);
  const totalValidoParaConfirmar =
    (!usarSegundoMetodo && montoPrincipalNumerico <= 0) ||
    totalIngresadoRedondeado === totalSeleccionadoRedondeado;
  const puedeConfirmarPagoMasivo =
    !metodosDuplicados &&
    montosSegundoMetodoValidos &&
    totalSeleccionadoRedondeado > 0 &&
    totalValidoParaConfirmar;

  const todasPendientesSeleccionadas =
    cuotasPendientes.length > 0 && cuotasSeleccionadas.length === cuotasPendientes.length;

  const limpiarFormularioPagoMasivo = () => {
    if (metodosPago && metodosPago.length > 0) {
      setMetodoPrincipalId(metodosPago[0].id);
      setMetodoSecundarioId(metodosPago.length > 1 ? metodosPago[1].id : metodosPago[0].id);
    }
    setUsarSegundoMetodo(false);
    setMontoMetodoPrincipal("");
    setMontoMetodoSecundario("");
    setObservacionesPagoMasivo("");
  };

  const renderEstadoMes = (mesKey: string) => {
    const cuota = cuotasPorMes[mesKey];

    if (cuota?.tarjetaCentroEstado === "PENDIENTE_RESPUESTA") {
      return (
        <span className="inline-flex items-center justify-center rounded-md bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
          Tarj. pend.
        </span>
      );
    }

    if (cuota?.tarjetaCentroEstado === "RECHAZADA") {
      return (
        <span className="inline-flex items-center justify-center rounded-md bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
          Tarj. rech.
        </span>
      );
    }

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

  const renderTarjetaEstado = (cuota: {
    tarjetaCentroEstado: "PENDIENTE_RESPUESTA" | "APROBADA" | "RECHAZADA" | "NO_APLICA";
    tarjetaCentroDetalle: string;
    tarjetaCentroFechaEstado?: string;
  }) => {
    if (cuota.tarjetaCentroEstado === "NO_APLICA") {
      return <span className="text-xs text-muted-foreground">No aplica</span>;
    }

    if (cuota.tarjetaCentroEstado === "PENDIENTE_RESPUESTA") {
      return (
        <div className="space-y-1">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Tarjeta pendiente
          </Badge>
          <p className="text-xs text-muted-foreground">{cuota.tarjetaCentroDetalle}</p>
        </div>
      );
    }

    if (cuota.tarjetaCentroEstado === "RECHAZADA") {
      return (
        <div className="space-y-1">
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Tarjeta rechazada
          </Badge>
          <p className="text-xs text-muted-foreground">{cuota.tarjetaCentroDetalle}</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          Tarjeta aprobada
        </Badge>
        <p className="text-xs text-muted-foreground">{cuota.tarjetaCentroDetalle}</p>
      </div>
    );
  };

  const handlePagarCuota = (cuotaId: number) => {
    registrarPago({
      cuotaId,
      metodoPagoId: metodoPrincipalId || (metodosPago?.[0]?.id ?? 1),
    });
  };

  const toggleCuotaSeleccionada = (cuotaId: number, checked: boolean) => {
    setCuotasSeleccionadas((prev) => {
      if (checked) {
        return prev.includes(cuotaId) ? prev : [...prev, cuotaId];
      }
      return prev.filter((id) => id !== cuotaId);
    });
  };

  const seleccionarTodasPendientes = () => {
    setCuotasSeleccionadas(cuotasPendientes.map((cuota) => cuota.id));
  };

  const limpiarSeleccionCuotas = () => {
    setCuotasSeleccionadas([]);
    setModalPagoMasivoAbierto(false);
    limpiarFormularioPagoMasivo();
  };

  const abrirModalPagoMasivo = () => {
    if (cuotasSeleccionadas.length === 0) {
      return;
    }

    limpiarFormularioPagoMasivo();
    setMontoMetodoPrincipal(String(Math.round(totalSeleccionado)));
    setModalPagoMasivoAbierto(true);
  };

  const handleImprimirReciboSeleccionadas = async () => {
    if (!idValido || cuotasSeleccionadas.length === 0) {
      return;
    }

    await abrirReciboMultipleHtml(socioId, cuotasSeleccionadas);
  };

  const handlePagarCuotasSeleccionadas = () => {
    if (!idValido || cuotasSeleccionadas.length === 0) {
      return;
    }

    if (usarSegundoMetodo && metodoPrincipalId === metodoSecundarioId) {
      return;
    }

    const totalEsperado = Number(totalSeleccionado.toFixed(2));
    const totalCargado = Number(totalIngresadoMetodos.toFixed(2));

    const pagos = usarSegundoMetodo
      ? [
          { metodoPagoId: metodoPrincipalId, monto: Number(montoMetodoPrincipal || 0) },
          { metodoPagoId: metodoSecundarioId, monto: Number(montoMetodoSecundario || 0) },
        ]
      : [
          {
            metodoPagoId: metodoPrincipalId,
            monto:
              Number(montoMetodoPrincipal || 0) > 0
                ? Number(montoMetodoPrincipal)
                : totalEsperado,
          },
        ];

    const algunMontoInvalido = pagos.some((pago) => Number(pago.monto) <= 0);
    if (algunMontoInvalido) {
      return;
    }

    const totalPagos = Number(
      pagos.reduce((acc, pago) => acc + Number(pago.monto), 0).toFixed(2),
    );
    if (totalPagos !== totalEsperado || totalCargado > 0 && totalCargado !== totalEsperado) {
      return;
    }

    pagoMasivoMutation.mutate(
      {
        socioId,
        cuotaIds: cuotasSeleccionadas,
        pagos,
        observaciones: observacionesPagoMasivo || undefined,
      },
      {
        onSuccess: () => {
          limpiarSeleccionCuotas();
        },
      },
    );
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
            <Card className="overflow-hidden border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-background">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Cuenta Corriente
                    </CardTitle>
                    <CardDescription>
                      {socio?.apellido}, {socio?.nombre} - DNI: {socio?.dni}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-medium">
                      <ListChecks className="mr-1 h-3.5 w-3.5" />
                      {cuentaCorriente?.cuotas?.length ?? 0} cuotas
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      <Wallet className="mr-1 h-3.5 w-3.5" />
                      Estado actualizado
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Resumen de totales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-green-500">
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

              <Card className="border-l-4 border-l-red-500">
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

              <Card className="border-l-4 border-l-amber-500">
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
                {/* Tabla de estado de pagos - Desktop */}
                <div className="hidden overflow-x-auto md:block">
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

                {/* Cards de estado de pagos - Mobile */}
                <div className="md:hidden space-y-3">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="font-medium mb-3">{socio?.apellido}, {socio?.nombre}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {meses.map((mes) => (
                        <div key={mes.key} className="text-center p-2 rounded bg-background">
                          <p className="text-xs text-muted-foreground mb-1">{mes.label}</p>
                          <div className="text-lg">{renderEstadoMes(mes.key)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sección de pago rápido de cuotas pendientes */}
                {cuotasPendientes.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Cuotas pendientes de pago</h3>
                    </div>
                    {socio?.tarjetaCentro && (
                      <p className="mb-4 text-sm text-muted-foreground">
                        Si la tarjeta del centro fue rechazada, podés imprimir el recibo desde aquí y luego registrar el pago.
                      </p>
                    )}

                    <div className="mb-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-background p-4 space-y-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            Seleccionadas: {cuotasSeleccionadas.length} de {cuotasPendientes.length}
                          </p>
                          <p className="text-sm text-muted-foreground leading-none">
                            Total seleccionado: {formatCurrency(totalSeleccionado)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={seleccionarTodasPendientes}
                          >
                            <ListChecks className="mr-1 h-4 w-4" />
                            Seleccionar todas adeudadas
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={limpiarSeleccionCuotas}
                          >
                            Limpiar selección
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border bg-background/70 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total adeudado</p>
                          <p className="text-lg font-semibold">{formatCurrency(totalAdeudadoPendiente)}</p>
                        </div>
                        <div className="rounded-lg border bg-background/70 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total seleccionado</p>
                          <p className="text-lg font-semibold text-primary">{formatCurrency(totalSeleccionado)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-muted-foreground">
                          Seleccioná las cuotas y luego registrá el pago desde el modal.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void handleImprimirReciboSeleccionadas()}
                            disabled={cuotasSeleccionadas.length === 0}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Recibo de seleccionadas
                          </Button>
                          <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={abrirModalPagoMasivo}
                            disabled={cuotasSeleccionadas.length === 0 || pagoMasivoMutation.isPending}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Registrar pago
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Dialog
                      open={modalPagoMasivoAbierto}
                      onOpenChange={(open) => {
                        setModalPagoMasivoAbierto(open);
                        if (!open) {
                          limpiarFormularioPagoMasivo();
                        }
                      }}
                    >
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Registrar pago de cuotas seleccionadas
                          </DialogTitle>
                          <DialogDescription>
                            {cuotasSeleccionadas.length} cuotas seleccionadas por un total de {formatCurrency(totalSeleccionado)}.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border bg-muted/40 p-3">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cuotas seleccionadas</p>
                              <p className="text-lg font-semibold">{cuotasSeleccionadas.length}</p>
                            </div>
                            <div className="rounded-lg border bg-muted/40 p-3">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total a pagar</p>
                              <p className="text-lg font-semibold text-primary">{formatCurrency(totalSeleccionado)}</p>
                            </div>
                          </div>

                          <div className="rounded-lg border p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Método principal</Label>
                                <Select
                                  value={metodoPrincipalId ? String(metodoPrincipalId) : ""}
                                  onValueChange={(value) => setMetodoPrincipalId(Number(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un método" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {metodosPago?.map((metodo) => (
                                      <SelectItem key={metodo.id} value={String(metodo.id)}>
                                        {metodo.nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Importe método principal</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={montoMetodoPrincipal}
                                  onChange={(e) => setMontoMetodoPrincipal(e.target.value)}
                                  placeholder={String(Math.round(totalSeleccionado))}
                                />
                              </div>
                            </div>

                            <div className="rounded-md border bg-muted/30 p-3">
                              <div className="flex items-center gap-2">
                                <input
                                  id="segundoMetodoModal"
                                  type="checkbox"
                                  checked={usarSegundoMetodo}
                                  onChange={(e) => setUsarSegundoMetodo(e.target.checked)}
                                />
                                <Label htmlFor="segundoMetodoModal" className="font-medium">Usar segundo método de pago</Label>
                              </div>
                            </div>

                            {usarSegundoMetodo && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label>Método secundario</Label>
                                  <Select
                                    value={metodoSecundarioId ? String(metodoSecundarioId) : ""}
                                    onValueChange={(value) => setMetodoSecundarioId(Number(value))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccione un método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {metodosPago?.map((metodo) => (
                                        <SelectItem key={metodo.id} value={String(metodo.id)}>
                                          {metodo.nombre}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Importe método secundario</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={montoMetodoSecundario}
                                    onChange={(e) => setMontoMetodoSecundario(e.target.value)}
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Observaciones (opcional)</Label>
                              <Input
                                value={observacionesPagoMasivo}
                                onChange={(e) => setObservacionesPagoMasivo(e.target.value)}
                                placeholder="Ej: regularización de deuda"
                              />
                            </div>
                          </div>

                          <div
                            className={
                              metodosDuplicados || !montosSegundoMetodoValidos || !totalValidoParaConfirmar
                                ? "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                                : "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                            }
                          >
                            {metodosDuplicados ? (
                              <span className="flex items-center gap-2">
                                <CircleAlert className="h-4 w-4" />
                                Elegí métodos distintos para dividir el pago.
                              </span>
                            ) : !montosSegundoMetodoValidos ? (
                              <span className="flex items-center gap-2">
                                <CircleAlert className="h-4 w-4" />
                                Cargá importes mayores a 0 para ambos métodos.
                              </span>
                            ) : !totalValidoParaConfirmar ? (
                              <span className="flex items-center gap-2">
                                <CircleAlert className="h-4 w-4" />
                                El total ingresado difiere por {formatCurrency(Math.abs(diferenciaCarga))}. Ajustalo para continuar.
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <CircleCheck className="h-4 w-4" />
                                Total validado. Ya podés confirmar el pago.
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Total seleccionado: {formatCurrency(totalSeleccionado)} · Total ingresado: {formatCurrency(totalIngresadoMetodos)}
                          </p>
                        </div>

                        <DialogFooter className="pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalPagoMasivoAbierto(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handlePagarCuotasSeleccionadas}
                            disabled={pagoMasivoMutation.isPending || !puedeConfirmarPagoMasivo}
                          >
                            {pagoMasivoMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Procesando...
                              </>
                            ) : (
                              "Confirmar pago"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Tabla de cuotas pendientes */}
                    <ResponsiveTable
                      data={cuotasPendientes}
                      keyExtractor={(cuota) => String(cuota.id)}
                      columns={[
                        {
                          key: "seleccion",
                          header: (
                            <input
                              type="checkbox"
                              checked={todasPendientesSeleccionadas}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  seleccionarTodasPendientes();
                                  return;
                                }
                                limpiarSeleccionCuotas();
                              }}
                              aria-label="Seleccionar todas"
                            />
                          ),
                          headerClassName: "w-[60px] text-center",
                          cellClassName: "text-center",
                          cell: (cuota) => (
                            <input
                              type="checkbox"
                              checked={cuotasSeleccionadas.includes(cuota.id)}
                              onChange={(e) =>
                                toggleCuotaSeleccionada(cuota.id, e.target.checked)
                              }
                              aria-label={`Seleccionar cuota ${cuota.periodo}`}
                            />
                          ),
                        },
                        {
                          key: "periodo",
                          header: "Período",
                          cell: (cuota) => (
                            <span className={cuotasSeleccionadas.includes(cuota.id) ? "font-medium" : ""}>
                              {cuota.periodo}
                            </span>
                          ),
                        },
                        {
                          key: "monto",
                          header: "Monto",
                          headerClassName: "text-right",
                          cellClassName: "text-right",
                          cell: (cuota) => formatCurrency(Number(cuota.monto)),
                        },
                        {
                          key: "estadoTarjeta",
                          header: "Tarjeta del Centro",
                          cell: (cuota) => renderTarjetaEstado(cuota),
                        },
                        {
                          key: "acciones",
                          header: "Acciones",
                          headerClassName: "text-center",
                          cellClassName: "text-center",
                          cell: (cuota) => (
                            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                onClick={() => {
                                  if (!idValido) {
                                    return;
                                  }
                                  void abrirReciboHtml(cuota.periodo, socioId);
                                }}
                                title="Imprimir recibo"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Imprimir recibo
                              </Button>

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
                            </div>
                          ),
                        },
                      ]}
                      renderCard={(cuota) => (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={cuotasSeleccionadas.includes(cuota.id)}
                                onChange={(e) =>
                                  toggleCuotaSeleccionada(cuota.id, e.target.checked)
                                }
                                aria-label={`Seleccionar cuota ${cuota.periodo}`}
                                className="mt-1"
                              />
                              <div>
                                <p className="font-semibold">{cuota.periodo}</p>
                                <p className="text-lg font-bold text-primary">
                                  {formatCurrency(Number(cuota.monto))}
                                </p>
                                <div className="mt-2">{renderTarjetaEstado(cuota)}</div>
                              </div>
                            </div>
                            {cuotasSeleccionadas.includes(cuota.id) && (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                Seleccionada
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 pt-2 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800 w-full"
                              onClick={() => {
                                if (!idValido) {
                                  return;
                                }
                                void abrirReciboHtml(cuota.periodo, socioId);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Imprimir recibo
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full">
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
                          </div>
                        </div>
                      )}
                      tableWrapperClassName={cuotasSeleccionadas.length > 0 ? "[&_tr:has(input:checked)]:bg-emerald-50/70" : undefined}
                    />
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
                      <ResponsiveTable
                        data={cuotasPagina}
                        keyExtractor={(cuota) => String(cuota.id)}
                        columns={[
                          {
                            key: "periodo",
                            header: "Período",
                            cell: (cuota) => (
                              <span className="font-medium">{cuota.periodo}</span>
                            ),
                          },
                          {
                            key: "monto",
                            header: "Monto",
                            headerClassName: "text-right",
                            cellClassName: "text-right",
                            cell: (cuota) => formatCurrency(Number(cuota.monto)),
                          },
                          {
                            key: "estado",
                            header: "Estado",
                            headerClassName: "text-center",
                            cellClassName: "text-center",
                            cell: (cuota) => renderTarjetaEstado(cuota),
                          },
                          {
                            key: "fechaPago",
                            header: "Fecha de pago",
                            cell: (cuota) =>
                              cuota.fechaPago
                                ? new Date(cuota.fechaPago).toLocaleDateString("es-AR")
                                : "-",
                          },
                          {
                            key: "acciones",
                            header: "Acciones",
                            headerClassName: "text-center",
                            cellClassName: "text-center",
                            cell: (cuota) => (
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
                            ),
                          },
                        ]}
                        renderCard={(cuota) => (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{cuota.periodo}</p>
                                <p className="text-lg font-bold text-primary">
                                  {formatCurrency(Number(cuota.monto))}
                                </p>
                              </div>
                              {renderTarjetaEstado(cuota)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {cuota.fechaPago
                                ? `Pagada: ${new Date(cuota.fechaPago).toLocaleDateString("es-AR")}`
                                : "Sin fecha de pago"}
                            </div>
                            <div className="pt-2 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cuota.estado === "PAGADA"
                                  ? "border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 w-full"
                                  : "border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800 w-full"
                                }
                                onClick={() => {
                                  if (!idValido) {
                                    return;
                                  }
                                  void abrirReciboHtml(cuota.periodo, socioId);
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Descargar recibo
                              </Button>
                            </div>
                          </div>
                        )}
                      />
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
