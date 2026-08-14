"use client"
import React from "react";

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import { MorosoDetallado } from "@/hooks/api/cobros/useMorososDetallados"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, Phone, Mail, Calendar } from "lucide-react"

interface MorososTableProps {
  morosos: MorosoDetallado[]
  excludedSocioIds: Set<number>
  onExcludedChange: (next: Set<number>) => void
}

const ROW_HEIGHT = 80
const CURRENCY_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function getSeveridadBadge(mesesDeuda: number) {
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

function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

export const MorososTable = React.memo(function MorososTable({
  morosos,
  excludedSocioIds,
  onExcludedChange,
}: MorososTableProps) {
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)
  const allSelected = morosos.length > 0 && excludedSocioIds.size === 0
  const someSelected = morosos.some((moroso) => !excludedSocioIds.has(moroso.socioId)) && !allSelected

  const virtualizer = useVirtualizer({
    count: morosos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  const handleVerCuenta = (socioId: number) => {
    router.push(`/socios/${socioId}/cuenta-corriente`)
  }

  const toggleMoroso = (socioId: number, checked: boolean) => {
    const next = new Set(excludedSocioIds)
    if (checked) {
      next.delete(socioId)
    } else {
      next.add(socioId)
    }
    onExcludedChange(next)
  }

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onExcludedChange(new Set())
      return
    }

    onExcludedChange(new Set(morosos.map((moroso) => moroso.socioId)))
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
        <div className="grid grid-cols-[48px_minmax(0,2fr)_minmax(0,80px)_minmax(0,100px)_minmax(0,110px)_minmax(0,120px)_minmax(0,80px)] gap-3 px-4 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center justify-center normal-case">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={(checked) => toggleAll(checked === true)}
              aria-label="Seleccionar todos los morosos"
            />
          </div>
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
                  className="grid grid-cols-[48px_minmax(0,2fr)_minmax(0,80px)_minmax(0,100px)_minmax(0,110px)_minmax(0,120px)_minmax(0,80px)] gap-3 items-center px-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-center">
                    <Checkbox
                      checked={!excludedSocioIds.has(moroso.socioId)}
                      onCheckedChange={(checked) => toggleMoroso(moroso.socioId, checked === true)}
                      aria-label={`Incluir a ${moroso.apellido}, ${moroso.nombre}`}
                    />
                  </div>

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

                  <div className="text-center">
                    <Badge
                      variant={moroso.estado === "ACTIVO" ? "default" : "secondary"}
                      className={moroso.estado === "ACTIVO" ? "bg-green-500" : ""}
                    >
                      {moroso.estado}
                    </Badge>
                  </div>

                  <div className="text-center">
                    {getSeveridadBadge(moroso.mesesDeuda)}
                  </div>

                  <div className="text-center font-semibold text-foreground">
                    {formatCurrency(moroso.montoTotalDeuda)}
                  </div>

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
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Checkbox
                    checked={!excludedSocioIds.has(moroso.socioId)}
                    onCheckedChange={(checked) => toggleMoroso(moroso.socioId, checked === true)}
                    aria-label={`Incluir a ${moroso.apellido}, ${moroso.nombre}`}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {moroso.apellido}, {moroso.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      DNI: {moroso.dni}
                    </p>
                  </div>
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
