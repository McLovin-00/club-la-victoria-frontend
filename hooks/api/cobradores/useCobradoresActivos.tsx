import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export interface CobradorActivo {
  id: number;
  nombre: string;
  activo: boolean;
}

export const useCobradoresActivos = () => {
  return useQuery<CobradorActivo[]>({
    queryKey: ["cobradores", "activos"],
    queryFn: async () => {
      const { data } = await apiClient.get<CobradorActivo[]>("/cobradores/activos");
      return data;
    },
    staleTime: STALE_TIME,
  });
};
