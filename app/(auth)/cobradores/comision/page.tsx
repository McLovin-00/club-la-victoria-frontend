"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCobradoresActivos } from "@/hooks/api/cobradores/useCobradoresActivos";
import {
  useComisionVigente,
  useConfigurarComision,
} from "@/hooks/api/cobradores/useCobradorComision";
import { toast } from "sonner";

export default function ComisionCobradoresPage() {
  const [cobradorId, setCobradorId] = useState<number | null>(null);
  const [porcentaje, setPorcentaje] = useState("0");

  const { data: cobradores } = useCobradoresActivos();
  const { data: comisionVigente } = useComisionVigente(cobradorId ?? 0);
  const configMutation = useConfigurarComision(cobradorId ?? 0);

  useEffect(() => {
    if (cobradorId !== null && comisionVigente) {
      setPorcentaje(String(comisionVigente.porcentaje));
    } else if (cobradorId === null) {
      setPorcentaje("0");
    }
  }, [cobradorId, comisionVigente]);

  return (
    <DashboardLayout
      title="Comisión de Cobradores"
      description="Configurar comisiones por cobrador"
    >
      <Card>
        <CardHeader>
          <CardTitle>Configuración de comisión</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Cobrador</Label>
            <Select
              value={cobradorId ? String(cobradorId) : ""}
              onValueChange={(value) => setCobradorId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione cobrador" />
              </SelectTrigger>
              <SelectContent>
                {cobradores?.map((cobrador) => (
                  <SelectItem key={cobrador.id} value={String(cobrador.id)}>
                    {cobrador.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Porcentaje (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
              disabled={cobradorId === null}
            />
          </div>

          <div className="flex items-end">
            <Button
              className="w-full"
              disabled={cobradorId === null || configMutation.isPending}
              onClick={() => {
                configMutation.mutate({
                  porcentaje: Number(porcentaje) / 100,
                  vigenteDesde: new Date().toISOString(),
                });
                toast.success("Comisión actualizada correctamente");
              }}
            >
              {configMutation.isPending ? "Guardando..." : "Guardar comisión"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
