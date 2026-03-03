import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { AxiosError } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";

interface GenerarCuotasSeleccionRequest {
  periodo: string;
  socioIds: number[];
}

export interface GenerarCuotasSeleccionResponse {
  creadas: number;
  omitidas: number;
  advertenciasMorosidad: number;
  inhabilitados: number;
  advertencias: string[];
}

export const useGenerarCuotasSeleccion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    GenerarCuotasSeleccionResponse,
    AxiosError<{ message: string }>,
    GenerarCuotasSeleccionRequest
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post<GenerarCuotasSeleccionResponse>(
        "/cobros/generar-seleccion",
        data
      );
      return response.data;
    },
    onSuccess: (result) => {
      const mensajes = [];
      if (result.creadas > 0) mensajes.push(`${result.creadas} cuotas creadas`);
      if (result.omitidas > 0) mensajes.push(`${result.omitidas} omitidas (ya existían)`);
      if (result.inhabilitados > 0) mensajes.push(`${result.inhabilitados} socios inhabilitados por morosidad`);
      if (result.advertenciasMorosidad > 0) mensajes.push(`${result.advertenciasMorosidad} socios con advertencia de morosidad`);

      toast.success("Cuotas generadas", {
        description: mensajes.join(", "),
      });

      if (result.advertencias.length > 0) {
        result.advertencias.forEach((adv) => {
          toast.warning("Advertencia", { description: adv });
        });
      }

      queryClient.invalidateQueries({ queryKey: ["cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["socios-elegibles"] });
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
      queryClient.invalidateQueries({ queryKey: ["notificaciones-contador"] });
    },
    onError: (error) => {
      logError(error, "useGenerarCuotasSeleccion");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
