import { usePaginatedSearchQuery } from "@/hooks/api/common/usePaginatedSearchQuery";
import { SocioWithFoto } from "@/lib/types";

export const useSociosDisponibles = () => {
  return usePaginatedSearchQuery<SocioWithFoto>({
    queryKey: "socios",
    url: "/socios",
    initialLimit: 10,
  });
};