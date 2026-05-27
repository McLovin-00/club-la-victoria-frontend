import { useQueries } from "@tanstack/react-query";
import { useSociosEnGrupo } from "./useGruposFamiliares";
import { CuentaCorriente } from "./useCuentaCorriente";
import { EstadoCuota } from "./useCuotas";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

// ==================== TIPOS ====================

export interface MiembroConCuenta {
  socioInfo: {
    id: number;
    nombre: string;
    apellido: string;
    estado?: string;
    dni?: string;
    telefono?: string;
  };
  cuenta: CuentaCorriente | null;
}

export interface CuentasGrupoData {
  miembros: MiembroConCuenta[];
  totalDeuda: number;
  totalPagado: number;
  sociosAlDia: number;
  sociosEnDeuda: number;
  /** Crédito grupal disponible del grupo familiar, calculado por el backend */
  creditoGrupal?: number;
}

export interface MemberError {
  socioId: number;
  error: Error;
}

// ==================== HOOK ====================

export const useCuentasGrupoFamiliar = (grupoId: number | null, anio: number) => {
  // Get the list of members in the group
  const { data: socios, isLoading: isLoadingSocios, error: sociosError } =
    useSociosEnGrupo(grupoId);

  // Fetch group credit summary from the backend
  const [grupoDataResult] = useQueries({
    queries: [
      {
        queryKey: ["grupo-familiar-credito", grupoId],
        queryFn: async () => {
          if (!grupoId) return null;
          const { data } = await apiClient.get<{
            id: number;
            creditoGrupal?: number;
          }>(`/cobradores/mobile/grupos-familiares/${grupoId}`);
          return data;
        },
        enabled: !!grupoId,
        staleTime: STALE_TIME,
      },
    ],
  });

  // Create queries array (empty if no socios) - MUST happen before useQueries
  const queries = (socios ?? []).map((socio) => ({
    queryKey: ["cuenta-corriente", socio.id, anio],
    queryFn: async () => {
      const { data } = await apiClient.get<CuentaCorriente>(
        `/cobros/cuenta-corriente/${socio.id}`,
        {
          params: { anio },
        }
      );
      return data;
    },
    enabled: !!socio.id && !!grupoId,
    staleTime: STALE_TIME,
  }));

  // ALWAYS call useQueries (hooks rules requirement)
  const results = useQueries({
    queries,
  });

  // NOW we can check for empty state after all hooks are called
  if (!grupoId || !socios || socios.length === 0) {
    return {
      cuentas: {
        miembros: [],
        totalDeuda: 0,
        totalPagado: 0,
        sociosAlDia: 0,
        sociosEnDeuda: 0,
      },
      isLoading: isLoadingSocios,
      error: sociosError,
      memberErrors: [],
    };
  }

  // Check if any query is still loading
  const isLoading = isLoadingSocios || results.some((r) => r.isLoading);

  // Aggregate totals
  let totalDeuda = 0;
  let totalPagado = 0;
  let sociosAlDia = 0;
  let sociosEnDeuda = 0;
  const memberErrors: MemberError[] = [];

  const miembros: MiembroConCuenta[] = results.map((result, index) => {
    const socio = socios![index];

    if (result.error) {
      memberErrors.push({
        socioId: socio.id,
        error: result.error as Error,
      });
      // Handle error by returning empty cuenta (zeros)
      return {
        socioInfo: socio,
        cuenta: null,
      };
    }

    const cuenta = result.data || null;

    // Aggregate totals from cuenta data
    if (cuenta) {
      totalDeuda += cuenta.totalDeuda;
      totalPagado += cuenta.totalPagado;

      // Count socios with no debt (totalDeuda = 0 and all cuotas are PAGADA)
      const hasPendingCuotas = cuenta.cuotas.some(
        (cuota) => cuota.estado === EstadoCuota.PENDIENTE
      );

      if (!hasPendingCuotas) {
        sociosAlDia++;
      } else {
        sociosEnDeuda++;
      }
    }

    return {
      socioInfo: socio,
      cuenta,
    };
  });

  return {
    cuentas: {
      miembros,
      totalDeuda,
      totalPagado,
      sociosAlDia,
      sociosEnDeuda,
      creditoGrupal: grupoDataResult?.data?.creditoGrupal,
    },
    isLoading,
    error: isLoading ? undefined : sociosError,
    memberErrors,
  };
};
