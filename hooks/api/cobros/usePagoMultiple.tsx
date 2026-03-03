import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { AxiosError } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";
import { MetodoPago } from "./useRegistrarPago";

interface PagoMultipleRequest {
  barcodes: string[];
  metodoPago: MetodoPago;
  observaciones?: string;
}

interface PagoMultipleResponse {
  pagosExitosos: number;
  errores: string[];
}

export const usePagoMultiple = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    PagoMultipleResponse,
    AxiosError<{ message: string }>,
    PagoMultipleRequest
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post<PagoMultipleResponse>(
        "/cobros/pagos/multiple",
        data
      );
      return response.data;
    },
    onSuccess: (result) => {
      toast.success(`${result.pagosExitosos} pagos registrados exitosamente`);

      if (result.errores.length > 0) {
        result.errores.forEach((err) => {
          toast.warning("Error en pago", { description: err });
        });
      }

      queryClient.invalidateQueries({ queryKey: ["cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["estado-pagos"] });
    },
    onError: (error) => {
      logError(error, "usePagoMultiple");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
