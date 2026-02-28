// Hook personalizado para identificar y filtrar socios con 3+ meses de cuota impaga.
// Consume los datos de estado de pagos anual y calcula morosidad por socio.

import { useMemo } from "react"
import { useEstadoPagos, type SocioPagosAnual } from "./useEstadoPagos"

/** Representa un socio con morosidad (3+ meses de cuota impaga) */
export interface Moroso {
  socioId: number
  nombre: string
  apellido: string
  /** Cantidad de meses con cuota pendiente */
  mesesDeuda: number
  /** Monto total estimado adeudado (basado en cantidad de meses pendientes) */
  montoTotal: number
}

/** Umbral mínimo de meses impagos para considerar a un socio como moroso */
const UMBRAL_MESES_MOROSO = 3

/**
 * Determina cuántos meses tiene un socio sin pagar según su registro de pagos anual.
 * Los meses con valor null o distinto de un estado pagado se consideran pendientes.
 */
function calcularMesesPendientes(meses: Record<string, string | null>): number {
  return Object.values(meses).filter(
    (estado) => estado === null || estado === "PENDIENTE"
  ).length
}

/**
 * useMorosos - Obtiene la lista de socios con 3+ meses de cuota impaga.
 *
 * Consume useEstadoPagos con un límite alto para obtener todos los socios,
 * filtra los que tienen >= UMBRAL_MESES_MOROSO meses pendientes,
 * y los ordena alfabéticamente por nombre completo (apellido + nombre).
 *
 * @param montoMensualEstimado - Monto estimado por cuota mensual para calcular deuda total (por defecto 1000)
 */
export const useMorosos = (montoMensualEstimado: number = 1000) => {
  const currentYear = new Date().getFullYear()

  // Obtenemos todos los socios con su estado de pagos anual
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useEstadoPagos({
    anio: currentYear,
    page: 1,
    limit: 1000, // Límite alto para obtener todos los socios
  })

  // Filtramos y transformamos los socios morosos
  const morosos = useMemo<Moroso[]>(() => {
    if (!data?.socios) return []

    return data.socios
      .map((socio: SocioPagosAnual) => {
        const mesesDeuda = calcularMesesPendientes(socio.meses)
        return {
          socioId: socio.socioId,
          nombre: socio.nombre,
          apellido: socio.apellido,
          mesesDeuda,
          montoTotal: mesesDeuda * montoMensualEstimado,
        }
      })
      // Solo socios con 3+ meses de morosidad
      .filter((socio) => socio.mesesDeuda >= UMBRAL_MESES_MOROSO)
      // Ordenar alfabéticamente por apellido y luego por nombre
      .sort((a, b) => {
        const nombreCompletoA = `${a.apellido} ${a.nombre}`.toLowerCase()
        const nombreCompletoB = `${b.apellido} ${b.nombre}`.toLowerCase()
        return nombreCompletoA.localeCompare(nombreCompletoB)
      })
  }, [data?.socios, montoMensualEstimado])

  return {
    morosos,
    totalMorosos: morosos.length,
    isLoading,
    isError,
    error,
    refetch,
  }
}
