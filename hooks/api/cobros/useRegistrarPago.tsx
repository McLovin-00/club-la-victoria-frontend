// hooks/api/cobros/useRegistrarPago.tsx
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { AxiosError } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";
import { Cuota } from "./useCuotas";

import { MetodoPago } from "./useMetodosPago";

interface PagoResponse {
  cuota: Cuota;
  pago: {
    id: number;
    montoPagado: number;
    metodoPago: MetodoPago | string;
    fechaPago: string;
    fechaEmisionCuota?: string;
  };
}

interface RegistrarPagoDto {
  cuotaId: number;
  metodoPagoId: number;
  observaciones?: string;
  montoPagado?: number;
}

export const useRegistrarPago = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<PagoResponse, AxiosError<{ message: string }>, RegistrarPagoDto>({
    mutationFn: async (data) => {
      const response = await apiClient.post<PagoResponse>("/cobros/pagos", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Pago registrado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["cuenta-corriente"] });
    },
    onError: (error) => {
      logError(error, "useRegistrarPago");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};

interface RegistrarPagoMultipleDto {
  cuotaIds: number[];
  metodoPagoId: number;
  observaciones?: string;
}

interface PagoMultipleResponse {
  pagosExitosos: number;
  errores: string[];
}

export const useRegistrarPagoMultiple = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    PagoMultipleResponse,
    AxiosError<{ message: string }>,
    RegistrarPagoMultipleDto
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
    },
    onError: (error) => {
      logError(error, "useRegistrarPagoMultiple");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
