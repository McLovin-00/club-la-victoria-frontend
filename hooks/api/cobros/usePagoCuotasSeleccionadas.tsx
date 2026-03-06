import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/lib/api/client";
import { adaptError, logError } from "@/lib/errors/error.adapter";


export interface PagoMetodoMontoPayload {
  metodoPagoId: number;
  monto: number;
}

interface RegistrarPagoCuotasSeleccionadasPayload {
  socioId: number;
  cuotaIds: number[];
  pagos: PagoMetodoMontoPayload[];
  observaciones?: string;
}

interface RegistrarPagoCuotasSeleccionadasResponse {
  cuotasPagadas: number;
  pagosGenerados: number;
  totalPagado: number;
}

export const usePagoCuotasSeleccionadas = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RegistrarPagoCuotasSeleccionadasResponse,
    AxiosError<{ message: string }>,
    RegistrarPagoCuotasSeleccionadasPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<RegistrarPagoCuotasSeleccionadasResponse>(
        "/cobros/pagos/cuotas-seleccion",
        payload,
      );
      return data;
    },
    onSuccess: (result) => {
      toast.success("Pago masivo registrado", {
        description: `${result.cuotasPagadas} cuotas pagadas por $${Math.round(result.totalPagado)}`,
      });

      queryClient.invalidateQueries({ queryKey: ["cuenta-corriente"] });
      queryClient.invalidateQueries({ queryKey: ["cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["estado-pagos"] });
    },
    onError: (error) => {
      logError(error, "usePagoCuotasSeleccionadas");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });
};
