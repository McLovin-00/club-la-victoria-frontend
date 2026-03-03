import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

// ==================== TIPOS ====================

export type SeveridadMoroso = "todos" | "3-meses" | "4-meses" | "6-meses";

export interface UltimoPago {
  fecha: string;
  periodo: string;
}

export interface CategoriaMoroso {
  nombre: string;
  montoMensual: number;
}

export interface MorosoDetallado {
  socioId: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  email?: string;
  categoria: CategoriaMoroso;
  estado: "ACTIVO" | "INACTIVO";
  mesesDeuda: number;
  montoTotalDeuda: number;
  periodosAdeudados: string[];
  ultimoPago?: UltimoPago;
}

export interface MorososStats {
  totalMorosos: number;
  montoTotalDeuda: number;
  tresMeses: number;
  cuatroMeses: number;
  seisMeses: number;
}

export interface MorososDetalladosResponse {
  morosos: MorosoDetallado[];
  estadisticas: MorososStats;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MorososDetalladosParams {
  severidad?: SeveridadMoroso;
  busqueda?: string;
  page?: number;
  limit?: number;
}

// ==================== HOOK ====================

export const useMorososDetallados = (params: MorososDetalladosParams = {}) => {
  return useQuery<MorososDetalladosResponse>({
    queryKey: ["morosos-detallados", params],
    queryFn: async () => {
      const { data } = await apiClient.get<MorososDetalladosResponse>(
        "/cobros/morosos",
        { params }
      );
      return data;
    },
    staleTime: STALE_TIME,
  });
};
