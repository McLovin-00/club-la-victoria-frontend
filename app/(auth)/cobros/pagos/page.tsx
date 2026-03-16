"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ChevronLeft, ChevronFirst, ChevronRight, ChevronLast, Search, X, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useCuotas, EstadoCuota, type Cuota } from "@/hooks/api/cobros/useCuotas";
import { useMetodosPago } from "@/hooks/api/cobros/useMetodosPago";
import { usePagoMultiple } from "@/hooks/api/cobros/usePagoMultiple";
import { useProcesarResultadosTarjetaCentro } from "@/hooks/api/cobros/useProcesarResultadosTarjetaCentro";
import { PAGINACION } from "@/lib/constants";

type FiltroEstado = "TODOS" | "PENDIENTE" | "PAGADA";
type FiltroPestana = "sinTarjeta" | "conTarjeta";

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
  const [metodoPagoId, setMetodoPagoId] = useState<number>(0);
  const { data: metodosPago } = useMetodosPago();

  useEffect(() => {
    if (metodosPago && metodosPago.length > 0 && !metodoPagoId) {
      setMetodoPagoId(metodosPago[0].id);
    }
  }, [metodosPago, metodoPagoId]);
  
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>("PENDIENTE");
  const [filtroPestana, setFiltroPestana] = useState<FiltroPestana>("sinTarjeta");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limitPaginado = PAGINACION.TAMAÑO_PAGINA_POR_DEFECTO;
  const [mostrarTodosRegistros, setMostrarTodosRegistros] = useState(false);
  const [limitSinPaginacion, setLimitSinPaginacion] = useState<number>(limitPaginado);
  const [seleccionMasivaPendiente, setSeleccionMasivaPendiente] = useState(false);

  const periodoFiltro = mes && anio ? `${anio}-${mes}` : "";
  const pageConsulta = mostrarTodosRegistros ? 1 : page;
  const limitConsulta = mostrarTodosRegistros ? limitSinPaginacion : limitPaginado;

  const filtros = useMemo(() => {
    const filtrosQuery: {
      periodo?: string;
      estado?: EstadoCuota;
      tarjetaCentro?: boolean;
      busqueda?: string;
      page: number;
      limit: number;
    } = { page: pageConsulta, limit: limitConsulta };

    if (periodoFiltro) {
      filtrosQuery.periodo = periodoFiltro;
    }

    if (estadoFiltro !== "TODOS") {
      filtrosQuery.estado = estadoFiltro as EstadoCuota;
    }

    filtrosQuery.tarjetaCentro = filtroPestana === "conTarjeta";

    if (busquedaAplicada) {
      filtrosQuery.busqueda = busquedaAplicada;
    }

    return filtrosQuery;
  }, [periodoFiltro, estadoFiltro, filtroPestana, busquedaAplicada, pageConsulta, limitConsulta]);

  const { data, isLoading } = useCuotas(filtros);
  const pagoMultipleMutation = usePagoMultiple();
  const procesarResultadosTarjetaCentroMutation = useProcesarResultadosTarjetaCentro();

  const handleMesChange = useCallback((newMes: string) => {
    setMes(newMes);
    setPage(1);
  }, []);

  const handleAnioChange = useCallback((newAnio: string) => {
    setAnio(newAnio);
    setPage(1);
  }, []);

  const handlePeriodoActual = useCallback(() => {
    const actual = getPeriodoActual();
    setMes(actual.mes);
    setAnio(actual.anio);
    setPage(1);
  }, [setMes, setAnio, setPage]);

  const handleLimpiarPeriodo = useCallback(() => {
    setMes("");
    setAnio("");
    setPage(1);
  }, [setMes, setAnio, setPage]);

  const handleEstadoChange = useCallback((value: FiltroEstado) => {
    setEstadoFiltro(value);
    setPage(1);
  }, []);

  const handlePestanaChange = useCallback((value: string) => {
    const nextValue: FiltroPestana = value === "conTarjeta" ? "conTarjeta" : "sinTarjeta";
    setFiltroPestana(nextValue);
    setPage(1);
  }, []);

  const handleBusquedaChange = useCallback((value: string) => {
    setBusqueda(value);
  }, []);

  const aplicarBusqueda = useCallback(() => {
    setBusquedaAplicada(busqueda);
    setPage(1);
  }, [busqueda]);

  const limpiarBusqueda = useCallback(() => {
    setBusqueda("");
    setBusquedaAplicada("");
    setPage(1);
  }, []);

  const handleBusquedaKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      aplicarBusqueda();
    }
  }, []);

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

  const toggleSeleccion = (cuotaId?: number) => {
    if (!cuotaId) {
      return;
    }

    setCuotasSeleccionadas((prev) =>
      prev.includes(cuotaId)
        ? prev.filter((id) => id !== cuotaId)
        : [...prev, cuotaId]
    );
  };

  const handleRegistrarPagosSeleccionados = () => {
    if (cuotasSeleccionadas.length === 0 || !metodoPagoId) {
      return;
    }

    pagoMultipleMutation.mutate(
      { cuotaIds: cuotasSeleccionadas, metodoPagoId },
      {
        onSuccess: () => {
          setCuotasSeleccionadas([]);
        },
      }
    );
  };

  const cuotasSeleccionables = useMemo(
    () =>
      (data?.cuotas ?? [])
        .filter((cuota) => cuota.estado === EstadoCuota.PENDIENTE)
        .map((cuota) => cuota.id),
    [data?.cuotas]
  );

  const todasLasSeleccionablesMarcadas =
    cuotasSeleccionables.length > 0 &&
    cuotasSeleccionables.every((cuotaId) => cuotasSeleccionadas.includes(cuotaId));

  const seleccionMasivaActiva = mostrarTodosRegistros && todasLasSeleccionablesMarcadas;

  useEffect(() => {
    if (!seleccionMasivaPendiente || isLoading || !data) {
      return;
    }

    if (data.limit < data.total) {
      return;
    }

    setCuotasSeleccionadas(cuotasSeleccionables);
    setSeleccionMasivaPendiente(false);
  }, [seleccionMasivaPendiente, isLoading, data, cuotasSeleccionables]);

  const handleSeleccionarTodos = () => {
    if (seleccionMasivaActiva) {
      setCuotasSeleccionadas([]);
      setSeleccionMasivaPendiente(false);
      setMostrarTodosRegistros(false);
      setLimitSinPaginacion(limitPaginado);
      setPage(1);
      return;
    }

    const totalRegistros = data?.total ?? 0;
    if (totalRegistros === 0) {
      return;
    }

    setPage(1);
    setMostrarTodosRegistros(true);
    setLimitSinPaginacion(Math.max(totalRegistros, limitPaginado));
    setSeleccionMasivaPendiente(true);
  };

  const getCuotasSeleccionadasTarjetaCentro = () => {
    const cuotas = data?.cuotas ?? [];
    const cuotasIdsSeleccionadas = new Set(cuotasSeleccionadas);

    return cuotas.filter(
      (cuota) =>
        cuota.estado === EstadoCuota.PENDIENTE &&
        cuotasIdsSeleccionadas.has(cuota.id)
    );
  };

  const handleMarcarSeleccionadasTarjetaCentro = (aprobada: boolean) => {
    const cuotasTarjeta = getCuotasSeleccionadasTarjetaCentro();
    if (cuotasTarjeta.length === 0) {
      return;
    }

    procesarResultadosTarjetaCentroMutation.mutate(
      {
        resultados: cuotasTarjeta.map((cuota) => ({
          cuotaId: cuota.id,
          aprobada,
        })),
      },
      {
        onSuccess: () => {
          setCuotasSeleccionadas([]);
        },
      }
    );
  };

  const handleProcesarCuotaTarjetaCentro = (cuotaId: number, aprobada: boolean) => {
    procesarResultadosTarjetaCentroMutation.mutate({
      resultados: [
        {
          cuotaId,
          aprobada,
        },
      ],
    });
  };

  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  const getDescripcionFiltros = () => {
    const partes: string[] = [];
    
    if (totalItems > 0) {
      partes.push(`Mostrando ${((pageConsulta - 1) * limitConsulta) + 1}-${Math.min(pageConsulta * limitConsulta, totalItems)} de ${totalItems} cuotas`);
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

    partes.push(
      filtroPestana === "conTarjeta"
        ? "socios con tarjeta del centro"
        : "socios sin tarjeta del centro"
    );
    
    return partes.join(" - ");
  };

  const baseColumns = [
    {
      key: "seleccion",
      header: "",
      headerClassName: "w-12",
      cell: (cuota: Cuota) => (
        <input
          type="checkbox"
          checked={cuotasSeleccionadas.includes(cuota.id)}
          onChange={() => toggleSeleccion(cuota.id)}
          disabled={cuota.estado !== EstadoCuota.PENDIENTE}
          className="h-4 w-4"
        />
      ),
    },
    {
      key: "socio",
      header: "Socio",
      cell: (cuota: Cuota) => (
        <Link
          href={`/socios/${cuota.socioId}/cuenta-corriente`}
          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors group"
        >
          <User className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
          <span>
            {cuota.socio
              ? `${cuota.socio.apellido}, ${cuota.socio.nombre}`
              : `Socio #${cuota.socioId}`}
          </span>
        </Link>
      ),
    },
    {
      key: "dni",
      header: "DNI",
      cell: (cuota: Cuota) => cuota.socio?.dni || "-",
    },
    {
      key: "periodo",
      header: "Período",
      cell: (cuota: Cuota) => cuota.periodo,
    },
    {
      key: "monto",
      header: "Monto",
      cell: (cuota: Cuota) => formatMonto(cuota.monto),
    },
    {
      key: "emision",
      header: "Emisión cuota",
      cell: (cuota: Cuota) => formatFechaHora(cuota.createdAt),
    },
    {
      key: "fechaPago",
      header: "Fecha pago",
      cell: (cuota: Cuota) => formatFechaHora(cuota.fechaPago),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (cuota: Cuota) => (
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
      ),
    },
  ];

  const tarjetaColumn = {
    key: "resultadoTarjeta",
    header: "Resultado tarjeta",
    cell: (cuota: Cuota) =>
      cuota.estado === EstadoCuota.PENDIENTE ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            disabled={procesarResultadosTarjetaCentroMutation.isPending}
            onClick={() => handleProcesarCuotaTarjetaCentro(cuota.id, true)}
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Aprobada
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={procesarResultadosTarjetaCentroMutation.isPending}
            onClick={() => handleProcesarCuotaTarjetaCentro(cuota.id, false)}
          >
            <X className="mr-1 h-3 w-3" />
            Rechazada
          </Button>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      ),
  };

  const columns = filtroPestana === "conTarjeta"
    ? [...baseColumns, tarjetaColumn]
    : baseColumns;

  const renderCard = (cuota: Cuota) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={cuotasSeleccionadas.includes(cuota.id)}
            onChange={() => toggleSeleccion(cuota.id)}
            disabled={cuota.estado !== EstadoCuota.PENDIENTE}
            className="mt-1 h-4 w-4"
          />
          <div>
            <Link
              href={`/socios/${cuota.socioId}/cuenta-corriente`}
              className="font-semibold inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              {cuota.socio
                ? `${cuota.socio.apellido}, ${cuota.socio.nombre}`
                : `Socio #${cuota.socioId}`}
            </Link>
            <p className="text-sm text-muted-foreground">
              DNI: {cuota.socio?.dni || "-"}
            </p>
          </div>
        </div>
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
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground">Período</p>
          <p className="font-medium">{cuota.periodo}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Monto</p>
          <p className="font-bold text-primary">{formatMonto(cuota.monto)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Emisión</p>
          <p>{formatFechaHora(cuota.createdAt)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fecha pago</p>
          <p>{formatFechaHora(cuota.fechaPago)}</p>
        </div>
      </div>

      {filtroPestana === "conTarjeta" && cuota.estado === EstadoCuota.PENDIENTE && (
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground mb-2">Resultado tarjeta</p>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 w-full"
              disabled={procesarResultadosTarjetaCentroMutation.isPending}
              onClick={() => handleProcesarCuotaTarjetaCentro(cuota.id, true)}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Aprobada
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 w-full"
              disabled={procesarResultadosTarjetaCentroMutation.isPending}
              onClick={() => handleProcesarCuotaTarjetaCentro(cuota.id, false)}
            >
              <X className="mr-1 h-3 w-3" />
              Rechazada
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Registrar Pagos" description="Registre pagos de cuotas desde el listado">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title">Registrar pagos</h1>
            <p className="page-description">
              Registre pagos y consulte cuotas con filtros.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Cuotas</CardTitle>
            <CardDescription>
              {totalItems > 0 ? getDescripcionFiltros() : "Lista de cuotas con filtros de búsqueda"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <Tabs value={filtroPestana} onValueChange={handlePestanaChange}>
                <TabsList>
                  <TabsTrigger value="sinTarjeta">Sin tarjeta del centro</TabsTrigger>
                  <TabsTrigger value="conTarjeta">Con tarjeta del centro</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col md:flex-row gap-4">
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button
                      variant="outline"
                      onClick={handleSeleccionarTodos}
                      disabled={totalItems === 0}
                    >
                      {seleccionMasivaActiva
                        ? "Quitar seleccion masiva"
                        : "Seleccionar todos los registros"}
                    </Button>
                    {filtroPestana === "conTarjeta" ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          onClick={() => handleMarcarSeleccionadasTarjetaCentro(true)}
                          disabled={
                            cuotasSeleccionadas.length === 0 ||
                            procesarResultadosTarjetaCentroMutation.isPending
                          }
                        >
                          {procesarResultadosTarjetaCentroMutation.isPending
                            ? "Procesando..."
                            : "Marcar seleccionadas como aprobadas"}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleMarcarSeleccionadasTarjetaCentro(false)}
                          disabled={
                            cuotasSeleccionadas.length === 0 ||
                            procesarResultadosTarjetaCentroMutation.isPending
                          }
                        >
                          {procesarResultadosTarjetaCentroMutation.isPending
                            ? "Procesando..."
                            : "Marcar seleccionadas como rechazadas"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="grid gap-2">
                          <Label htmlFor="metodo-pago">Método de pago</Label>
                          <Select
                            value={metodoPagoId ? String(metodoPagoId) : ""}
                            onValueChange={(value) => setMetodoPagoId(Number(value))}
                          >
                            <SelectTrigger id="metodo-pago" className="min-w-[210px]">
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

                        <Button
                          onClick={handleRegistrarPagosSeleccionados}
                          disabled={cuotasSeleccionadas.length === 0 || pagoMultipleMutation.isPending}
                        >
                          {pagoMultipleMutation.isPending
                            ? "Registrando pagos..."
                            : "Registrar seleccionadas como pagadas"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <ResponsiveTable
                  data={data.cuotas}
                  keyExtractor={(cuota) => String(cuota.id)}
                  columns={columns}
                  renderCard={renderCard}
                  tableWrapperClassName={cuotasSeleccionadas.length > 0 ? "[&_tr:has(input:checked)]:bg-primary/5" : undefined}
                />

                {!mostrarTodosRegistros && totalPages > 1 && (
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
                        onClick={() => setPage(prev => prev - 1)}
                        disabled={page === 1}
                        title="Página anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(prev => prev + 1)}
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
    </DashboardLayout>
  );
}
