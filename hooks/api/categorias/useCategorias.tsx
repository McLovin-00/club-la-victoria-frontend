// hooks/api/categorias/useCategorias.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export interface CategoriaSocio {
  id: number;
  nombre: string;
  montoMensual: number;
  exento: boolean; // Indica si la categoría está exenta de pago (VITALICIO, HONORARIO)
  createdAt: string;
  updatedAt: string;
}

export const useCategorias = () => {
  return useQuery<CategoriaSocio[]>({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data } = await apiClient.get<CategoriaSocio[]>("/categorias-socio");
      return data;
    },
    staleTime: STALE_TIME,
  });
};

export const useCategoriaById = (id: number) => {
  return useQuery<CategoriaSocio>({
    queryKey: ["categoria", id],
    queryFn: async () => {
      const { data } = await apiClient.get<CategoriaSocio>(`/categorias-socio/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
};
