// hooks/api/socios/useDeleteSocio.tsx
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MENSAJES_EXITO } from "@/lib/constants";
import apiClient from "@/lib/api/client";
import { AxiosError, AxiosResponse } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";

export const useDeleteSocio = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse<void>, AxiosError<{ message: string }>, string>({
    mutationFn: (id) => apiClient.delete(`/socios/${id}`),
    onSuccess: () => {
      toast.success(MENSAJES_EXITO.SOCIO_ELIMINADO, {
        position: "top-center",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["socios"] });
    },
    onError: (error) => {
      logError(error, "useDeleteSocio");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};