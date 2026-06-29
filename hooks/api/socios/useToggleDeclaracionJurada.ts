import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { AxiosError } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";

export const useToggleDeclaracionJurada = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    void,
    AxiosError<{ message: string }>,
    { id: number; declaracionJurada: boolean }
  >({
    mutationFn: ({ id, declaracionJurada }) =>
      apiClient.patch(`/socios/${id}/declaracion-jurada`, { declaracionJurada }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socios"] });
    },
    onError: (error) => {
      logError(error, "useToggleDeclaracionJurada");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
