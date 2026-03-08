import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export interface MovimientoCobrador {
  id: number;
  tipoMovimiento: "COMISION_GENERADA" | "PAGO_A_COBRADOR" | "AJUSTE";
  monto: number;
  observacion?: string;
  referencia?: string;
  createdAt: string;
  detalleCobro?: {
    fechaHoraCobro: string;
    socio?: {
      id: number;
      nombre: string;
      apellido: string;
    };
    cuotas: Array<{
      cuotaId?: number;
      periodo?: string;
      monto: number;
    }>;
  };
}

export interface CuentaCorrienteCobrador {
  cobradorId: number;
  saldo: number;
  movimientos: MovimientoCobrador[];
}

export interface RegistrarMovimientoPayload {
  monto: number;
  usuarioRegistra?: string;
  observacion?: string;
  referencia?: string;
}

export const useCuentaCorrienteCobrador = (cobradorId: number) => {
  return useQuery<CuentaCorrienteCobrador>({
    queryKey: ["cobradores", cobradorId, "cuenta-corriente"],
    queryFn: async () => {
      const { data } = await apiClient.get<CuentaCorrienteCobrador>(
        `/cobradores/${cobradorId}/cuenta-corriente`,
      );
      return data;
    },
    enabled: cobradorId > 0,
    staleTime: STALE_TIME,
  });
};

export const useRegistrarPagoCobrador = (cobradorId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegistrarMovimientoPayload) => {
      const { data } = await apiClient.post(
        `/cobradores/${cobradorId}/cuenta-corriente/pagos`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cobradores", cobradorId, "cuenta-corriente"],
      });
    },
  });
};

export const useRegistrarAjusteCobrador = (cobradorId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegistrarMovimientoPayload) => {
      const { data } = await apiClient.post(
        `/cobradores/${cobradorId}/cuenta-corriente/ajustes`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cobradores", cobradorId, "cuenta-corriente"],
      });
    },
  });
};
