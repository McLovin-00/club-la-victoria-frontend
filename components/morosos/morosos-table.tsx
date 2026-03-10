"use client"
import React from "react";

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import { MorosoDetallado } from "@/hooks/api/cobros/useMorososDetallados"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Phone, Mail, Calendar } from "lucide-react"

interface MorososTableProps {
  morosos: MorosoDetallado[]
}

const ROW_HEIGHT = 80

export const MorososTable = React.memo(function MorososTable({ morosos }: MorososTableProps) {
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: morosos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  const handleVerCuenta = (socioId: number) => {
    router.push(`/socios/${socioId}/cuenta-corriente`)
  }

  const getSeveridadBadge = (mesesDeuda: number) => {
    if (mesesDeuda >= 4) {
      return (
        <Badge variant="destructive" className="text-xs">
          {mesesDeuda} meses
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-yellow-500 text-black text-xs">
        {mesesDeuda} meses
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (morosos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            No hay morosos
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Todos los socios estan al dia con sus cuotas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-card">
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,80px)_minmax(0,100px)_minmax(0,110px)_minmax(0,120px)_minmax(0,80px)] gap-3 px-4 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Socio</span>
          <span className="text-center">Estado</span>
          <span className="text-center">Severidad</span>
          <span className="text-center">Monto Deuda</span>
          <span className="text-center">Periodos</span>
          <span className="text-right">Accion</span>
        </div>

        {/* Virtualized Body */}
        <div ref={parentRef} className="max-h-[500px] overflow-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const moroso = morosos[virtualRow.index]
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
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,80px)_minmax(0,100px)_minmax(0,110px)_minmax(0,120px)_minmax(0,80px)] gap-3 items-center px-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  {/* Socio */}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {moroso.apellido}, {moroso.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      DNI: {moroso.dni}
                      {moroso.telefono && (
                        <span className="ml-2">
                          <Phone className="h-3 w-3 inline mr-1" />
                          {moroso.telefono}
                        </span>
                      )}
                      {moroso.email && (
                        <span className="ml-2">
                          <Mail className="h-3 w-3 inline mr-1" />
                          {moroso.email}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Estado */}
                  <div className="text-center">
                    <Badge
                      variant={moroso.estado === "ACTIVO" ? "default" : "secondary"}
                      className={moroso.estado === "ACTIVO" ? "bg-green-500" : ""}
                    >
                      {moroso.estado}
                    </Badge>
                  </div>

                  {/* Severidad */}
                  <div className="text-center">
                    {getSeveridadBadge(moroso.mesesDeuda)}
                  </div>

                  {/* Monto Deuda */}
                  <div className="text-center font-semibold text-foreground">
                    {formatCurrency(moroso.montoTotalDeuda)}
                  </div>

                  {/* Periodos */}
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">
                      {moroso.periodosAdeudados.slice(0, 3).join(", ")}
                      {moroso.periodosAdeudados.length > 3 && (
                        <span className="ml-1">
                          +{moroso.periodosAdeudados.length - 3} mas
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Accion */}
                  <div className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerCuenta(moroso.socioId)}
                      className="text-xs gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver cuenta
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {morosos.slice(0, 20).map((moroso) => (
          <Card key={moroso.socioId}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-foreground">
                    {moroso.apellido}, {moroso.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    DNI: {moroso.dni}
                  </p>
                </div>
                {getSeveridadBadge(moroso.mesesDeuda)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Deuda:</span>
                  <span className="ml-1 font-semibold">
                    {formatCurrency(moroso.montoTotalDeuda)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="ml-1">{moroso.categoria.nombre}</span>
                </div>
              </div>

              {moroso.telefono && (
                <p className="text-xs text-muted-foreground mb-1">
                  <Phone className="h-3 w-3 inline mr-1" />
                  {moroso.telefono}
                </p>
              )}

              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  {moroso.periodosAdeudados.length} periodos adeudados
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
});
