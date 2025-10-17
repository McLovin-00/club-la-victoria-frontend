// hooks/api/socios/useUpdateSocio.tsx
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MENSAJES_EXITO } from "@/lib/constants";
import apiClient from "@/lib/api/client";
import { AxiosResponse } from "axios";
import { SocioWithFoto } from "@/lib/types";
import { adaptError, logError } from "@/lib/errors/error.adapter";

export const useUpdateSocio = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AxiosResponse<SocioWithFoto>,
    unknown,
    { id: number; data: FormData }
  >({
    mutationFn: ({ id, data }) => apiClient.put(`/socios/${id}`, data),
    onSuccess: (response) => {
      toast.success(MENSAJES_EXITO.SOCIO_ACTUALIZADO);

      // Actualiza la cache del socio específico
      queryClient.setQueryData(["socio", response.data.id], response.data);

      // Invalida para refrescar el listado
      queryClient.invalidateQueries({ queryKey: ["socios"] });
    },
    onError: (error) => {
      logError(error, "useUpdateSocio");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
