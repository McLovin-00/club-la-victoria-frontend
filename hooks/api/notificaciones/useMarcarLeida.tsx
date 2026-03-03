import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { AxiosError } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";

export const useMarcarLeida = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    number
  >({
    mutationFn: async (notificacionId) => {
      const response = await apiClient.post<{ message: string }>(
        `/notificaciones/${notificacionId}/leer`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
      queryClient.invalidateQueries({ queryKey: ["notificaciones-contador"] });
    },
    onError: (error) => {
      logError(error, "useMarcarLeida");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
