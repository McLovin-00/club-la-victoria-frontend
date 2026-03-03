// hooks/api/cobros/useGenerarCuotas.tsx
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { AxiosError } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";

interface ResultadoGeneracion {
  creadas: number;
  omitidas: number;
  desactivados: number;
  advertencias: string[];
}

export const useGenerarCuotas = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResultadoGeneracion,
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: async (periodo) => {
      const response = await apiClient.post<ResultadoGeneracion>("/cobros/generar", {
        periodo,
      });
      return response.data;
    },
    onSuccess: (result) => {
      const mensajes = [];
      if (result.creadas > 0) mensajes.push(`${result.creadas} cuotas creadas`);
      if (result.omitidas > 0) mensajes.push(`${result.omitidas} omitidas (ya existían)`);
      if (result.desactivados > 0) mensajes.push(`${result.desactivados} socios desactivados por morosidad`);
      
      toast.success("Cuotas generadas", {
        description: mensajes.join(", "),
      });

      if (result.advertencias.length > 0) {
        result.advertencias.forEach((adv) => {
          toast.warning("Advertencia", { description: adv });
        });
      }

      queryClient.invalidateQueries({ queryKey: ["cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
      queryClient.invalidateQueries({ queryKey: ["notificaciones-contador"] });
    },
    onError: (error) => {
      logError(error, "useGenerarCuotas");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
