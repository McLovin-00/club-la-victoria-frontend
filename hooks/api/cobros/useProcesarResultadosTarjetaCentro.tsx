import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/lib/api/client";
import { adaptError, logError } from "@/lib/errors/error.adapter";

export interface TarjetaCentroResultadoRequestItem {
  cuotaId: number;
  aprobada: boolean;
  observaciones?: string;
}

interface ProcesarResultadosTarjetaCentroRequest {
  resultados: TarjetaCentroResultadoRequestItem[];
}

interface ProcesarResultadosTarjetaCentroResponse {
  procesados: number;
  aprobados: number;
  rechazados: number;
  errores: string[];
}

export const useProcesarResultadosTarjetaCentro = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProcesarResultadosTarjetaCentroResponse,
    AxiosError<{ message: string }>,
    ProcesarResultadosTarjetaCentroRequest
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<ProcesarResultadosTarjetaCentroResponse>(
        "/cobros/tarjeta-centro/resultados",
        payload,
      );
      return data;
    },
    onSuccess: (result) => {
      const resumen = `${result.aprobados} aprobadas, ${result.rechazados} rechazadas`;
      toast.success("Resultados de tarjeta procesados", {
        description: resumen,
      });

      if (result.errores.length > 0) {
        result.errores.forEach((errorItem) => {
          toast.warning("Resultado no aplicado", { description: errorItem });
        });
      }

      queryClient.invalidateQueries({ queryKey: ["cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["cuenta-corriente"] });
      queryClient.invalidateQueries({ queryKey: ["estado-pagos"] });
    },
    onError: (error) => {
      logError(error, "useProcesarResultadosTarjetaCentro");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });
};
