import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/lib/api/client";
import { adaptError, logError } from "@/lib/errors/error.adapter";

export interface PagoAnualPayload {
  socioId: number;
  anio: number;
  metodoPagoId: number;
  observaciones?: string;
}

export interface PagoAnualResponse {
  cuotasGeneradas: number;
  cuotasPagadas: number;
  cuotasYaPagadas: number;
  totalPagado: number;
  periodosPagados: string[];
}

export const usePagoAnual = () => {
  const queryClient = useQueryClient();

  return useMutation<PagoAnualResponse, AxiosError<{ message: string }>, PagoAnualPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<PagoAnualResponse>("/cobros/pago-anual", payload);
      return data;
    },
    onSuccess: (result) => {
      const total = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
      }).format(result.totalPagado);

      toast.success("Pago anual registrado", {
        description: `${result.cuotasPagadas} cuotas pagadas · ${total}`,
      });

      queryClient.invalidateQueries({ queryKey: ["cuenta-corriente"] });
      queryClient.invalidateQueries({ queryKey: ["cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["estado-pagos"] });
      queryClient.invalidateQueries({ queryKey: ["morosos"] });
    },
    onError: (error) => {
      logError(error, "usePagoAnual");
      const uiError = adaptError(error);
      toast.error(uiError.title, { description: uiError.message });
    },
  });
};
