import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MENSAJES_EXITO } from "@/lib/constants";
import apiClient from "@/lib/api/client";
import { AxiosError, AxiosResponse } from "axios";
import { SocioWithFoto, Temporada } from "@/lib/types";

export const useUpdateTemporada = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AxiosResponse<Temporada>,
    AxiosError<{ message: string }>,
    { id: number ; data: Temporada }
  >({
    mutationFn: ({ id, data }) => apiClient.patch(`/temporadas/${id}`, data),
    onSuccess: (response) => {
      toast.success(MENSAJES_EXITO.TEMPORADA_ACTUALIZADA, {
        duration: 5000,
      });
      // Actualiza la cache del socio específico
      queryClient.setQueryData(['temporada', response.data.id], response.data);

      // Si tenés un listado de socios, invalida para refrescarlo
      queryClient.invalidateQueries({ queryKey: ["temporadas"] });
    },
    onError: (error) => {
      const message = error.response?.data?.message ?? "Error al crear temporada";
      toast.error(message);
      console.error("Error al actualizar temporada:", error);
    },
  });

  return mutation;
};
