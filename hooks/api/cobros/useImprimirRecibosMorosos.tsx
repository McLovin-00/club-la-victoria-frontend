import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import apiClient from "@/lib/api/client";
import { getToken } from "@/lib/utils/token-storage";
import { adaptError, logError } from "@/lib/errors/error.adapter";

interface ImprimirRecibosMorososRequest {
  periodos: string[];
  socioIds?: number[];
}

export const useImprimirRecibosMorosos = () => {
  return useMutation<{ html: string }, Error, ImprimirRecibosMorososRequest>({
    mutationFn: async (data) => {
      const token = getToken();
      const url = `${apiClient.defaults.baseURL}/cobros/morosos/recibo/html`;
      const newWindow = window.open("", "_blank");

      if (!newWindow) {
        throw new Error("El navegador bloqueó la ventana de impresión. Permite ventanas emergentes.");
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        newWindow.close();
        throw new Error(errorBody || `Error ${response.status}`);
      }

      const html = await response.text();
      newWindow.document.write(html);
      newWindow.document.close();
      return { html };
    },
    onSuccess: () => {
      toast.success("Talonario generado", {
        description: "Se abrió una nueva ventana con el talonario listo para imprimir.",
      });
    },
    onError: (error) => {
      logError(error, "useImprimirRecibosMorosos");
      const uiError = adaptError(error instanceof AxiosError ? error : new Error(error.message));
      toast.error(uiError.title, { description: uiError.message });
    },
  });
};
