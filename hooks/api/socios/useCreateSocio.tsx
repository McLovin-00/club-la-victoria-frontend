// hooks/api/socios/useCreateSocio.tsx
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MENSAJES_EXITO } from "@/lib/constants";
import apiClient from "@/lib/api/client";
import { AxiosResponse } from "axios";
import { SocioWithFoto } from "@/lib/types";
import { adaptError, logError } from "@/lib/errors/error.adapter";

export const useCreateSocio = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AxiosResponse<SocioWithFoto>,
    unknown,
    FormData
  >({
    mutationFn: (data) => apiClient.post(`/socios`, data),
    onSuccess: (response) => {
      toast.success(MENSAJES_EXITO.SOCIO_CREADO);

      // Actualiza la cache del socio específico
      queryClient.setQueryData(["socio", response.data.id], response.data);

      // Invalida para refrescar el listado
      queryClient.invalidateQueries({ queryKey: ["socios"] });
    },
    onError: (error) => {
      logError(error, "useCreateSocio");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
