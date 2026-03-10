// Componente de lista virtualizada de socios morosos.
// Muestra socios con 3+ meses de cuota impaga, con navegación a cuenta corriente.

"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useMorosos, type Moroso } from "@/hooks/api/cobros/useMorosos"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, ExternalLink, CheckCircle2 } from "lucide-react"

/** Altura estimada de cada fila para la virtualización */
const ROW_HEIGHT = 64

/**
 * MorososList - Lista virtualizada de socios en morosidad.
 *
 * Características:
 * - Virtualización con @tanstack/react-virtual para alto rendimiento
 * - Badge de color según severidad (rojo > 6 meses, amarillo 3-6 meses)
 * - Click en socio navega a su cuenta corriente
 * - Mensaje informativo si no hay morosos
 * - Manejo de estados de carga y error
 */
export function MorososList() {
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)

  const { morosos, totalMorosos, isLoading, isError, error } = useMorosos()

  // Virtualización para listas largas
  const virtualizer = useVirtualizer({
    count: morosos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  /**
   * Navega a la cuenta corriente del socio seleccionado.
   */
  const handleVerCuenta = (socioId: number) => {
    router.push(`/socios/${socioId}/cuenta-corriente`)
  }

  /**
   * Retorna la variante de badge según la cantidad de meses de deuda.
   * Rojo (destructive) para > 6 meses, amarillo (outline) para 3-6 meses.
   */
  const getBadgeVariant = (mesesDeuda: number): "destructive" | "outline" | "secondary" => {
    if (mesesDeuda > 6) return "destructive"
    if (mesesDeuda >= 3) return "secondary"
    return "outline"
  }

  // Estado de carga
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando morosos...</span>
        </CardContent>
      </Card>
    )
  }

  // Estado de error
  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex items-center gap-2 py-6">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">
            Error al cargar morosos: {error instanceof Error ? error.message : "Error desconocido"}
          </span>
        </CardContent>
      </Card>
    )
  }

  // Estado vacío - no hay morosos (situación positiva)
  if (totalMorosos === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-8">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-medium text-foreground">Sin morosos</p>
            <p className="text-sm text-muted-foreground">
              Todos los socios están al día con sus cuotas. ¡Excelente!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Lista de Morosos
          </CardTitle>
          <Badge variant="destructive" className="text-xs">
            {totalMorosos} {totalMorosos === 1 ? "socio" : "socios"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Encabezado de la tabla */}
        <div className="hidden md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,100px)_minmax(0,110px)_minmax(0,90px)] gap-3 px-6 py-2 border-b bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Socio</span>
          <span className="text-center">Meses deuda</span>
          <span className="text-center">Monto deuda</span>
          <span className="text-right">Acción</span>
        </div>

        {/* Lista virtualizada - Desktop */}
        <div
          ref={parentRef}
          className="hidden md:block max-h-[400px] overflow-auto"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const moroso: Moroso = morosos[virtualRow.index]
              return (
                <div
                  key={moroso.socioId}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="hidden md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,100px)_minmax(0,110px)_minmax(0,90px)] gap-3 items-center px-6 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  {/* Nombre completo del socio */}
                  <div className="truncate">
                    <span className="font-medium text-foreground">
                      {moroso.apellido}, {moroso.nombre}
                    </span>
                  </div>

                  {/* Meses de deuda con badge de severidad */}
                  <div className="text-center">
                    <Badge variant={getBadgeVariant(moroso.mesesDeuda)}>
                      {moroso.mesesDeuda} {moroso.mesesDeuda === 1 ? "mes" : "meses"}
                    </Badge>
                  </div>

                  {/* Monto total adeudado */}
                  <div className="text-center">
                    <span className="text-sm font-medium text-foreground">
                      ${moroso.montoTotal.toLocaleString("es-AR")}
                    </span>
                  </div>

                  {/* Botón para ver cuenta corriente */}
                  <div className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerCuenta(moroso.socioId)}
                      className="text-xs gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="hidden md:inline">Ver cuenta</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden divide-y">
          {morosos.slice(0, 20).map((moroso) => (
            <div
              key={moroso.socioId}
              className="flex flex-col gap-2 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">
                    {moroso.apellido}, {moroso.nombre}
                  </p>
                </div>
                <Badge variant={getBadgeVariant(moroso.mesesDeuda)}>
                  {moroso.mesesDeuda} {moroso.mesesDeuda === 1 ? "mes" : "meses"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Deuda: <span className="font-medium text-foreground">${moroso.montoTotal.toLocaleString("es-AR")}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerCuenta(moroso.socioId)}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver cuenta
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
