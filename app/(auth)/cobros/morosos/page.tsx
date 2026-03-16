"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useMorososDetallados, SeveridadMoroso } from "@/hooks/api/cobros/useMorososDetallados"
import { MorososStats, MorososFilters, MorososTable } from "@/components/morosos"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { PAGINACION } from "@/lib/constants"

export default function MorososPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize from URL params
  const [severidad, setSeveridad] = useState<SeveridadMoroso>(
    (searchParams.get("severidad") as SeveridadMoroso) || "todos"
  )
  const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") || "")
  const [limit, setLimit] = useState<number>(PAGINACION.TAMAÑO_PAGINA_POR_DEFECTO)

  const { data, isLoading, isError, error, refetch } = useMorososDetallados({
    severidad: severidad === "todos" ? undefined : severidad,
    busqueda: busqueda || undefined,
    limit,
  })

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (severidad !== "todos") params.set("severidad", severidad)
    if (busqueda) params.set("busqueda", busqueda)

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [severidad, busqueda, router])

  const handleSeveridadChange = (value: SeveridadMoroso) => {
    setSeveridad(value)
  }

  const handleBusquedaChange = (value: string) => {
    setBusqueda(value)
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Socios Morosos" description="Lista detallada de socios con cuotas pendientes">
        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">
                Cargando morosos...
              </span>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout title="Socios Morosos" description="Lista detallada de socios con cuotas pendientes">
        <div className="space-y-6">
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
              <p className="text-destructive font-medium mb-2">
                Error al cargar los morosos
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "Error desconocido"}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Socios Morosos" description="Lista detallada de socios con 3 o mas cuotas pendientes">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Socios morosos</h1>
          <p className="page-description">
            Lista detallada de socios con 3 o más cuotas pendientes.
          </p>
        </div>

        {/* Stats */}
        {data?.estadisticas && <MorososStats estadisticas={data.estadisticas} />}

        {/* Filters */}
        <MorososFilters
          severidad={severidad}
          busqueda={busqueda}
          onSeveridadChange={handleSeveridadChange}
          onBusquedaChange={handleBusquedaChange}
        />

        {/* Table */}
        {data?.morosos && <MorososTable morosos={data.morosos} />}

        {/* Pagination info */}
        {data && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Mostrar</span>
              <select
                className="h-8 px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
              >
                {PAGINACION.OPCIONES_TAMAÑO_PAGINA.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>de {data.total} morosos</span>
            </div>
            {data.totalPages > 1 && (
              <div>
                Página {data.page} de {data.totalPages}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
