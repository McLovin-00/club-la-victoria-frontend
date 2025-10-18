import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MENSAJES_EXITO } from "@/lib/constants";
import apiClient from "@/lib/api/client";
import { AxiosError, AxiosResponse } from "axios";
import { Temporada } from "@/lib/types";
import { adaptError, logError } from "@/lib/errors/error.adapter";

export const useCreateTemporada = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AxiosResponse<Temporada>, // tipo de respuesta
    AxiosError<{ message: string }>, // tipo de error
    Temporada // input
  >({
    mutationFn: (data) => apiClient.post(`/temporadas`, data),
    onSuccess: (response) => {
      toast.success(MENSAJES_EXITO.TEMPORADA_CREADA, {
        duration: 5000,
      });

      // Actualiza la cache del socio específico
      queryClient.setQueryData(["temporada", response.data.id], response.data);

      // Si tenés un listado de socios, invalida para refrescarlo
      queryClient.invalidateQueries({ queryKey: ["temporadas"] });
    },
    onError: (error) => {
      logError(error, "useCreateTemporada");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
