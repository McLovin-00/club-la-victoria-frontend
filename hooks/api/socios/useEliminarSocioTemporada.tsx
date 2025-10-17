import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";
import { MENSAJES_EXITO } from "@/lib/constants";

interface EliminarSocioTemporadaParams {
  socioId: string;
  temporadaId: string;
}

export const useEliminarSocioTemporada = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ socioId, temporadaId }: EliminarSocioTemporadaParams) => {
      const { data } = await apiClient.delete(`/temporadas/${temporadaId}/socios/${socioId}`);
      return data;
    },
    onSuccess: (_, { temporadaId }) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["socios-temporada", temporadaId] });
      queryClient.invalidateQueries({ queryKey: ["socios-disponibles", temporadaId] });
      
      toast.success(MENSAJES_EXITO.ASOCIACION_ELIMINADA);
    },
    onError: (error) => {
      console.error("Error removing member from season:", error);
      toast.error("Error al eliminar socio de la temporada");
    },
  });
};
