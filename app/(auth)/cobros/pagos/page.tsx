"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { CreditCard, CheckCircle, ScanBarcode, ChevronLeft, ChevronFirst, ChevronRight, ChevronLast, Search, X, Calendar } from "lucide-react";
import { useCuotas, EstadoCuota } from "@/hooks/api/cobros/useCuotas";
import { useRegistrarPago, MetodoPago } from "@/hooks/api/cobros/useRegistrarPago";
import { usePagoMultiple } from "@/hooks/api/cobros/usePagoMultiple";
import { ScannerPagosModal } from "@/components/cobros/ScannerPagosModal";
import { PAGINACION } from "@/lib/constants";

type FiltroEstado = "TODOS" | "PENDIENTE" | "PAGADA";

// Constantes para el selector de período (igual que en generar cuotas)
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
  return [anioActual - 1, anioActual, anioActual + 1];
};

const getPeriodoActual = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return { mes: month, anio: String(year) };
};

const getNombrePeriodo = (mes: string, anio: string) => {
  if (!mes || !anio) return "";
  const mesNombre = MESES.find(m => m.valor === mes)?.nombre ?? "";
  return `${mesNombre} ${anio}`;
};

export default function PagosPage() {
  const [barcode, setBarcode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(MetodoPago.EFECTIVO);
  
  // Estados para período (separados como en generar cuotas)
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>("PENDIENTE");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = PAGINACION.TAMAÑO_PAGINA_POR_DEFECTO;

  // Construir período a partir de mes y año
  const periodoFiltro = mes && anio ? `${anio}-${mes}` : "";

  // Construir filtros para la query
  const filtros = useMemo(() => {
    const filtrosQuery: {
      periodo?: string;
      estado?: EstadoCuota;
      busqueda?: string;
      page: number;
      limit: number;
    } = { page, limit };

    if (periodoFiltro) {
      filtrosQuery.periodo = periodoFiltro;
    }

    if (estadoFiltro !== "TODOS") {
      filtrosQuery.estado = estadoFiltro as EstadoCuota;
    }

    if (busquedaAplicada) {
      filtrosQuery.busqueda = busquedaAplicada;
    }

    return filtrosQuery;
  }, [periodoFiltro, estadoFiltro, busquedaAplicada, page, limit]);

  const { data, isLoading } = useCuotas(filtros);
  const registrarPagoMutation = useRegistrarPago();
  const pagoMultipleMutation = usePagoMultiple();

  // Handlers para período (como en generar cuotas)
  const handleMesChange = (newMes: string) => {
    setMes(newMes);
    setPage(1);
  };

  const handleAnioChange = (newAnio: string) => {
    setAnio(newAnio);
    setPage(1);
  };

  const handlePeriodoActual = () => {
    const actual = getPeriodoActual();
    setMes(actual.mes);
    setAnio(actual.anio);
    setPage(1);
  };

  const handleLimpiarPeriodo = () => {
    setMes("");
    setAnio("");
    setPage(1);
  };

  const handleEstadoChange = (value: FiltroEstado) => {
    setEstadoFiltro(value);
    setPage(1);
  };

  const handleBusquedaChange = (value: string) => {
    setBusqueda(value);
  };

  const aplicarBusqueda = () => {
    setBusquedaAplicada(busqueda);
    setPage(1);
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
    setBusquedaAplicada("");
    setPage(1);
  };

  const handleBusquedaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      aplicarBusqueda();
    }
  };

  const handleRegistrarPago = () => {
    if (!barcode) return;

    registrarPagoMutation.mutate(
      { barcode, metodoPago },
      {
        onSuccess: () => {
          setBarcode("");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRegistrarPago();
    }
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(monto);
  };

  const formatFechaHora = (fecha?: string) => {
    if (!fecha) {
      return "-";
    }

    return new Date(fecha).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleSeleccion = (barcode?: string) => {
    if (!barcode) {
      return;
    }

    setCuotasSeleccionadas((prev) =>
      prev.includes(barcode)
        ? prev.filter((b) => b !== barcode)
        : [...prev, barcode]
    );
  };

  const handleRegistrarPagosSeleccionados = () => {
    if (cuotasSeleccionadas.length === 0) {
      return;
    }

    pagoMultipleMutation.mutate(
      { barcodes: cuotasSeleccionadas, metodoPago },
      {
        onSuccess: () => {
          setCuotasSeleccionadas([]);
        },
      }
    );
  };

  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  // Texto descriptivo según filtros
  const getDescripcionFiltros = () => {
    const partes: string[] = [];
    
    if (totalItems > 0) {
      partes.push(`Mostrando ${((page - 1) * limit) + 1}-${Math.min(page * limit, totalItems)} de ${totalItems} cuotas`);
    }
    
    if (estadoFiltro !== "TODOS") {
      partes.push(estadoFiltro.toLowerCase());
    } else {
      partes.push("de todos los estados");
    }
    
    if (periodoFiltro) {
      partes.push(`período ${getNombrePeriodo(mes, anio)}`);
    }
    
    if (busquedaAplicada) {
      partes.push(`búsqueda: "${busquedaAplicada}"`);
    }
    
    return partes.join(" - ");
  };

  return (
    <DashboardLayout title="Registrar Pagos" description="Registre pagos de cuotas por código de barras">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Registrar pagos</h1>
            <p className="page-description">
              Carga pagos por código de barras y consulta cuotas con filtros.
            </p>
          </div>

          <Button onClick={() => setScannerOpen(true)} variant="outline" size="lg">
            <ScanBarcode className="mr-2 h-5 w-5" />
            Escáner Masivo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Registrar Pago por Barcode
            </CardTitle>
            <CardDescription>
              Escanee el código de barras de la cuota (formato: MM-AAAA-idSocio, ej: 01-2026-123) para registrar el pago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="01-2026-123"
                  className="font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metodo">Método de Pago</Label>
                <Select value={metodoPago} onValueChange={(v) => setMetodoPago(v as MetodoPago)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MetodoPago.EFECTIVO}>Efectivo</SelectItem>
                    <SelectItem value={MetodoPago.TRANSFERENCIA}>Transferencia</SelectItem>
                    <SelectItem value={MetodoPago.TARJETA_DEBITO}>Tarjeta de Débito</SelectItem>
                    <SelectItem value={MetodoPago.TARJETA_CREDITO}>Tarjeta de Crédito</SelectItem>
                    <SelectItem value={MetodoPago.OTRO}>Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleRegistrarPago}
                  disabled={!barcode || registrarPagoMutation.isPending}
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Registrar Pago
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Cuotas</CardTitle>
            <CardDescription>
              {totalItems > 0 ? getDescripcionFiltros() : "Lista de cuotas con filtros de búsqueda"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
              {/* Fila 1: Buscador */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Buscador por nombre/apellido/DNI */}
                <div className="flex-1">
                  <Label htmlFor="busqueda" className="text-sm">
                    Buscar socio
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="busqueda"
                        value={busqueda}
                        onChange={(e) => handleBusquedaChange(e.target.value)}
                        onKeyDown={handleBusquedaKeyDown}
                        placeholder="Nombre, apellido o DNI..."
                        className="pl-9"
                      />
                    </div>
                    <Button 
                      variant="default" 
                      size="icon"
                      onClick={aplicarBusqueda}
                      title="Buscar"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    {busquedaAplicada && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={limpiarBusqueda}
                        title="Limpiar búsqueda"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filtro por estado */}
                <div className="w-full md:w-40">
                  <Label htmlFor="estado-filtro" className="text-sm">
                    Estado
                  </Label>
                  <Select value={estadoFiltro} onValueChange={handleEstadoChange}>
                    <SelectTrigger id="estado-filtro" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                      <SelectItem value="PAGADA">Pagadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fila 2: Selector de período (como en generar cuotas) */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex items-center gap-2">
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
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePeriodoActual}
                    size="sm"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Mes actual
                  </Button>
                  {periodoFiltro && (
                    <Button
                      variant="ghost"
                      onClick={handleLimpiarPeriodo}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              {/* Indicador de período seleccionado */}
              {periodoFiltro && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="font-normal">
                    {getNombrePeriodo(mes, anio)}
                  </Badge>
                </div>
              )}
            </div>

            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Cargando cuotas...</p>
            ) : data && data.cuotas.length > 0 ? (
              <>
                <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {cuotasSeleccionadas.length} cuota{cuotasSeleccionadas.length !== 1 ? "s" : ""} seleccionada
                    {cuotasSeleccionadas.length !== 1 ? "s" : ""}
                  </p>
                  <Button
                    onClick={handleRegistrarPagosSeleccionados}
                    disabled={cuotasSeleccionadas.length === 0 || pagoMultipleMutation.isPending}
                  >
                    {pagoMultipleMutation.isPending
                      ? "Registrando pagos..."
                      : "Registrar seleccionadas como pagadas"}
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Socio</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Emisión cuota</TableHead>
                      <TableHead>Fecha pago</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.cuotas.map((cuota) => (
                      <TableRow
                        key={cuota.id}
                        className={
                          cuotasSeleccionadas.includes(cuota.barcode || "")
                            ? "bg-primary/5"
                            : ""
                        }
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={Boolean(cuota.barcode) && cuotasSeleccionadas.includes(cuota.barcode ?? "")}
                            onChange={() => toggleSeleccion(cuota.barcode)}
                            disabled={cuota.estado !== EstadoCuota.PENDIENTE || !cuota.barcode}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {cuota.barcode}
                        </TableCell>
                        <TableCell>
                          {cuota.socio
                            ? `${cuota.socio.apellido}, ${cuota.socio.nombre}`
                            : `Socio #${cuota.socioId}`}
                        </TableCell>
                        <TableCell>
                          {cuota.socio?.dni || "-"}
                        </TableCell>
                        <TableCell>{cuota.periodo}</TableCell>
                        <TableCell>{formatMonto(cuota.monto)}</TableCell>
                        <TableCell>{formatFechaHora(cuota.createdAt)}</TableCell>
                        <TableCell>{formatFechaHora(cuota.fechaPago)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              cuota.estado === EstadoCuota.PAGADA
                                ? "default"
                                : "secondary"
                            }
                            className={
                              cuota.estado === EstadoCuota.PAGADA
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            }
                          >
                            {cuota.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Controles de paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        title="Primera página"
                      >
                        <ChevronFirst className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        title="Página anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        title="Página siguiente"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        title="Última página"
                      >
                        <ChevronLast className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No se encontraron cuotas con los filtros seleccionados
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ScannerPagosModal open={scannerOpen} onOpenChange={setScannerOpen} />
    </DashboardLayout>
  );
}
