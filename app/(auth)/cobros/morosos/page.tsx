"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useMorososDetallados, SeveridadMoroso } from "@/hooks/api/cobros/useMorososDetallados"
import { MorososStats, MorososFilters, MorososTable } from "@/components/morosos"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"

export default function MorososPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize from URL params
  const [severidad, setSeveridad] = useState<SeveridadMoroso>(
    (searchParams.get("severidad") as SeveridadMoroso) || "todos"
  )
  const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") || "")

  const { data, isLoading, isError, error, refetch } = useMorososDetallados({
    severidad: severidad === "todos" ? undefined : severidad,
    busqueda: busqueda || undefined,
    limit: 100,
  })

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
        {data && data.totalPages > 1 && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {data.morosos.length} de {data.total} morosos - Pagina {data.page} de {data.totalPages}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
