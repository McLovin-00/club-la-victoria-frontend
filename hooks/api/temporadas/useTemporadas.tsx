import apiClient from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { Temporada } from "@/lib/types";

export const useTemporadas = () => {
  return useQuery<Temporada[]>({
    queryKey: ["temporadas"],
    queryFn: async () => {
      const { data } = await apiClient.get<Temporada[]>("/temporadas");
      return data;
    },
  });
};
