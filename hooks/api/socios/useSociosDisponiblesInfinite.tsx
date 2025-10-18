import { useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { SocioWithFoto } from "@/lib/types";
import { useMemo } from "react";
import { STALE_TIME } from "@/lib/constants";

interface SociosDisponiblesParams {
  temporadaId: string;
  search?: string;
  limit?: number;
}

interface SociosDisponiblesResponse {
  socios: SocioWithFoto[];
  paginacion: {
    paginaActual: number;
    totalPaginas: number;
    totalElementos: number;
    elementosPorPagina: number;
    tieneSiguientePagina: boolean;
    tieneAnteriorPagina: boolean;
  };
}

export const useSociosDisponiblesInfinite = ({ 
  temporadaId, 
  search, 
  limit = 10 
}: SociosDisponiblesParams) => {
  const query = useInfiniteQuery<SociosDisponiblesResponse>({
    queryKey: ["socios-disponibles-infinite", temporadaId, search, limit],
    queryFn: async ({ pageParam = 1 }: { pageParam: unknown }) => {
      const page = pageParam as number;
      if (!temporadaId) {
        return {
          socios: [],
          paginacion: {
            paginaActual: 1,
            totalPaginas: 0,
            totalElementos: 0,
            elementosPorPagina: limit,
            tieneSiguientePagina: false,
            tieneAnteriorPagina: false
          }
        };
      }

      const response = await apiClient.get<SociosDisponiblesResponse>(
        `/socios/disponibles-para-temporada/${temporadaId}`,
        {
          params: {
            pagina: page,
            limite: limit,
            ...(search && { busqueda: search })
          }
        }
      );
      return response.data;
    },
    enabled: !!temporadaId,
    staleTime: STALE_TIME,
    getNextPageParam: (lastPage) => {
      if (lastPage.paginacion.tieneSiguientePagina) {
        return lastPage.paginacion.paginaActual + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const allSocios = useMemo(() => {
    return query.data?.pages.flatMap((page: SociosDisponiblesResponse) => page.socios) || [];
  }, [query.data]);

  // Get pagination info from the last page
  const paginationInfo = useMemo(() => {
    const lastPage = query.data?.pages[query.data.pages.length - 1] as SociosDisponiblesResponse | undefined;
    return lastPage?.paginacion || null;
  }, [query.data]);

  return {
    ...query,
    socios: allSocios,
    pagination: paginationInfo,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};
