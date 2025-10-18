"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCheck, X } from "lucide-react"
import { Socio, Temporada, Asociacion } from "@/lib/types"
import { ESTADO_SOCIO, ESTADO_ASOCIACION, MENSAJES_ERROR } from "@/lib/constants"
import { formatDateNumeric, isDatePast } from "@/lib/utils/date"

interface AssociationFormProps {
  socios: Socio[]
  temporadas: Temporada[]
  asociacionesExistentes: Asociacion[]
  onSubmit: (asociacion: { idSocio: string; idTemporada: string }) => void
  onCancel: () => void
}

export function AssociationForm({ socios, temporadas, asociacionesExistentes, onSubmit, onCancel }: AssociationFormProps) {
  const [socioSeleccionado, setSocioSeleccionado] = useState("")
  const [temporadaSeleccionada, setTemporadaSeleccionada] = useState("")
  const [errores, setErrores] = useState<Record<string, string>>({})

  // Filter active socios and available temporadas (current and future)
  const sociosActivos = socios.filter((socio) => socio.estado === ESTADO_SOCIO.ACTIVO)
  const temporadasDisponibles = temporadas.filter((temporada) => {
    // Solo mostrar temporadas que no hayan finalizado (fechaFin no es pasado)
    return !isDatePast(temporada.fechaFin)
  })

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {}

    if (!socioSeleccionado) {
      nuevosErrores.socio = MENSAJES_ERROR.CAMPO_REQUERIDO
    }

    if (!temporadaSeleccionada) {
      nuevosErrores.temporada = MENSAJES_ERROR.CAMPO_REQUERIDO
    }

    if (socioSeleccionado && temporadaSeleccionada) {
      // Check if association already exists
      const asociacionExistente = asociacionesExistentes.find(
        (asoc) => asoc.idSocio === socioSeleccionado && asoc.idTemporada === temporadaSeleccionada && asoc.estado === ESTADO_ASOCIACION.ACTIVA,
      )

      if (asociacionExistente) {
        nuevosErrores.general = "Esta asociación ya existe"
      }
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validarFormulario()) {
      onSubmit({
        idSocio: socioSeleccionado,
        idTemporada: temporadaSeleccionada,
      })
    }
  }

  const handleCambioSocio = (value: string) => {
    setSocioSeleccionado(value)
    if (errores.socio || errores.general) {
      setErrores((prev) => ({ ...prev, socio: "", general: "" }))
    }
  }

  const handleCambioTemporada = (value: string) => {
    setTemporadaSeleccionada(value)
    if (errores.temporada || errores.general) {
      setErrores((prev) => ({ ...prev, temporada: "", general: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errores.general && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{errores.general}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="socio" className="text-foreground">
          Seleccionar Socio *
        </Label>
        <Select value={socioSeleccionado} onValueChange={handleCambioSocio}>
          <SelectTrigger
            className={`rounded-lg ${errores.socio ? "border-destructive" : "border-border"} focus:ring-primary focus:border-primary`}
          >
            <SelectValue placeholder="Seleccione un socio..." />
          </SelectTrigger>
          <SelectContent>
            {sociosActivos.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No hay socios activos disponibles</div>
            ) : (
              sociosActivos
                .filter((socio) => socio.id)
                .map((socio) => (
                  <SelectItem key={socio.id} value={socio.id as string}>
                    <div className="flex flex-col">
                      <span className="font-medium">{socio.nombre} {socio.apellido}</span>
                      <span className="text-xs text-muted-foreground">DNI: {socio.dni}</span>
                    </div>
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
        {errores.socio && <p className="text-sm text-destructive">{errores.socio}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="temporada" className="text-foreground">
          Seleccionar Temporada *
        </Label>
        <Select value={temporadaSeleccionada} onValueChange={handleCambioTemporada}>
          <SelectTrigger
            className={`rounded-lg ${errores.temporada ? "border-destructive" : "border-border"} focus:ring-primary focus:border-primary`}
          >
            <SelectValue placeholder="Seleccione una temporada..." />
          </SelectTrigger>
          <SelectContent>
            {temporadasDisponibles.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No hay temporadas disponibles</div>
            ) : (
              temporadasDisponibles
                .filter((temporada) => temporada.id)
                .map((temporada) => (
                  <SelectItem key={temporada.id} value={temporada.id as string}>
                    <div className="flex flex-col">
                      <span className="font-medium">{temporada.nombre}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateNumeric(temporada.fechaInicio)} - {formatDateNumeric(temporada.fechaFin)}
                      </span>
                    </div>
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
        {errores.temporada && <p className="text-sm text-destructive">{errores.temporada}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
          disabled={sociosActivos.length === 0 || temporadasDisponibles.length === 0}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Asociar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 rounded-lg border-border hover:bg-muted bg-transparent"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  )
}
