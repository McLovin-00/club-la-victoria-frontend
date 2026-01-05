"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
  Users,
  Waves,
  Home,
  Calendar as CalendarIcon,
  RefreshCw,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { useDailyStats } from "@/hooks/use-daily-stats";
import { usePagination } from "@/hooks/use-pagination";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PAGINACION } from "@/lib/constants";
import { mostrarHorarioHHMM } from "@/util/mostrar-horario.util";
import { formatDateToISO } from "@/lib/utils/date";

/**
 * Componente principal de visualización de estadísticas diarias de ingresos de socios y no socios.
 * Permite filtrar por fecha, refrescar y muestra un resumen junto a la tabla con los registros del día.
 */
export function StatisticsView() {
  const initialDate = new Date();
  const [calendarKey, setCalendarKey] = useState<number>(Date.now());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);

  // Estados para filtros
  const [filtroTipoIngreso, setFiltroTipoIngreso] = useState<string>("TODOS");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState<string>("TODOS");
  const [filtroPileta, setFiltroPileta] = useState<string>("TODOS");

  const {
    data: statistics,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useDailyStats(selectedDate ? formatDateToISO(selectedDate) : formatDateToISO(new Date()));

  const handleRefresh = () => {
    refetch();
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = filtroTipoIngreso !== "TODOS" || filtroMetodoPago !== "TODOS" || filtroPileta !== "TODOS";

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroTipoIngreso("TODOS");
    setFiltroMetodoPago("TODOS");
    setFiltroPileta("TODOS");
  };

  // Registros filtrados según los filtros seleccionados
  const registrosFiltrados = useMemo(() => {
    if (!statistics?.registros) return [];

    return statistics.registros.filter((registro) => {
      // Filtro por tipo de ingreso
      if (filtroTipoIngreso !== "TODOS") {
        if (filtroTipoIngreso === "SOCIOS") {
          if (registro.tipoIngreso === "NO_SOCIO") return false;
        } else if (filtroTipoIngreso === "NO_SOCIOS") {
          if (registro.tipoIngreso !== "NO_SOCIO") return false;
        } else if (registro.tipoIngreso !== filtroTipoIngreso) {
          return false;
        }
      }

      // Filtro por método de pago
      if (filtroMetodoPago !== "TODOS") {
        if (registro.metodoPago !== filtroMetodoPago) return false;
      }

      // Filtro por pileta
      if (filtroPileta !== "TODOS") {
        const habilitaPileta = filtroPileta === "SI";
        if (registro.habilitaPileta !== habilitaPileta) return false;
      }

      return true;
    });
  }, [statistics?.registros, filtroTipoIngreso, filtroMetodoPago, filtroPileta]);

  // Estadísticas recalculadas según filtros
  const statisticsFiltradas = useMemo(() => {
    const registros = registrosFiltrados;
    const totalIngresos = registros.length;
    const totalIngresosPileta = registros.filter((r) => r.habilitaPileta).length;
    const totalIngresosClub = totalIngresos - totalIngresosPileta;
    const totalSocios = registros.filter(
      (r) => r.tipoIngreso === "SOCIO_CLUB" || r.tipoIngreso === "SOCIO_PILETA"
    ).length;
    const totalNoSocios = totalIngresos - totalSocios;

    return { totalIngresos, totalIngresosPileta, totalIngresosClub, totalSocios, totalNoSocios };
  }, [registrosFiltrados]);

  // Paginación para la tabla de registros (usando registros filtrados)
  const pagination = usePagination({
    totalItems: registrosFiltrados.length,
    initialPageSize: PAGINACION.TAMAÑO_PAGINA_POR_DEFECTO,
  });

  // Calcular índices para mostrar registros paginados
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, registrosFiltrados.length);

  // Registros paginados (usando registros filtrados)
  const paginatedRegistros = useMemo(() => {
    return registrosFiltrados.slice(startIndex, endIndex);
  }, [registrosFiltrados, startIndex, endIndex]);

  // Resetear página y filtros cuando cambia la fecha
  const handleDateChange = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    setCalendarKey(Date.now()); // Forzar re-render del calendario
    pagination.setCurrentPage(1);
    limpiarFiltros();
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">Error al cargar las estadísticas</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 ">
      {/* Header con selector de fecha */}
      <div className="flex justify-between items-center">
        <div className="flex w-full justify-between sm:flex-row flex-col gap-2">
          <h1 className="text-3xl font-bold">Estadísticas de Ingresos</h1>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: es })
                  ) : (
                    <span>Seleccione una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  key={calendarKey}
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  autoFocus
                  locale={es}
                  required={false}
                />
              </PopoverContent>
            </Popover>

            <Button onClick={handleRefresh} disabled={isLoading || isRefetching} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas resumen */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-32" />
                    <div className="h-8 bg-muted animate-pulse rounded w-16" />
                    <div className="h-3 bg-muted animate-pulse rounded w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statistics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={hayFiltrosActivos ? "Total Filtrado" : "Total Ingresos del Día"}
            value={statisticsFiltradas.totalIngresos.toString()}
            description={hayFiltrosActivos ? "Según filtros aplicados" : "Cantidad de personas"}
            icon={TrendingUp}
          />
          <StatCard
            title="Ingresos a Pileta"
            value={statisticsFiltradas.totalIngresosPileta.toString()}
            description="Con acceso a pileta"
            icon={Waves}
          />
          <StatCard
            title="Ingresos al Club"
            value={statisticsFiltradas.totalIngresosClub.toString()}
            description="Solo acceso al club"
            icon={Home}
          />
          <StatCard
            title="Socios / No Socios"
            value={`${statisticsFiltradas.totalSocios} / ${statisticsFiltradas.totalNoSocios}`}
            description="Distribución de ingresos"
            icon={Users}
          />
        </div>
      ) : null}

      {/* Tabla de registros */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registros de Ingresos del Día
            </CardTitle>

            {/* Filtros - Diseño moderno */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-primary">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <Filter className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">Filtrar por:</span>
                </div>

                {/* Filtro por tipo de ingreso */}
                <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border shadow-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <select
                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer pr-2"
                    value={filtroTipoIngreso}
                    onChange={(e) => {
                      setFiltroTipoIngreso(e.target.value);
                      pagination.setCurrentPage(1);
                    }}
                  >
                    <option value="TODOS">Todos los tipos</option>
                    <option value="SOCIOS">Solo Socios</option>
                    <option value="NO_SOCIOS">Solo No Socios</option>
                    <option value="SOCIO_CLUB">Socio Club</option>
                    <option value="SOCIO_PILETA">Socio Pileta</option>
                  </select>
                </div>

                {/* Filtro por método de pago */}
                <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border shadow-sm">
                  <span className="text-muted-foreground">$</span>
                  <select
                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer pr-2"
                    value={filtroMetodoPago}
                    onChange={(e) => {
                      setFiltroMetodoPago(e.target.value);
                      pagination.setCurrentPage(1);
                    }}
                  >
                    <option value="TODOS">Todos los pagos</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>

                {/* Filtro por pileta */}
                <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border shadow-sm">
                  <Waves className="h-4 w-4 text-muted-foreground" />
                  <select
                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer pr-2"
                    value={filtroPileta}
                    onChange={(e) => {
                      setFiltroPileta(e.target.value);
                      pagination.setCurrentPage(1);
                    }}
                  >
                    <option value="TODOS">Pileta: Todos</option>
                    <option value="SI">Con pileta</option>
                    <option value="NO">Sin pileta</option>
                  </select>
                </div>

                {/* Botón limpiar filtros */}
                {hayFiltrosActivos && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      limpiarFiltros();
                      pagination.setCurrentPage(1);
                    }}
                    className="bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Indicador de resultados filtrados */}
              {hayFiltrosActivos && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    Mostrando <span className="font-semibold text-foreground">{registrosFiltrados.length}</span> de{" "}
                    <span className="font-semibold text-foreground">{statistics?.registros.length || 0}</span> registros
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Cargando registros de ingresos...</span>
            </div>
          ) : paginatedRegistros.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Hora</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Dni</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Tipo de Ingreso</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Pileta</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Método de pago</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRegistros.map((registro) => (
                      <tr key={registro.idIngreso} className="border-t">
                        <td className="px-4 py-3 text-sm">
                          {mostrarHorarioHHMM(registro.fechaHoraIngreso)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {registro.socio
                            ? `${registro.socio.apellido}, ${registro.socio.nombre}`
                            : registro.apellidoNoSocio && registro.nombreNoSocio
                              ? `${registro.apellidoNoSocio}, ${registro.nombreNoSocio}`
                              : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {registro.socio ? registro.socio.dni : registro.dniNoSocio}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${registro.tipoIngreso === "NO_SOCIO"
                              ? "bg-red-100 text-red-800"
                              : registro.tipoIngreso === "SOCIO_CLUB"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                              }`}
                          >
                            {registro.tipoIngreso === "NO_SOCIO"
                              ? "No Socio"
                              : registro.tipoIngreso === "SOCIO_CLUB"
                                ? "Socio Club"
                                : "Socio Pileta"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {registro.habilitaPileta ? (
                            <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Sí
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {registro.metodoPago ? (
                            <span
                              className={`inline-flex px-2 py-1 text-xs rounded-full ${registro.metodoPago === "EFECTIVO"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-purple-100 text-purple-800"
                                }`}
                            >
                              {registro.metodoPago}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {registro.importe != null && registro.importe !== undefined ? (
                            `$${registro.importe}`
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : hayFiltrosActivos ? (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros que coincidan con los filtros aplicados</p>
              <Button
                variant="link"
                onClick={() => {
                  limpiarFiltros();
                  pagination.setCurrentPage(1);
                }}
                className="mt-2"
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros de ingresos para la fecha seleccionada</p>
            </div>
          )}

          {/* Controles de paginación */}
          {registrosFiltrados.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-border gap-4">
              {/* Selector de registros por página */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar</span>
                <select
                  className="h-8 px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={pagination.pageSize}
                  onChange={(e) => pagination.changePageSize(Number(e.target.value))}
                >
                  {PAGINACION.OPCIONES_TAMAÑO_PAGINA.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-muted-foreground">
                  de {pagination.totalItems} registros
                </span>
              </div>

              {/* Navegación de páginas */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* Botón Primera página */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pagination.goToPage(1)}
                    disabled={pagination.currentPage === 1}
                    className="px-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-2" />
                  </Button>

                  {/* Botón Anterior */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={pagination.goToPreviousPage}
                    disabled={!pagination.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Botones de páginas */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages: (number | string)[] = [];
                      const current = pagination.currentPage;
                      const total = pagination.totalPages;

                      // Siempre mostrar primera página
                      pages.push(1);

                      // Mostrar "..." si hay gap
                      if (current > 3) {
                        pages.push("...");
                      }

                      // Páginas alrededor de la actual
                      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                        if (!pages.includes(i)) {
                          pages.push(i);
                        }
                      }

                      // Mostrar "..." si hay gap
                      if (current < total - 2) {
                        pages.push("...");
                      }

                      // Siempre mostrar última página
                      if (total > 1 && !pages.includes(total)) {
                        pages.push(total);
                      }

                      return pages.map((page, idx) =>
                        typeof page === "number" ? (
                          <Button
                            key={page}
                            variant={page === current ? "default" : "outline"}
                            size="sm"
                            onClick={() => pagination.goToPage(page)}
                            className="min-w-[32px]"
                          >
                            {page}
                          </Button>
                        ) : (
                          <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                            {page}
                          </span>
                        )
                      );
                    })()}
                  </div>

                  {/* Botón Siguiente */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={pagination.goToNextPage}
                    disabled={!pagination.hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Botón Última página */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pagination.goToPage(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 -ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
