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

export const abrirReciboMultipleHtml = async (
  socioId: number,
  cuotaIds: number[],
) => {
  if (cuotaIds.length === 0) {
    throw new Error("Debe seleccionar al menos una cuota para imprimir el recibo");
  }

  const token = getToken();
  const url = `${apiClient.defaults.baseURL}/cobros/recibo/multiple/html`;

  const newWindow = window.open("", "_blank");
  if (newWindow) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        socioId,
        cuotaIds,
      }),
    });

    const html = await response.text();
    newWindow.document.write(html);
    newWindow.document.close();
  }
};

const TARJETA_CENTRO_MONTH_LETTER_MAP: Record<string, string> = {
  "01": "e",
  "02": "f",
  "03": "m",
  "04": "b",
  "05": "y",
  "06": "j",
  "07": "l",
  "08": "a",
  "09": "s",
  "10": "o",
  "11": "n",
  "12": "d",
};

const generarNombreTarjetaCentroFallback = (): string => {
  const partesFecha = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
  }).formatToParts(new Date());

  const dia = partesFecha.find((parte) => parte.type === "day")?.value ?? "01";
  const mes = partesFecha.find((parte) => parte.type === "month")?.value ?? "01";
  const letraMes = TARJETA_CENTRO_MONTH_LETTER_MAP[mes] ?? "e";

  return `C0019094.${dia}${letraMes}`;
};

const extraerNombreArchivo = (contentDisposition: string | null): string => {
  const fallback = generarNombreTarjetaCentroFallback();
  if (!contentDisposition) {
    return fallback;
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? fallback;
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
