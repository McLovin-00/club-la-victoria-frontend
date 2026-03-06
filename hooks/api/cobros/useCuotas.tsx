
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export enum EstadoCuota {
  PENDIENTE = "PENDIENTE",
  PAGADA = "PAGADA",
}

export interface Cuota {
  id: number;
  socioId: number;
  periodo: string;
  monto: number;
  estado: EstadoCuota;
  createdAt: string;
  fechaPago?: string;
  socio?: {
    id: number;
    nombre: string;
    apellido: string;
    dni?: string;
    direccion?: string;
  };
}

export interface CuotasResponse {
  cuotas: Cuota[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseCuotasFilters {
  periodo?: string;
  estado?: EstadoCuota;
  socioId?: number;
  tarjetaCentro?: boolean;
  busqueda?: string;
  page?: number;
  limit?: number;
}

export const useCuotas = (filtros?: UseCuotasFilters) => {
  return useQuery<CuotasResponse>({
    queryKey: ["cuotas", filtros],
    queryFn: async () => {
      const { data } = await apiClient.get<CuotasResponse>("/cobros/cuotas", {
        params: filtros,
      });
      return data;
    },
    staleTime: STALE_TIME,
  });
};
