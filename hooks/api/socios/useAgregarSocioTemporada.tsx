import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";
import { MENSAJES_EXITO } from "@/lib/constants";

interface AgregarSocioTemporadaParams {
  socioId: string;
  temporadaId: string;
}

export const useAgregarSocioTemporada = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ socioId, temporadaId }: AgregarSocioTemporadaParams) => {
      const { data } = await apiClient.post(`/temporadas/${temporadaId}/socios`, {
        socioId,
      });
      return data;
    },
    onSuccess: (_, { temporadaId }) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["socios-temporada", temporadaId] });
      queryClient.invalidateQueries({ queryKey: ["socios-disponibles", temporadaId] });
      queryClient.invalidateQueries({ queryKey: ["socios"] });
      
      toast.success(MENSAJES_EXITO.ASOCIACION_CREADA);
    },
    onError: (error) => {
      console.error("Error adding member to season:", error);
      toast.error("Error al agregar socio a la temporada");
    },
  });
};
