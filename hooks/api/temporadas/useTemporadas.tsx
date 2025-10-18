import apiClient from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { Temporada } from "@/lib/types";
import { STALE_TIME } from "@/lib/constants";

export const useTemporadas = () => {
  return useQuery<Temporada[]>({
    queryKey: ["temporadas"],
    queryFn: async () => {
      const { data } = await apiClient.get<Temporada[]>("/temporadas");
      return data;
    },
    staleTime: STALE_TIME,
  });
};
