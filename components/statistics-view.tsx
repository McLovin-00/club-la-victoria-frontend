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

  // Paginación para la tabla de registros
  const pagination = usePagination({
    totalItems: statistics?.registros.length || 0,
    initialPageSize: PAGINACION.TAMAÑO_PAGINA_POR_DEFECTO,
  });

  // Calcular índices para mostrar registros paginados
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, statistics?.registros.length || 0);

  // Registros paginados
  const paginatedRegistros = useMemo(() => {
    if (!statistics?.registros) return [];
    return statistics.registros.slice(startIndex, endIndex);
  }, [statistics?.registros, startIndex, endIndex]);

  // Resetear página cuando cambia la fecha
  const handleDateChange = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    setCalendarKey(Date.now()); // Forzar re-render del calendario
    pagination.setCurrentPage(1);
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
            title="Total Ingresos del Día"
            value={statistics.totalIngresos.toString()}
            description="Cantidad de personas"
            icon={TrendingUp}
          />
          <StatCard
            title="Ingresos a Pileta"
            value={statistics.totalIngresosPileta.toString()}
            description="Con acceso a pileta"
            icon={Waves}
          />
          <StatCard
            title="Ingresos al Club"
            value={statistics.totalIngresosClub.toString()}
            description="Solo acceso al club"
            icon={Home}
          />
          <StatCard
            title="Socios / No Socios"
            value={`${statistics.totalSocios} / ${statistics.totalNoSocios}`}
            description="Distribución de ingresos"
            icon={Users}
          />
        </div>
      ) : null}

      {/* Tabla de registros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registros de Ingresos del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Cargando registros de ingresos...</span>
            </div>
          ) : statistics?.registros.length ? (
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
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {registro.socio ? registro.socio.dni : registro.dniNoSocio}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              registro.tipoIngreso === "NO_SOCIO"
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
                              className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                registro.metodoPago === "EFECTIVO"
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros de ingresos para la fecha seleccionada</p>
            </div>
          )}

          {/* Controles de paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {endIndex} de {pagination.totalItems} registros
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.goToPreviousPage}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.goToNextPage}
                  disabled={!pagination.hasNextPage}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
