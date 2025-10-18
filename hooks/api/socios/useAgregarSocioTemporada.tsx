import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";
import { MENSAJES_EXITO } from "@/lib/constants";
import { adaptError, logError } from "@/lib/errors/error.adapter";
import { AxiosError } from "axios";

interface AgregarSocioTemporadaParams {
  socioId: string;
  temporadaId: string;
}

export const useAgregarSocioTemporada = () => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<{ message: string }>,
    AgregarSocioTemporadaParams
  >({
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
      logError(error, "useAgregarSocioTemporada");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });
};
