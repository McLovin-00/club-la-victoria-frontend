import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export interface SocioElegible {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string;
  categoriaNombre: string;
  montoMensual: number;
  cuotaExistente: boolean;
  tarjetaCentro: boolean;
}

interface SociosElegiblesResponse {
  socios: SocioElegible[];
  total: number;
}

export const useSociosElegibles = (periodo?: string) => {
  return useQuery<SociosElegiblesResponse>({
    queryKey: ["socios-elegibles", periodo],
    queryFn: async () => {
      const { data } = await apiClient.get<SociosElegiblesResponse>(
        "/cobros/socios-elegibles",
        { params: { periodo } }
      );
      return data;
    },
    staleTime: STALE_TIME,
    enabled: !!periodo,
  });
};
