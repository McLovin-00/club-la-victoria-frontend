/**
 * Configuración global de manejo de errores para React Query
 */

import { toast } from "sonner";
import { adaptError, logError, parseApiError } from "./error.adapter";
import { BackendErrorCode } from "./error.types";
import type { NetworkMode } from '@tanstack/react-query';

export interface QueryClientConfig {
  defaultOptions: {
    queries: {
    retry: (failureCount: number, error: unknown) => boolean;
    staleTime: number;
    gcTime: number;
    refetchOnWindowFocus: boolean;
    refetchOnReconnect: boolean;
    networkMode: NetworkMode;
  };
  };
}

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
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        const noRetryStatuses = [400, 401, 403, 404, 422];
        const apiError = parseApiError(error);
        if (noRetryStatuses.includes(apiError.status)) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'online' as NetworkMode,
    },
  },
};
