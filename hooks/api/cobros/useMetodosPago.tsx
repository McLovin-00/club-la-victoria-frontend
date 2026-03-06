import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export interface MetodoPago {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden: number;
}

export const useMetodosPago = () => {
  return useQuery<MetodoPago[]>({
    queryKey: ["metodos-pago"],
    queryFn: async () => {
      const { data } = await apiClient.get<MetodoPago[]>("/metodos-pago");
      return data;
    },
    staleTime: STALE_TIME,
  });
};
