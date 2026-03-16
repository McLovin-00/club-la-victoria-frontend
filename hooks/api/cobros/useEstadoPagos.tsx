import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export type TarjetaCentroEstadoMes =
  | "TARJETA_APROBADA"
  | "TARJETA_RECHAZADA_PENDIENTE"
  | "TARJETA_RECHAZADA_PAGADA"
  | "TARJETA_PENDIENTE_RESPUESTA";

export interface SocioPagosAnual {
  socioId: number;
  nombre: string;
  apellido: string;
  dni?: string;
  estado: "ACTIVO" | "INACTIVO" | "MOROSO";
  categoriaNombre: string;
  tarjetaCentro: boolean;
  meses: Record<string, string | null>;
  mesesTarjetaCentro?: Record<string, TarjetaCentroEstadoMes | null>;
}

export type EstadoPagoFiltro =
  | "TODOS"
  | "PAGADA"
  | "PENDIENTE"
  | "SIN_CUOTA"
  | "CON_PAGO"
  | "CON_DEUDA";

export type CategoriaSocioFiltro = "ACTIVO" | "ADHERENTE";

export interface EstadoPagosResponse {
  socios: SocioPagosAnual[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EstadoPagosParams {
  anio: number;
  page?: number;
  limit?: number;
  busqueda?: string;
  mes?: number;
  estadoPago?: EstadoPagoFiltro;
  categoriaSocio?: CategoriaSocioFiltro;
  tarjetaCentro?: boolean;
}

export const useEstadoPagos = (params: EstadoPagosParams) => {
  return useQuery<EstadoPagosResponse>({
    queryKey: ["estado-pagos", params],
    queryFn: async () => {
      const { data } = await apiClient.get<EstadoPagosResponse>(
        "/cobros/estado-pagos",
        { params }
      );
      return data;
    },
    staleTime: STALE_TIME,
  });
};
