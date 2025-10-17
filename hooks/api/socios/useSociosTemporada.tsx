import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { SocioWithFoto } from "@/lib/types";

export interface SocioTemporada {
  id: number;
  socio: SocioWithFoto;
}

export const useSociosTemporada = (temporadaId: string) => {
  return useQuery<SocioTemporada[]>({
    queryKey: ["socios-temporada", temporadaId],
    queryFn: async () => {
      if (!temporadaId) return [];
      const { data } = await apiClient.get<SocioTemporada[]>(`/temporadas/${temporadaId}/socios`);
      console.log(data);
      return data;
    },
    enabled: !!temporadaId,
  });
};
