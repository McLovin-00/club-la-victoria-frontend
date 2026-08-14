"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Printer } from "lucide-react"

import { MorosoDetallado } from "@/hooks/api/cobros/useMorososDetallados"
import { useImprimirRecibosMorosos } from "@/hooks/api/cobros/useImprimirRecibosMorosos"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface MorososPrintBarProps {
  morosos: MorosoDetallado[]
  excludedSocioIds: Set<number>
  onExcludedChange: (next: Set<number>) => void
}

const MESES = [
  { value: "01", label: "Ene" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Abr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Ago" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dic" },
]

export function MorososPrintBar({ morosos, excludedSocioIds }: MorososPrintBarProps) {
  const [open, setOpen] = useState(false)
  const [selectedPeriodos, setSelectedPeriodos] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const { mutate, isPending } = useImprimirRecibosMorosos()

  const includedMorosos = useMemo(
    () => morosos.filter((moroso) => !excludedSocioIds.has(moroso.socioId)),
    [excludedSocioIds, morosos],
  )

  const conteoPorAnio = useMemo(() => {
    const conteo = new Map<number, number>()
    morosos.forEach((moroso) => {
      moroso.periodosAdeudados.forEach((periodo) => {
        const year = Number.parseInt(periodo.split("-")[0], 10)
        if (!Number.isNaN(year)) {
          conteo.set(year, (conteo.get(year) ?? 0) + 1)
        }
      })
    })
    return conteo
  }, [morosos])

  const availableYears = useMemo(
    () => Array.from(conteoPorAnio.keys()).sort((a, b) => b - a),
    [conteoPorAnio],
  )

  // Default: el año con más períodos adeudados (no el más reciente)
  useEffect(() => {
    if (selectedYear === null && availableYears.length > 0) {
      const mejorAnio = availableYears.reduce((a, b) =>
        (conteoPorAnio.get(b) ?? 0) > (conteoPorAnio.get(a) ?? 0) ? b : a,
      )
      setSelectedYear(String(mejorAnio))
    }
  }, [availableYears, conteoPorAnio, selectedYear])

  const talonariosEstimados = useMemo(() => {
    const selected = new Set(selectedPeriodos)
    return includedMorosos.reduce((total, moroso) => {
      return total + moroso.periodosAdeudados.filter((periodo) => selected.has(periodo)).length
    }, 0)
  }, [includedMorosos, selectedPeriodos])

  const handleImprimir = () => {
    mutate({
      periodos: selectedPeriodos,
      socioIds: includedMorosos.map((moroso) => moroso.socioId),
    })
    setOpen(false)
  }

  if (availableYears.length === 0) {
    return null
  }

  return (
    <div className="flex justify-end">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir talonarios
            {selectedPeriodos.length > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {selectedPeriodos.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Año
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availableYears.map((year) => {
                  const isSelected = selectedYear === String(year)
                  return (
                    <Button
                      key={year}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setSelectedYear(String(year))}
                    >
                      {year}
                    </Button>
                  )
                })}
              </div>
            </div>

            {selectedYear !== null && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Meses de {selectedYear}
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {MESES.map((mes) => {
                    const periodo = `${selectedYear}-${mes.value}`
                    const selected = selectedPeriodos.includes(periodo)
                    const tieneDeuda = includedMorosos.some((moroso) =>
                      moroso.periodosAdeudados.includes(periodo),
                    )

                    return (
                      <Button
                        key={periodo}
                        type="button"
                        variant={selected ? "default" : "outline"}
                        size="sm"
                        className="h-8 px-0 text-xs"
                        onClick={() =>
                          setSelectedPeriodos((prev) =>
                            prev.includes(periodo)
                              ? prev.filter((item) => item !== periodo)
                              : [...prev, periodo],
                          )
                        }
                        disabled={!tieneDeuda && !selected}
                        title={
                          !tieneDeuda && !selected
                            ? "Ningún moroso incluido adeuda este mes"
                            : undefined
                        }
                      >
                        {mes.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs ${
                  selectedPeriodos.length > 0 && talonariosEstimados === 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {selectedPeriodos.length > 0 && talonariosEstimados === 0 ? (
                  "Sin cuotas pendientes en los períodos elegidos"
                ) : (
                  <>
                    {talonariosEstimados} talonario{talonariosEstimados === 1 ? "" : "s"} ·{" "}
                    {includedMorosos.length} socio{includedMorosos.length === 1 ? "" : "s"}
                  </>
                )}
              </span>
              <div className="flex shrink-0 gap-1.5">
                {selectedPeriodos.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground"
                    onClick={() => setSelectedPeriodos([])}
                  >
                    Limpiar
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={handleImprimir}
                  disabled={isPending || selectedPeriodos.length === 0 || talonariosEstimados === 0}
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Printer className="h-3.5 w-3.5" />
                  )}
                  Imprimir
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
