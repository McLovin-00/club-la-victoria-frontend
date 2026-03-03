// hooks/api/categorias/useUpdateCategoria.tsx
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { AxiosError } from "axios";
import { adaptError, logError } from "@/lib/errors/error.adapter";
import { CategoriaSocio } from "./useCategorias";

// Solo se permite actualizar el monto mensual
  // Las categorías son fijas según el estatuto del club
  interface UpdateCategoriaDto {
  montoMensual: number;
}

export const useUpdateCategoria = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    CategoriaSocio,
    AxiosError<{ message: string }>,
    { id: number; data: UpdateCategoriaDto }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<CategoriaSocio>(`/categorias-socio/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Categoría actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categoria", variables.id] });
    },
    onError: (error) => {
      logError(error, "useUpdateCategoria");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
