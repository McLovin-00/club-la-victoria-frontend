import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export interface ResumenComision {
  cobradorId: number;
  base: number;
  comision: number;
  operaciones: number;
}

export interface ConfigComisionPayload {
  porcentaje: number;
  vigenteDesde: string;
}

export const useResumenComision = (
  cobradorId: number,
  desde: string,
  hasta: string,
) => {
  return useQuery<ResumenComision>({
    queryKey: ["cobradores", cobradorId, "comision", desde, hasta],
    queryFn: async () => {
      const { data } = await apiClient.get<ResumenComision>(
        `/cobradores/${cobradorId}/comision/resumen`,
        { params: { desde, hasta } },
      );
      return data;
    },
    enabled: cobradorId > 0,
    staleTime: STALE_TIME,
  });
};

export const useConfigurarComision = (cobradorId: number) => {
  return useMutation({
    mutationFn: async (payload: ConfigComisionPayload) => {
      const { data } = await apiClient.post(
        `/cobradores/${cobradorId}/comision/config`,
        payload,
      );
      return data;
    },
  });
};
