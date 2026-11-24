"use client";

import { useState, type FormEvent } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api/client";
import { adaptError } from "@/lib/errors/error.adapter";
import { guardarPdfRendicion, type Rendicion } from "@/lib/utils/rendicion-pdf";

const fechaActualDelClub = () => new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

export function RendicionCobradora({ cobradorId }: { cobradorId: number }) {
  const [tipo, setTipo] = useState<"mes" | "rango">("mes");
  const [mes, setMes] = useState(() => fechaActualDelClub().slice(0, 7));
  const [desde, setDesde] = useState(() => `${fechaActualDelClub().slice(0, 7)}-01`);
  const [hasta, setHasta] = useState(fechaActualDelClub);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState("");

  async function descargar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (descargando) return;
    setError("");
    if (tipo === "rango" && desde > hasta) {
      setError("La fecha inicial no puede ser posterior a la final.");
      return;
    }
    setDescargando(true);
    try {
      const { data } = await apiClient.get<Rendicion>(`/cobradores/${cobradorId}/rendicion`, {
        params: tipo === "mes" ? { periodo: mes } : { desde, hasta },
      });
      await guardarPdfRendicion(cobradorId, data);
    } catch (err) {
      setError(adaptError(err).message || "No se pudo descargar la rendición.");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <form className="space-y-3 rounded-lg border bg-card p-4" onSubmit={descargar}>
      <div>
        <h2 className="text-sm font-semibold">Rendición de cobranzas</h2>
        <p className="text-xs text-muted-foreground">
          Incluye todos los cobros del período elegido, sin comisiones ni filtros por socio.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="rendicion-tipo">Período</Label>
          <select id="rendicion-tipo" className="h-9 rounded-md border bg-background px-2 text-sm"
            value={tipo} onChange={(event) => setTipo(event.target.value === "rango" ? "rango" : "mes")}>
            <option value="mes">Mes completo</option>
            <option value="rango">Rango personalizado</option>
          </select>
        </div>
        {tipo === "mes" ? (
          <div className="grid gap-1.5">
            <Label htmlFor="rendicion-mes">Mes de rendición</Label>
            <Input id="rendicion-mes" type="month" value={mes} required onChange={(event) => setMes(event.target.value)} />
          </div>
        ) : (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor="rendicion-desde">Desde</Label>
              <Input id="rendicion-desde" type="date" value={desde} required onChange={(event) => setDesde(event.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="rendicion-hasta">Hasta</Label>
              <Input id="rendicion-hasta" type="date" value={hasta} required onChange={(event) => setHasta(event.target.value)} />
            </div>
          </>
        )}
        <Button type="submit" size="sm" disabled={descargando}>
          <Download className="h-4 w-4" aria-hidden="true" />
          {descargando ? "Preparando PDF…" : "Descargar PDF"}
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
