// hooks/api/cobros/useTalonario.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";
import { getToken } from "@/lib/utils/token-storage";
import { Cuota } from "./useCuotas";

export const useTalonario = (periodo: string) => {
  return useQuery<Cuota[]>({
    queryKey: ["talonario", periodo],
    queryFn: async () => {
      const { data } = await apiClient.get<Cuota[]>("/cobros/talonario", {
        params: { periodo },
      });
      return data;
    },
    enabled: !!periodo,
    staleTime: STALE_TIME,
  });
};

// Función para abrir el talonario HTML en una nueva ventana
export const abrirTalonarioHtml = async (periodo: string) => {
  const token = getToken();
  const url = `${apiClient.defaults.baseURL}/cobros/talonario/html?periodo=${periodo}`;
  
  // Abrir en nueva ventana con autenticación
  const newWindow = window.open("", "_blank");
  if (newWindow) {
    // Hacer la petición con el token
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const html = await response.text();
    newWindow.document.write(html);
    newWindow.document.close();
  }
};

// Funcion para abrir el recibo HTML individual en una nueva ventana
export const abrirReciboHtml = async (periodo: string, socioId: number) => {
  const token = getToken();
  const url = `${apiClient.defaults.baseURL}/cobros/recibo/html?periodo=${encodeURIComponent(periodo)}&socioId=${socioId}`;

  // Abrir en nueva ventana con autenticacion
  const newWindow = window.open("", "_blank");
  if (newWindow) {
    // Hacer la peticion con el token
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const html = await response.text();
    newWindow.document.write(html);
    newWindow.document.close();
  }
};

const extraerNombreArchivo = (contentDisposition: string | null): string => {
  if (!contentDisposition) {
    return 'tarjeta-centro.23f';
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? 'tarjeta-centro.23f';
};

export const descargarArchivoTarjetaCentro23f = async (periodo: string) => {
  const token = getToken();
  const url = `${apiClient.defaults.baseURL}/cobros/tarjeta-centro/archivo?periodo=${encodeURIComponent(periodo)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(detalle || 'No fue posible generar el archivo .23f');
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('Content-Disposition');
  const fileName = extraerNombreArchivo(contentDisposition);

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};
