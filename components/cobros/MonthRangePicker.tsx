"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange, ArrowRight } from "lucide-react";

const MESES = [
  { valor: "01", nombre: "Enero" },
  { valor: "02", nombre: "Febrero" },
  { valor: "03", nombre: "Marzo" },
  { valor: "04", nombre: "Abril" },
  { valor: "05", nombre: "Mayo" },
  { valor: "06", nombre: "Junio" },
  { valor: "07", nombre: "Julio" },
  { valor: "08", nombre: "Agosto" },
  { valor: "09", nombre: "Septiembre" },
  { valor: "10", nombre: "Octubre" },
  { valor: "11", nombre: "Noviembre" },
  { valor: "12", nombre: "Diciembre" },
];

const getAniosDisponibles = () => {
  const anioActual = new Date().getFullYear();
  return [anioActual - 2, anioActual - 1, anioActual, anioActual + 1];
};

interface MonthRangePickerProps {
  value: { desde: string; hasta: string };
  onChange: (value: { desde: string; hasta: string }) => void;
  onBuscar: () => void;
  isLoading?: boolean;
}

export function MonthRangePicker({
  value,
  onChange,
  onBuscar,
  isLoading,
}: MonthRangePickerProps) {
  const anios = useMemo(() => getAniosDisponibles(), []);

  // Parsear valores actuales
  const [anioDesde, mesDesde] = value.desde ? value.desde.split("-") : ["", ""];
  const [anioHasta, mesHasta] = value.hasta ? value.hasta.split("-") : ["", ""];

  const handleMesDesdeChange = (mes: string) => {
    if (anioDesde) {
      onChange({ ...value, desde: `${anioDesde}-${mes}` });
    } else {
      // Guardar mes temporalmente, se completará cuando seleccione año
      const now = new Date();
      onChange({ ...value, desde: `${now.getFullYear()}-${mes}` });
    }
  };

  const handleAnioDesdeChange = (anio: string) => {
    if (mesDesde) {
      onChange({ ...value, desde: `${anio}-${mesDesde}` });
    }
  };

  const handleMesHastaChange = (mes: string) => {
    if (anioHasta) {
      onChange({ ...value, hasta: `${anioHasta}-${mes}` });
    } else {
      // Guardar mes temporalmente, se completará cuando seleccione año
      const now = new Date();
      onChange({ ...value, hasta: `${now.getFullYear()}-${mes}` });
    }
  };

  const handleAnioHastaChange = (anio: string) => {
    if (mesHasta) {
      onChange({ ...value, hasta: `${anio}-${mesHasta}` });
    }
  };

  const setPeriodoActual = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    onChange({ desde: `${year}-${month}`, hasta: `${year}-${month}` });
  };

  const isValidRange = useMemo(() => {
    if (!value.desde || !value.hasta) return false;
    return value.desde <= value.hasta;
  }, [value.desde, value.hasta]);

  const nombrePeriodoDesde = useMemo(() => {
    if (!mesDesde || !anioDesde) return "";
    const mesNombre = MESES.find((m) => m.valor === mesDesde)?.nombre ?? "";
    return `${mesNombre} ${anioDesde}`;
  }, [mesDesde, anioDesde]);

  const nombrePeriodoHasta = useMemo(() => {
    if (!mesHasta || !anioHasta) return "";
    const mesNombre = MESES.find((m) => m.valor === mesHasta)?.nombre ?? "";
    return `${mesNombre} ${anioHasta}`;
  }, [mesHasta, anioHasta]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <CalendarRange className="h-4 w-4" />
        <span>Seleccionar rango de meses</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr,auto,1fr,auto] items-end">
        {/* Desde */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Desde</Label>
          <div className="flex gap-2">
            <Select value={mesDesde} onValueChange={handleMesDesdeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((m) => (
                  <SelectItem key={m.valor} value={m.valor}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={anioDesde} onValueChange={handleAnioDesdeChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {anios.map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Flecha */}
        <div className="hidden lg:flex items-center justify-center pb-2">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Hasta */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Hasta</Label>
          <div className="flex gap-2">
            <Select value={mesHasta} onValueChange={handleMesHastaChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((m) => (
                  <SelectItem key={m.valor} value={m.valor}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={anioHasta} onValueChange={handleAnioHastaChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {anios.map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={setPeriodoActual}>
            Actual
          </Button>
          <Button onClick={onBuscar} disabled={!isValidRange || isLoading}>
            {isLoading ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      </div>

      {/* Mostrar rango seleccionado */}
      {nombrePeriodoDesde && nombrePeriodoHasta && (
        <div className="text-sm text-muted-foreground">
          Rango: <span className="font-medium text-foreground">{nombrePeriodoDesde}</span>
          {" → "}
          <span className="font-medium text-foreground">{nombrePeriodoHasta}</span>
        </div>
      )}

      {!isValidRange && value.desde && value.hasta && (
        <p className="text-sm text-destructive">
          El período "hasta" debe ser mayor o igual al período "desde"
        </p>
      )}
    </div>
  );
}
