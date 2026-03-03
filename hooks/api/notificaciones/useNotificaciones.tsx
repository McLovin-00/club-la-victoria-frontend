import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  leida: boolean;
  socioId: number;
  socio?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  createdAt: string;
}

interface NotificacionesResponse {
  notificaciones: Notificacion[];
  totalNoLeidas: number;
}

export const useNotificaciones = () => {
  return useQuery<NotificacionesResponse>({
    queryKey: ["notificaciones"],
    queryFn: async () => {
      const { data } = await apiClient.get<NotificacionesResponse>("/notificaciones");
      return data;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
};
