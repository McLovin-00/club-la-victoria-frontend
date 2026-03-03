import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

interface ContadorResponse {
  totalNoLeidas: number;
}

export const useContadorNotificaciones = () => {
  return useQuery<ContadorResponse>({
    queryKey: ["notificaciones-contador"],
    queryFn: async () => {
      const { data } = await apiClient.get<ContadorResponse>("/notificaciones/contador");
      return data;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
};
