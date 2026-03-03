// hooks/api/cobros/useCuentaCorriente.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";
import { EstadoCuota } from "./useCuotas";

export interface CuentaCorriente {
  socioId: number;
  socioNombre: string;
  socioApellido: string;
  cuotas: {
    id: number;
    barcode?: string;
    periodo: string;
    monto: number;
    estado: EstadoCuota;
    fechaPago?: string;
  }[];
  totalDeuda: number;
  totalPagado: number;
  mesesAdeudados: number;
}

export const useCuentaCorriente = (socioId: number) => {
  return useQuery<CuentaCorriente>({
    queryKey: ["cuenta-corriente", socioId],
    queryFn: async () => {
      const { data } = await apiClient.get<CuentaCorriente>(
        `/cobros/cuenta-corriente/${socioId}`
      );
      return data;
    },
    enabled: !!socioId,
    staleTime: STALE_TIME,
  });
};
