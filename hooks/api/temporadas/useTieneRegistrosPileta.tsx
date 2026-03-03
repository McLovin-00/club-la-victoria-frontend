import apiClient from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

interface TieneRegistrosPiletaResponse {
  tieneRegistros: boolean;
  cantidad: number;
}

export const useTieneRegistrosPileta = (temporadaId: number | null) => {
  return useQuery<TieneRegistrosPiletaResponse>({
    queryKey: ["temporada", temporadaId, "tiene-registros-pileta"],
    queryFn: async () => {
      if (!temporadaId) {
        return { tieneRegistros: false, cantidad: 0 };
      }
      const { data } = await apiClient.get<TieneRegistrosPiletaResponse>(
        `/temporadas/${temporadaId}/tiene-registros-pileta`
      );
      return data;
    },
    enabled: temporadaId !== null,
    staleTime: 0, // Siempre fresco para verificación de eliminación
  });
};
