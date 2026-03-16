// hooks/api/cobros/useReporteCobranza.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";
import { AxiosError } from "axios";

export interface DesglosePorMetodoPago {
  metodoPago: string;
  totalCobrado: number;
  cantidadPagos: number;
}

export interface ResumenTarjetaCentro {
  sociosConTarjeta: number;
  cuotasPagadasTarjeta: number;
  totalCobradoTarjeta: number;
  cuotasPendientesTarjeta: number;
  totalPendienteTarjeta: number;
}

export interface ReporteCobranza {
  periodo: string;
  totalGenerado: number;
  totalCobrado: number;
  porcentajeCobranza: number;
  cuotasPendientes: number;
  cuotasPagadas: number;
  morosidad: number;
  desglosePorMetodoPago: DesglosePorMetodoPago[];
  tarjetaCentro: ResumenTarjetaCentro;
}

// Valores por defecto cuando no hay cuotas pendientes
const defaultReporteCobranza: ReporteCobranza = {
  periodo: "",
  totalGenerado: 0,
  totalCobrado: 0,
  porcentajeCobranza: 0,
  cuotasPendientes: 0,
  cuotasPagadas: 0,
  morosidad: 0,
  desglosePorMetodoPago: [],
  tarjetaCentro: {
    sociosConTarjeta: 0,
    cuotasPagadasTarjeta: 0,
    totalCobradoTarjeta: 0,
    cuotasPendientesTarjeta: 0,
    totalPendienteTarjeta: 0,
  },
};

export const useReporteCobranza = (periodo: string) => {
  return useQuery<ReporteCobranza>({
    queryKey: ["reporte-cobranza", periodo],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ReporteCobranza>("/cobros/reportes/cobranza", {
          params: { periodo },
        });
        return data;
      } catch (error) {
        // Manejar el caso específico de 404: no hay cuotas pendientes
        // Esto no es un error, sino un estado válido del sistema
        const axiosError = error as AxiosError<{ errorCode?: string }>;
        if (axiosError.response?.status === 404 && 
            axiosError.response?.data?.errorCode === "ERR_NO_CUOTAS_PENDIENTES") {
          return {
            ...defaultReporteCobranza,
            periodo,
          };
        }
        // Propagar otros errores
        throw error;
      }
    },
    enabled: !!periodo,
    staleTime: STALE_TIME,
  });
};
