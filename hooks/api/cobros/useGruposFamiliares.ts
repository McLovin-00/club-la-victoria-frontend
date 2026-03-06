import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

// ==================== TIPOS ====================

export interface SocioEnGrupo {
  id: number;
  nombre: string;
  apellido: string;
  estado?: string;
  dni?: string;
  telefono?: string;
}

export interface GrupoFamiliar {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  createdAt: string;
  updatedAt: string;
  socios?: SocioEnGrupo[];
}

export interface GrupoFamiliarConCantidad extends GrupoFamiliar {
  cantidadSocios: number;
}

export interface SocioSinGrupo {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
}

export interface CreateGrupoFamiliarDto {
  nombre: string;
  descripcion?: string;
  orden?: number;
}

export interface UpdateGrupoFamiliarDto {
  nombre?: string;
  descripcion?: string;
  orden?: number;
}

export interface AsignarSociosDto {
  socioIds: number[];
}

// ==================== HOOKS ====================

/**
 * Obtiene todos los grupos familiares ordenados por campo orden
 */
export const useGruposFamiliares = () => {
  return useQuery<GrupoFamiliarConCantidad[]>({
    queryKey: ["grupos-familiares"],
    queryFn: async () => {
      const { data } = await apiClient.get<GrupoFamiliarConCantidad[]>(
        "/grupos-familiares"
      );
      return data;
    },
    staleTime: STALE_TIME,
  });
};

/**
 * Obtiene un grupo familiar específico con sus socios
 */
export const useGrupoFamiliar = (id: number | null) => {
  return useQuery<GrupoFamiliar>({
    queryKey: ["grupo-familiar", id],
    queryFn: async () => {
      const { data } = await apiClient.get<GrupoFamiliar>(
        `/grupos-familiares/${id}`
      );
      return data;
    },
    enabled: id !== null,
    staleTime: STALE_TIME,
  });
};

/**
 * Obtiene la lista de socios sin grupo familiar
 */
export const useSociosSinGrupo = () => {
  return useQuery<SocioSinGrupo[]>({
    queryKey: ["socios-sin-grupo"],
    queryFn: async () => {
      const { data } = await apiClient.get<SocioSinGrupo[]>(
        "/grupos-familiares/socios-sin-grupo"
      );
      return data;
    },
    staleTime: STALE_TIME,
  });
};

/**
 * Crea un nuevo grupo familiar
 */
export const useCreateGrupoFamiliar = () => {
  const queryClient = useQueryClient();

  return useMutation<GrupoFamiliar, Error, CreateGrupoFamiliarDto>({
    mutationFn: async (dto: CreateGrupoFamiliarDto) => {
      const { data } = await apiClient.post<GrupoFamiliar>(
        "/grupos-familiares",
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-familiares"] });
    },
  });
};

/**
 * Actualiza un grupo familiar existente
 */
export const useUpdateGrupoFamiliar = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GrupoFamiliar,
    Error,
    { id: number; dto: UpdateGrupoFamiliarDto }
  >({
    mutationFn: async ({ id, dto }: { id: number; dto: UpdateGrupoFamiliarDto }) => {
      const { data } = await apiClient.patch<GrupoFamiliar>(
        `/grupos-familiares/${id}`,
        dto
      );
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["grupos-familiares"] });
      queryClient.invalidateQueries({ queryKey: ["grupo-familiar", id] });
    },
  });
};

/**
 * Elimina un grupo familiar
 */
export const useDeleteGrupoFamiliar = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/grupos-familiares/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grupos-familiares"] });
      queryClient.invalidateQueries({ queryKey: ["socios-sin-grupo"] });
    },
  });
};

/**
 * Asigna socios a un grupo familiar
 */
export const useAsignarSociosGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { grupo: GrupoFamiliar; sociosAsignados: number },
    Error,
    { grupoId: number; socioIds: number[] }
  >({
    mutationFn: async ({ grupoId, socioIds }) => {
      const { data } = await apiClient.patch<{
        grupo: GrupoFamiliar;
        sociosAsignados: number;
      }>(`/grupos-familiares/${grupoId}/socios`, { socioIds });
      return data;
    },
    onSuccess: (_, { grupoId }) => {
      queryClient.invalidateQueries({ queryKey: ["grupos-familiares"] });
      queryClient.invalidateQueries({ queryKey: ["grupo-familiar", grupoId] });
      queryClient.invalidateQueries({ queryKey: ["socios-sin-grupo"] });
      queryClient.invalidateQueries({ queryKey: ["socios-en-grupo", grupoId] });
    },
  });
};

/**
 * Desasigna un socio de su grupo familiar
 */
export const useDesasignarSocio = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { grupoId: number; socioId: number }>({
    mutationFn: async ({ grupoId, socioId }) => {
      await apiClient.delete(`/grupos-familiares/${grupoId}/socios/${socioId}`);
    },
    onSuccess: (_, { grupoId }) => {
      queryClient.invalidateQueries({ queryKey: ["grupos-familiares"] });
      queryClient.invalidateQueries({ queryKey: ["grupo-familiar", grupoId] });
      queryClient.invalidateQueries({ queryKey: ["socios-sin-grupo"] });
      queryClient.invalidateQueries({ queryKey: ["socios-en-grupo", grupoId] });
    },
  });
};

/**
 * Obtiene los socios de un grupo familiar específico
 */
export const useSociosEnGrupo = (grupoId: number | null) => {
  return useQuery<SocioEnGrupo[]>({
    queryKey: ["socios-en-grupo", grupoId],
    queryFn: async () => {
      if (!grupoId) return [];
      const { data } = await apiClient.get<GrupoFamiliar>(
        `/grupos-familiares/${grupoId}`
      );
      return data.socios || [];
    },
    enabled: grupoId !== null,
    staleTime: STALE_TIME,
  });
};
