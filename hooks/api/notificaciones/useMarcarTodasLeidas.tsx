import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { AxiosError } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";

export const useMarcarTodasLeidas = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    void
  >({
    mutationFn: async () => {
      const response = await apiClient.post<{ message: string }>(
        "/notificaciones/leer-todas"
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Todas las notificaciones marcadas como leídas");
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
      queryClient.invalidateQueries({ queryKey: ["notificaciones-contador"] });
    },
    onError: (error) => {
      logError(error, "useMarcarTodasLeidas");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
