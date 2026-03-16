"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  UserX,
  Users,
  Loader2,
  Calendar,
  Sparkles,
  TrendingUp,
  Wallet,
  CalendarDays,
  Zap,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Download,
  FileDown,
} from "lucide-react";
import { useSociosElegibles } from "@/hooks/api/cobros/useSociosElegibles";
import {
  useGenerarCuotasSeleccion,
  GenerarCuotasSeleccionResponse,
} from "@/hooks/api/cobros/useGenerarCuotasSeleccion";
import {
  useTalonario,
  abrirTalonarioHtml,
  descargarArchivoTarjetaCentro23f,
} from "@/hooks/api/cobros/useTalonario";
import { cn } from "@/lib/utils";

const formatoMoneda = (monto: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(monto);
const normalizarTexto = (texto: string): string => {
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
};


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

export default function GenerarCuotasPage() {
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [selectedSocioIds, setSelectedSocioIds] = useState<number[]>([]);
  const [resultado, setResultado] = useState<GenerarCuotasSeleccionResponse | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [descargandoTarjetaCentro, setDescargandoTarjetaCentro] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "disponibles" | "generados">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroPestana, setFiltroPestana] = useState<"sinTarjeta" | "conTarjeta">("sinTarjeta");

  // Período formateado para el backend
  const periodo = mes && anio ? `${anio}-${mes}` : "";

  const { data, isLoading } = useSociosElegibles(periodo || undefined, busqueda || undefined);
  const generarMutation = useGenerarCuotasSeleccion();
  
  // Hook para verificar si hay cuotas pendientes para el talonario
  const { data: cuotasTalonario, isLoading: isLoadingTalonario } = useTalonario(periodo);
  const tieneCuotasParaTalonario = cuotasTalonario && cuotasTalonario.length > 0;
  const socios = data?.socios ?? [];
  const sociosDisponibles = useMemo(
    () => socios.filter((socio) => !socio.cuotaExistente),
    [socios]
  );

  const sociosConCuota = useMemo(
    () => socios.filter((socio) => socio.cuotaExistente),
    [socios]
  );

  const sociosConCuotaTarjetaCentro = useMemo(
    () => sociosConCuota.filter((socio) => socio.tarjetaCentro),
    [sociosConCuota]
  );

  const sociosConCuotaSinTarjeta = useMemo(
    () => sociosConCuota.filter((socio) => !socio.tarjetaCentro),
    [sociosConCuota]
  );

  // Extraer categorías únicas
  const categoriasUnicas = useMemo(() => {
    const cats = new Set(socios.map((s) => s.categoriaNombre));
    return Array.from(cats).sort();
  }, [socios]);

  // Socios filtrados según búsqueda y filtros
  const sociosFiltrados = useMemo(() => {
    return socios.filter((socio) => {
      // Filtro por búsqueda (nombre, apellido, DNI) con insensitive a acentos
      const busquedaNormalizada = normalizarTexto(busqueda);
      const nombreNormalizado = normalizarTexto(socio.nombre);
      const apellidoNormalizado = normalizarTexto(socio.apellido);
      const apellidosNombreNormalizado = normalizarTexto(`${socio.apellido}, ${socio.nombre}`);
      const dniNormalizado = socio.dni ? normalizarTexto(socio.dni) : "";

      const coincideBusqueda =
        busqueda === "" ||
        nombreNormalizado.includes(busquedaNormalizada) ||
        apellidoNormalizado.includes(busquedaNormalizada) ||
        dniNormalizado.includes(busquedaNormalizada) ||
        apellidosNombreNormalizado.includes(busquedaNormalizada);

      // Filtro por estado
      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "disponibles" && !socio.cuotaExistente) ||
        (filtroEstado === "generados" && socio.cuotaExistente);

      // Filtro por categoría
      const coincideCategoria =
        filtroCategoria === "todos" || socio.categoriaNombre === filtroCategoria;

      return coincideBusqueda && coincideEstado && coincideCategoria;
    });
  }, [socios, busqueda, filtroEstado, filtroCategoria]);

  const sociosFiltradosConTarjeta = useMemo(
    () => sociosFiltrados.filter((socio) => socio.tarjetaCentro),
    [sociosFiltrados]
  );

  const sociosFiltradosSinTarjeta = useMemo(
    () => sociosFiltrados.filter((socio) => !socio.tarjetaCentro),
    [sociosFiltrados]
  );

  const sociosFiltradosPestana = useMemo(
    () => (filtroPestana === "conTarjeta" ? sociosFiltradosConTarjeta : sociosFiltradosSinTarjeta),
    [filtroPestana, sociosFiltradosConTarjeta, sociosFiltradosSinTarjeta]
  );

  const sociosDisponiblesPestana = useMemo(
    () => sociosFiltradosPestana.filter((socio) => !socio.cuotaExistente),
    [sociosFiltradosPestana]
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const ROW_HEIGHT = 64;
  const virtualizer = useVirtualizer({
    count: sociosFiltradosPestana.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const handleFiltroPestanaChange = (value: string) => {
    if (value === "conTarjeta") {
      setFiltroPestana("conTarjeta");
      return;
    }

    setFiltroPestana("sinTarjeta");
  };
  const montoTotalSeleccionado = useMemo(() => {
    return sociosDisponiblesPestana
      .filter((socio) => selectedSocioIds.includes(socio.id))
      .reduce((acc, socio) => acc + socio.montoMensual, 0);
  }, [sociosDisponiblesPestana, selectedSocioIds]);

  const todosSeleccionados =
    sociosDisponiblesPestana.length > 0 &&
    sociosDisponiblesPestana.every((socio) => selectedSocioIds.includes(socio.id));

  const seleccionParcial =
    !todosSeleccionados &&
    sociosDisponiblesPestana.some((socio) => selectedSocioIds.includes(socio.id));

  const handleMesChange = (newMes: string) => {
    setMes(newMes);
    setSelectedSocioIds([]);
    setResultado(null);
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroCategoria("todos");
  };

  const handleAnioChange = (newAnio: string) => {
    setAnio(newAnio);
    setSelectedSocioIds([]);
    setResultado(null);
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroCategoria("todos");
  };

  const handlePeriodoActual = () => {
    const actual = getPeriodoActual();
    setMes(actual.mes);
    setAnio(actual.anio);
    setSelectedSocioIds([]);
    setResultado(null);
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroCategoria("todos");
  };

  const toggleSocio = useCallback((socioId: number, checked: boolean) => {
    setSelectedSocioIds((prev) => {
      if (checked) {
        return prev.includes(socioId) ? prev : [...prev, socioId];
      }

      return prev.filter((id) => id !== socioId);
    });
  }, []);

  const handleToggleSocio = useCallback((id: number, selected: boolean) => {
    toggleSocio(id, selected);
  }, [toggleSocio]);

  const handleSeleccionarTodos = useCallback((checked: boolean) => {
    const idsPestana = sociosDisponiblesPestana.map((socio) => socio.id);

    if (!checked) {
      setSelectedSocioIds((prev) => prev.filter((id) => !idsPestana.includes(id)));
      return;
    }

    setSelectedSocioIds((prev) => {
      const next = new Set(prev);
      idsPestana.forEach((id) => next.add(id));
      return Array.from(next);
    });
  }, [sociosDisponiblesPestana]);

  const handleSelectAll = handleSeleccionarTodos;

  const handleGenerar = () => {
    if (!periodo || selectedSocioIds.length === 0) {
      return;
    }

    generarMutation.mutate(
      { periodo, socioIds: selectedSocioIds },
      {
        onSuccess: (dataResponse) => {
          setResultado(dataResponse);
          setSelectedSocioIds([]);
        },
      }
    );
  };

  const handleDescargarTarjetaCentro23f = async () => {
    if (!periodo) {
      return;
    }

    try {
      setDescargandoTarjetaCentro(true);
      await descargarArchivoTarjetaCentro23f(periodo);
      toast.success("Archivo Tarjeta del Centro descargado", {
        description: `Se generó el archivo de Tarjeta del Centro para ${getNombrePeriodo(mes, anio)}.`,
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "No fue posible descargar el archivo Tarjeta del Centro";
      toast.error("Error al descargar archivo Tarjeta del Centro", {
        description: mensaje,
      });
    } finally {
      setDescargandoTarjetaCentro(false);
    }
  };

  return (
    <DashboardLayout title="Generar Cuotas" description="Generación mensual por selección de socios">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Generar cuotas</h1>
          <p className="page-description">
            Selecciona período y socios para emitir cuotas masivamente.
          </p>
        </div>

        {/* Hero Section - Período */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-800" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">Generación de Cuotas</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {periodo ? getNombrePeriodo(mes, anio) : "Seleccione un período"}
                </h1>
                <p className="text-muted-foreground max-w-lg">
                  Seleccione el período y marque los socios disponibles para generar cuotas de forma masiva.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mes</Label>
                    <Select value={mes} onValueChange={handleMesChange}>
                      <SelectTrigger className="w-[140px] bg-background/80 backdrop-blur-sm">
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
                      <SelectTrigger className="w-[100px] bg-background/80 backdrop-blur-sm">
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
                <Button
                  variant="outline"
                  onClick={handlePeriodoActual}
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Mes actual
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Resumen de Selección */}
        {periodo && (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-xl border bg-card p-4 md:p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium uppercase tracking-wider">Disponibles</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold tabular-nums">{sociosDisponibles.length}</p>
                <p className="text-xs text-muted-foreground mt-1">socios sin cuota</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border bg-card p-4 md:p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium uppercase tracking-wider">Seleccionados</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {selectedSocioIds.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">para generar</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border bg-card p-4 md:p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Wallet className="h-4 w-4 text-violet-500" />
                  <span className="text-xs font-medium uppercase tracking-wider">Monto Total</span>
                </div>
                <p className="text-xl md:text-2xl font-bold tabular-nums text-violet-600 dark:text-violet-400">
                  {formatoMoneda(montoTotalSeleccionado)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">a cobrar</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border bg-card p-4 md:p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium uppercase tracking-wider">Ya generadas</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {sociosConCuota.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">cuotas existentes</p>
              </div>
            </div>
          </div>
        )}

        {periodo && (sociosConCuotaSinTarjeta.length > 0 || sociosConCuotaTarjetaCentro.length > 0) && (
          <div className="space-y-3">
            {sociosConCuotaSinTarjeta.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <FileDown className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Talonario disponible</p>
                    <p className="text-sm text-muted-foreground">
                      {sociosConCuotaSinTarjeta.length} cuotas generadas para socios sin tarjeta en {getNombrePeriodo(mes, anio)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => abrirTalonarioHtml(periodo)}
                  disabled={isLoadingTalonario}
                  size="lg"
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-all duration-300"
                >
                  {isLoadingTalonario ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Descargar Talonario
                    </>
                  )}
                </Button>
              </div>
            )}

            {sociosConCuotaTarjetaCentro.length > 0 && (
              <div className="flex flex-col gap-3 rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-500/5 via-sky-500/10 to-sky-500/5 p-4 sm:flex-row">
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
                    <FileDown className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-medium">Archivo Tarjeta del Centro disponible</p>
                    <p className="text-sm text-muted-foreground">
                      {sociosConCuotaTarjetaCentro.length} cuotas generadas para socios con tarjeta en {getNombrePeriodo(mes, anio)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleDescargarTarjetaCentro23f}
                  disabled={descargandoTarjetaCentro}
                  size="lg"
                  className="bg-sky-600 text-white transition-all duration-300 hover:bg-sky-700"
                >
                  {descargandoTarjetaCentro ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generando archivo...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-5 w-5" />
                      Descargar Tarjeta Centro
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Botón de Acción Principal */}
        {periodo && selectedSocioIds.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
            <div className="flex-1 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Listo para generar</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSocioIds.length} cuotas · {formatoMoneda(montoTotalSeleccionado)}
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerar}
              disabled={generarMutation.isPending}
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
            >
              {generarMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generando cuotas...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generar {selectedSocioIds.length} Cuotas
                </>
              )}
            </Button>
          </div>
        )}

        {/* Tabla de Socios */}
        {periodo && (
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50 space-y-4">
              {/* Buscador y Filtros */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center gap-2 flex-1">
                  {/* Buscador */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, apellido o DNI..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10 bg-background/80"
                    />
                    {busqueda && (
                      <button
                        type="button"
                        onClick={() => setBusqueda("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Filtros */}
                  <div className="flex items-center gap-2">
                    <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as typeof filtroEstado)}>
                      <SelectTrigger className="w-[140px] bg-background/80">
                        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="disponibles">Disponibles</SelectItem>
                        <SelectItem value="generados">Ya generados</SelectItem>
                      </SelectContent>
                    </Select>

                    {categoriasUnicas.length > 1 && (
                      <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                        <SelectTrigger className="w-[150px] bg-background/80">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas</SelectItem>
                          {categoriasUnicas.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Botón seleccionar todos */}
                {sociosDisponiblesPestana.length > 0 && (
                  <Button
                    variant={todosSeleccionados ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectAll(!todosSeleccionados)}
                    className="gap-2 h-9 shrink-0"
                  >
                    {todosSeleccionados ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Todos seleccionados
                      </>
                    ) : seleccionParcial ? (
                      <>
                        <Users className="h-4 w-4" />
                        Seleccionar resto ({sociosDisponiblesPestana.filter((socio) => !selectedSocioIds.includes(socio.id)).length})
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4" />
                        Seleccionar todos ({sociosDisponiblesPestana.length})
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Info de resultados */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{sociosFiltradosPestana.length}</span> de {socios.length} socios
                  {(busqueda || filtroEstado !== "todos" || filtroCategoria !== "todos") && (
                    <Badge variant="secondary" className="ml-2">Filtrado</Badge>
                  )}
                </div>
                <p>Los socios con cuota ya generada aparecen inhabilitados.</p>
              </div>

              <Tabs value={filtroPestana} onValueChange={handleFiltroPestanaChange}>
                <TabsList>
                  <TabsTrigger value="sinTarjeta">
                    Sin tarjeta del centro ({sociosFiltradosSinTarjeta.length})
                  </TabsTrigger>
                  <TabsTrigger value="conTarjeta">
                    Con tarjeta del centro ({sociosFiltradosConTarjeta.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Loader2 className="absolute inset-0 m-auto h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium">Cargando socios...</p>
                </div>
              ) : socios.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Users className="h-8 w-8" />
                  </div>
                  <p className="font-medium">No se encontraron socios elegibles</p>
                  <p className="text-sm">para el período seleccionado</p>
                </div>
              ) : sociosFiltradosPestana.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Search className="h-8 w-8" />
                  </div>
                  <p className="font-medium">No se encontraron resultados</p>
                  <p className="text-sm">prueba con otros filtros de búsqueda</p>
                  <Button variant="outline" size="sm" onClick={() => { setBusqueda(""); setFiltroEstado("todos"); setFiltroCategoria("todos"); }} className="mt-2">
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div className="hidden md:grid md:grid-cols-[48px_minmax(0,2fr)_minmax(0,90px)_minmax(0,100px)_minmax(0,90px)_minmax(0,90px)] gap-2 px-4 py-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span className="sr-only">Seleccionar</span>
                    <span>Nombre completo</span>
                    <span>DNI</span>
                    <span>Categoría</span>
                    <span className="text-right">Monto</span>
                    <span>Estado</span>
                  </div>

                  <div ref={parentRef} className="h-[500px] overflow-auto">
                    <div
                      style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      {virtualizer.getVirtualItems().map((virtualRow) => {
                        const socio = sociosFiltradosPestana[virtualRow.index];
                        return (
                          <div
                            key={socio.id}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className={cn(
                              "hidden md:grid md:grid-cols-[48px_minmax(0,2fr)_minmax(0,90px)_minmax(0,100px)_minmax(0,90px)_minmax(0,90px)] gap-2 items-center px-4 border-b transition-colors duration-200",
                              socio.cuotaExistente
                                ? "bg-muted/30 opacity-60"
                                : selectedSocioIds.includes(socio.id)
                                  ? "bg-primary/5 hover:bg-primary/10"
                                  : "hover:bg-muted/50"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSocio(socio.id, !selectedSocioIds.includes(socio.id))}
                              disabled={socio.cuotaExistente}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all duration-200",
                                socio.cuotaExistente
                                  ? "border-muted-foreground/20 bg-muted/50 cursor-not-allowed opacity-50"
                                  : selectedSocioIds.includes(socio.id)
                                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-110"
                                    : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10 hover:scale-105 cursor-pointer"
                              )}
                            >
                              {selectedSocioIds.includes(socio.id) && !socio.cuotaExistente && (
                                <CheckCircle className="h-5 w-5" />
                              )}
                            </button>

                            <div className="flex items-center gap-3 font-medium min-w-0">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs font-bold">
                                {socio.nombre.charAt(0)}{socio.apellido.charAt(0)}
                              </div>
                              <span className="truncate">{socio.apellido}, {socio.nombre}</span>
                            </div>

                            <span className="text-muted-foreground font-mono text-sm truncate">
                              {socio.dni ?? "-"}
                            </span>

                            <Badge variant="outline" className="font-normal truncate">
                              {socio.categoriaNombre}
                            </Badge>

                            <span className="text-right font-medium tabular-nums">
                              {formatoMoneda(socio.montoMensual)}
                            </span>

                            <div>
                              {socio.cuotaExistente ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-muted text-muted-foreground gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Ya generada
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1"
                                >
                                  <Zap className="h-3 w-3" />
                                  Disponible
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="md:hidden divide-y">
                    {sociosFiltradosPestana.slice(0, 30).map((socio) => (
                      <div
                        key={socio.id}
                        className={cn(
                          "flex flex-col gap-3 p-4",
                          socio.cuotaExistente && "opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => toggleSocio(socio.id, !selectedSocioIds.includes(socio.id))}
                              disabled={socio.cuotaExistente}
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200",
                                socio.cuotaExistente
                                  ? "border-muted-foreground/20 bg-muted/50 cursor-not-allowed"
                                  : selectedSocioIds.includes(socio.id)
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10 cursor-pointer"
                              )}
                            >
                              {selectedSocioIds.includes(socio.id) && !socio.cuotaExistente && (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{socio.apellido}, {socio.nombre}</p>
                              <p className="text-xs text-muted-foreground">DNI: {socio.dni ?? "-"}</p>
                            </div>
                          </div>
                          {socio.cuotaExistente ? (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground shrink-0">
                              Ya generada
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shrink-0">
                              Disponible
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between pl-11">
                          <Badge variant="outline" className="font-normal">
                            {socio.categoriaNombre}
                          </Badge>
                          <span className="text-sm font-medium tabular-nums">
                            {formatoMoneda(socio.montoMensual)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        {resultado && (
          <Card className="overflow-hidden border-border/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                Resultado de la generación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {/* Cuotas Creadas */}
                <div className="group relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 p-5 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 right-0 h-20 w-20 -translate-y-8 translate-x-8 rounded-full bg-emerald-400/20 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Cuotas creadas</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                      {resultado.creadas}
                    </p>
                  </div>
                </div>

                {/* Omitidas */}
                <div className="group relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 p-5 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 right-0 h-20 w-20 -translate-y-8 translate-x-8 rounded-full bg-blue-400/20 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Omitidas</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                      {resultado.omitidas}
                    </p>
                  </div>
                </div>

                {/* Advertencias Morosidad */}
                <div className="group relative overflow-hidden rounded-xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30 p-5 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 right-0 h-20 w-20 -translate-y-8 translate-x-8 rounded-full bg-amber-400/20 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Advertencias</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                      {resultado.advertenciasMorosidad}
                    </p>
                  </div>
                </div>

                {/* Inhabilitados */}
                <div className="group relative overflow-hidden rounded-xl border border-red-200 dark:border-red-800/50 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 p-5 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-0 right-0 h-20 w-20 -translate-y-8 translate-x-8 rounded-full bg-red-400/20 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
                        <UserX className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Inhabilitados</span>
                    </div>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300 tabular-nums">
                      {resultado.inhabilitados}
                    </p>
                  </div>
                </div>
              </div>

              {resultado.advertencias.length > 0 && (
                <Alert className="mt-6 border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-amber-100/30 dark:from-amber-950/50 dark:to-amber-900/20">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-700 dark:text-amber-400">Advertencias</AlertTitle>
                  <AlertDescription className="text-amber-600 dark:text-amber-500">
                    <ul className="mt-3 space-y-2">
                      {resultado.advertencias.map((advertencia, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800 text-xs font-medium text-amber-700 dark:text-amber-300 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{advertencia}</span>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Botón para descargar talonario después de generar */}
              {resultado.creadas > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => abrirTalonarioHtml(periodo)}
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
                  >
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
