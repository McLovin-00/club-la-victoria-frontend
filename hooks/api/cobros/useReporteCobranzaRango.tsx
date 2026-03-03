// hooks/api/cobros/useReporteCobranzaRango.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";
import { AxiosError } from "axios";

export interface ReporteCobranzaMes {
  periodo: string;
  totalGenerado: number;
  totalCobrado: number;
  porcentajeCobranza: number;
  cuotasPendientes: number;
  cuotasPagadas: number;
  morosidad: number;
}

export interface ReporteCobranzaRango {
  periodoDesde: string;
  periodoHasta: string;
  totalGenerado: number;
  totalCobrado: number;
  porcentajeCobranza: number;
  cuotasPendientes: number;
  cuotasPagadas: number;
  morosidad: number;
  cantidadMeses: number;
  meses: ReporteCobranzaMes[];
}

interface UseReporteCobranzaRangoParams {
  periodoDesde: string;
  periodoHasta: string;
  enabled?: boolean;
}

export const useReporteCobranzaRango = ({
  periodoDesde,
  periodoHasta,
  enabled = true,
}: UseReporteCobranzaRangoParams) => {
  return useQuery<ReporteCobranzaRango>({
    queryKey: ["reporte-cobranza-rango", periodoDesde, periodoHasta],
    queryFn: async () => {
      const { data } = await apiClient.get<ReporteCobranzaRango>(
        "/cobros/reportes/cobranza-rango",
        {
          params: { periodoDesde, periodoHasta },
        }
      );
      return data;
    },
    enabled: enabled && !!periodoDesde && !!periodoHasta && periodoDesde <= periodoHasta,
    staleTime: STALE_TIME,
  });
};
