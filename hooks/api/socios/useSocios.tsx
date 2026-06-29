// hooks/useSocios.ts
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePaginatedSearchQuery } from "@/hooks/api/common/usePaginatedSearchQuery";
import { SocioWithFoto } from "@/lib/types";
import apiClient from "@/lib/api/client";

export const useSocios = () => {
  const [filtroCategoriaId, setFiltroCategoriaId] = useState<number | undefined>();
  const [filtroEstado, setFiltroEstado] = useState<string | undefined>();
  const [filtroTarjetaCentro, setFiltroTarjetaCentro] = useState<boolean | undefined>();

  const hayFiltrosActivos =
    filtroCategoriaId !== undefined ||
    filtroEstado !== undefined ||
    filtroTarjetaCentro !== undefined;

  const limpiarFiltros = useCallback(() => {
    setFiltroCategoriaId(undefined);
    setFiltroEstado(undefined);
    setFiltroTarjetaCentro(undefined);
  }, []);

  const extraParams: Record<string, unknown> = {};
  if (filtroCategoriaId !== undefined) extraParams.categoriaId = filtroCategoriaId;
  if (filtroEstado !== undefined) extraParams.estado = filtroEstado;
  if (filtroTarjetaCentro !== undefined) extraParams.tarjetaCentro = filtroTarjetaCentro;

  const result = usePaginatedSearchQuery<SocioWithFoto>({
    queryKey: "socios",
    url: "/socios",
    initialLimit: 10,
    extraParams,
  });

  return {
    ...result,
    filtroCategoriaId,
    setFiltroCategoriaId: (value: number | undefined) => {
      setFiltroCategoriaId(value);
      result.setPage(1);
    },
    filtroEstado,
    setFiltroEstado: (value: string | undefined) => {
      setFiltroEstado(value);
      result.setPage(1);
    },
    filtroTarjetaCentro,
    setFiltroTarjetaCentro: (value: boolean | undefined) => {
      setFiltroTarjetaCentro(value);
      result.setPage(1);
    },
    hayFiltrosActivos,
    limpiarFiltros,
  };
};

export const useSocioById = (id: number) => {
  return useQuery({
    queryKey: ["socio", id],
    enabled: Number.isInteger(id) && id > 0,
    queryFn: async () => {
      const { data } = await apiClient.get<SocioWithFoto>(`/socios/${id}`);
      return data;
    },
  });
};

