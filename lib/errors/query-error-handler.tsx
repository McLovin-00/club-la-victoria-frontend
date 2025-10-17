/**
 * Configuración global de manejo de errores para React Query
 */

import { toast } from "sonner";
import { adaptError, logError, parseApiError } from "./error.adapter";
import { BackendErrorCode } from "./error.types";

/**
 * Maneja errores globalmente en React Query
 * Se ejecuta automáticamente cuando cualquier query/mutation falla
 */
export function handleQueryError(error: unknown, queryKey?: unknown): void {
  // Log para debugging (solo en dev)
  logError(error, `Query: ${JSON.stringify(queryKey)}`);

  // Adaptar error a formato UI-friendly
  const uiError = adaptError(error);

  // No mostrar toast para errores de autenticación (el interceptor ya redirige)
  const apiError = parseApiError(error);
  if (
    apiError.code === BackendErrorCode.UNAUTHORIZED ||
    apiError.code === BackendErrorCode.TOKEN_INVALID
  ) {
    return; // El interceptor 401 ya maneja esto
  }

  // Mostrar toast con mensaje de error
  toast.error(uiError.title, {
    description: uiError.message,
    duration: uiError.actionable ? 5000 : 3000,
  });
}

/**
 * Configuración de React Query con manejo de errores
 * Usar en el QueryClientProvider
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        // No reintentar en errores de autenticación o validación
        const noRetryStatuses = [400, 401, 403, 404, 422];
        const apiError = parseApiError(error);
        if (noRetryStatuses.includes(apiError.status)) {
          return false;
        }
        // Máximo 2 reintentos para otros errores
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos por defecto
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
    },
  },
};
