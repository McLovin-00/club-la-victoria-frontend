"use client";

import { useMemo, useState } from "react";
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
  useConfigurarComision,
  useResumenComision,
} from "@/hooks/api/cobradores/useCobradorComision";

const todayIso = new Date().toISOString();

export default function ComisionCobradoresPage() {
  const [cobradorId, setCobradorId] = useState(0);
  const [porcentaje, setPorcentaje] = useState("0.1");
  const [desde, setDesde] = useState(todayIso.slice(0, 10));
  const [hasta, setHasta] = useState(todayIso.slice(0, 10));
  const [vigenteDesde, setVigenteDesde] = useState(todayIso);

  const { data: cobradores } = useCobradoresActivos();
  const configMutation = useConfigurarComision(cobradorId);

  const rangoDesdeIso = useMemo(() => new Date(`${desde}T00:00:00.000Z`).toISOString(), [desde]);
  const rangoHastaIso = useMemo(() => new Date(`${hasta}T23:59:59.999Z`).toISOString(), [hasta]);

  const { data: resumen, isLoading } = useResumenComision(
    cobradorId,
    rangoDesdeIso,
    rangoHastaIso,
  );

  return (
    <DashboardLayout title="Comisión de Cobradores" description="Configurar y consultar comisiones">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de comisión</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
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
              <Label>Porcentaje</Label>
              <Input
                type="number"
                min="0"
                step="0.0001"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Vigente desde</Label>
              <Input
                type="datetime-local"
                value={vigenteDesde.slice(0, 16)}
                onChange={(e) => setVigenteDesde(new Date(e.target.value).toISOString())}
              />
            </div>

            <div className="flex items-end">
              <Button
                className="w-full"
                disabled={cobradorId <= 0 || configMutation.isPending}
                onClick={() =>
                  configMutation.mutate({
                    porcentaje: Number(porcentaje),
                    vigenteDesde,
                  })
                }
              >
                Guardar comisión
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen por rango</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Hasta</Label>
                <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando resumen...</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Base comisión</p>
                    <p className="text-xl font-semibold">${resumen?.base ?? 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Comisión</p>
                    <p className="text-xl font-semibold">${resumen?.comision ?? 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Operaciones</p>
                    <p className="text-xl font-semibold">{resumen?.operaciones ?? 0}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
