"use client"

// Componente de KPIs del dashboard - muestra métricas financieras del club
// Obtiene datos de la API mediante hooks de TanStack Query

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, DollarSign, Users, FileWarning } from "lucide-react"
import { useReporteCobranza } from "@/hooks/api/cobros/useReporteCobranza"
import { useSocios } from "@/hooks/api/socios/useSocios"
import { formatCurrency } from "@/lib/cuenta-corriente-utils"

export function DashboardStats() {
  // Período actual para el reporte de cobranza (formato YYYY-MM)
  const now = new Date()
  const periodoActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`

  // Obtener datos de la API
  const {
    data: reporteCobranza,
    isLoading: isLoadingReporte,
    isError: isErrorReporte,
  } = useReporteCobranza(periodoActual)

  const {
    total: totalSocios,
    isLoading: isLoadingSocios,
    isError: isErrorSocios,
  } = useSocios()

  const isLoading = isLoadingReporte || isLoadingSocios
  const isError = isErrorReporte || isErrorSocios

  // Valores obtenidos de la API con fallback a 0
  const porcentajeMorosidad = reporteCobranza?.morosidad ?? 0
  const recaudacionMes = reporteCobranza?.totalCobrado ?? 0
  const deudaMes = Math.max(
    (reporteCobranza?.totalGenerado ?? 0) - recaudacionMes,
    0
  )
  const cuotasPendientes = reporteCobranza?.cuotasPendientes ?? 0
  const cuotasPagadas = reporteCobranza?.cuotasPagadas ?? 0
  const porcentajeCobranza = reporteCobranza?.porcentajeCobranza ?? 0

  // Definición de los 4 KPIs principales
  const stats = [
    {
      title: "Morosidad Total",
      value: formatCurrency(deudaMes),
      description: `${cuotasPendientes} cuotas impagas (${porcentajeMorosidad.toFixed(1)}%)`,
      icon: AlertTriangle,
      // Morosidad se destaca con color de alerta
      trend: "danger" as const,
      highlight: true,
    },
    {
      title: "Recaudación del Mes",
      value: formatCurrency(recaudacionMes),
      description: `${porcentajeCobranza.toFixed(1)}% de cobranza`,
      icon: DollarSign,
      trend: "up" as const,
      highlight: false,
    },
    {
      title: "Socios Registrados",
      value: totalSocios.toString(),
      description: "Total en el sistema",
      icon: Users,
      trend: "neutral" as const,
      highlight: false,
    },
    {
      title: "Cuotas Pendientes",
      value: cuotasPendientes.toString(),
      description: `${cuotasPagadas} cuotas pagadas este mes`,
      icon: FileWarning,
      trend: cuotasPendientes > 0 ? ("warning" as const) : ("up" as const),
      highlight: false,
    },
  ]

  // Estado de carga
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse border-border/80 shadow-[var(--shadow-soft)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-20 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Estado de error
  if (isError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-full border-destructive/50 shadow-[var(--shadow-soft)]">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Error al cargar las estadísticas. Intente recargar la página.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={`shadow-sm transition-colors ${
            stat.highlight
              ? "border-destructive/30 bg-destructive/2 shadow-[var(--shadow-soft)]"
              : "border-border/80 shadow-[var(--shadow-soft)]"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon
              className={`h-4 w-4 ${
                stat.highlight ? "text-destructive" : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-medium ${
                stat.highlight ? "text-destructive" : "text-foreground"
              }`}
            >
              {stat.value}
            </div>
            <p
              className={`text-xs mt-1 ${
                stat.trend === "danger"
                  ? "text-destructive"
                  : stat.trend === "warning"
                    ? "text-amber-600"
                    : stat.trend === "up"
                      ? "text-primary"
                      : "text-muted-foreground"
              }`}
            >
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
