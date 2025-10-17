"use client";

import { usePaginatedSearchQuery } from "@/hooks/api/common/usePaginatedSearchQuery";
import { SocioWithFoto } from "@/lib/types";

export const useSociosDisponiblesTemporada = (temporadaId: string | null) => {
  return usePaginatedSearchQuery<SocioWithFoto>({
    queryKey: `socios`,
    url: temporadaId ? `/temporadas/${temporadaId}/socios-disponibles` : "",
    initialLimit: 10,
  });
};
