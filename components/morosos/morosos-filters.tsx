"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { SeveridadMoroso } from "@/hooks/api/cobros/useMorososDetallados"

interface MorososFiltersProps {
  severidad: SeveridadMoroso
  busqueda: string
  onSeveridadChange: (value: SeveridadMoroso) => void
  onBusquedaChange: (value: string) => void
}

export function MorososFilters({
  severidad,
  busqueda,
  onSeveridadChange,
  onBusquedaChange,
}: MorososFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido o DNI..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select
        value={severidad}
        onValueChange={(value) => onSeveridadChange(value as SeveridadMoroso)}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filtrar por severidad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los morosos</SelectItem>
          <SelectItem value="3-meses">3 meses</SelectItem>
          <SelectItem value="4-meses">4+ meses</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
