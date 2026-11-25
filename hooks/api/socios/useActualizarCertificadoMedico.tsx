import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";
import { adaptError, logError } from "@/lib/errors/error.adapter";

interface ActualizarCertificadoMedicoParams {
  socioId: number;
  temporadaId: string;
  certificadoMedicoPresentado: boolean;
}

export const useActualizarCertificadoMedico = () => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<{ message: string }>,
    ActualizarCertificadoMedicoParams
  >({
    mutationFn: async ({
      socioId,
      temporadaId,
      certificadoMedicoPresentado,
    }: ActualizarCertificadoMedicoParams) => {
      const { data } = await apiClient.patch(
        `/temporadas/${temporadaId}/socios/${socioId}/certificado-medico`,
        { certificadoMedicoPresentado },
      );
      return data;
    },
    onSuccess: (_, { temporadaId, certificadoMedicoPresentado }) => {
      queryClient.invalidateQueries({
        queryKey: ["socios-temporada", temporadaId],
      });
      toast.success(
        certificadoMedicoPresentado
          ? "Certificado médico marcado como presentado"
          : "Certificado médico marcado como pendiente",
      );
    },
    onError: (error) => {
      logError(error, "useActualizarCertificadoMedico");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });
};
