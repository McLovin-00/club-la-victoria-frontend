// hooks/useSocios.ts
import { useQuery } from "@tanstack/react-query";
import { usePaginatedSearchQuery } from "@/hooks/api/common/usePaginatedSearchQuery";
import { SocioWithFoto } from "@/lib/types";
import apiClient from "@/lib/api/client";

// export interface Socio {
//   id: number;
//   nombre: string;
//   apellido: string;
//   email: string;
// }

export const useSocios = () => {
  return usePaginatedSearchQuery<SocioWithFoto>({
    queryKey: "socios",
    url: "/socios",
    initialLimit: 10,
  });
};

export const useSocioById = (id: number) => {
  return useQuery({
    queryKey: ["socio", id],
    queryFn: async () => {
      const { data } = await apiClient.get<SocioWithFoto>(`/socios/${id}`);
      return data;
    },
  });
};

