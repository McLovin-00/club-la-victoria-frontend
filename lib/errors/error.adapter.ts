/**
 * Adaptador central para manejo de errores
 * Convierte cualquier error a un formato tipado y UI-friendly
 */

import { AxiosError } from "axios";
import {
  ApiError,
  UiError,
  BackendErrorCode,
  BackendErrorResponse,
} from "./error.types";
import { ERROR_MESSAGES, ERROR_TITLES } from "./error-messages";

/**
 * Determina si un código de error es válido del backend
 */
function isValidBackendCode(code: unknown): code is BackendErrorCode {
  if (typeof code !== "string") return false;
  return Object.values(BackendErrorCode).includes(code as BackendErrorCode);
}

/**
 * Parsea un error de Axios a ApiError tipado
 */
export function parseApiError(error: unknown): ApiError {
  // Error de Axios con respuesta del backend
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as BackendErrorResponse;
    const status = error.response.status;

    // Intentar extraer código de error
    const code = isValidBackendCode(data.code) ? data.code : "ERR_UNKNOWN";

    // SIEMPRE usar el mensaje del backend cuando está disponible
    return {
      status,
      code,
      message: data.message || ERROR_MESSAGES[code],
      timestamp: new Date(),
    };
  }

  // Error de red (sin respuesta del servidor)
  if (error instanceof AxiosError && error.code === "ERR_NETWORK") {
    return {
      status: 0,
      code: "ERR_UNKNOWN",
      message: ERROR_MESSAGES.ERR_NETWORK,
      timestamp: new Date(),
    };
  }

  // Timeout
  if (error instanceof AxiosError && error.code === "ECONNABORTED") {
    return {
      status: 408,
      code: "ERR_UNKNOWN",
      message: ERROR_MESSAGES.ERR_TIMEOUT,
      timestamp: new Date(),
    };
  }

  // Error genérico de JavaScript
  if (error instanceof Error) {
    return {
      status: 500,
      code: "ERR_UNKNOWN",
      message: error.message || ERROR_MESSAGES.ERR_UNEXPECTED,
      timestamp: new Date(),
    };
  }

  // Error desconocido
  return {
    status: 500,
    code: "ERR_UNKNOWN",
    message: ERROR_MESSAGES.ERR_UNKNOWN,
    timestamp: new Date(),
  };
}

/**
 * Convierte ApiError a UiError para mostrar al usuario
 */
export function toUiError(apiError: ApiError): UiError {
  const { code, status } = apiError;

  // Determinar variante según el tipo de error
  let variant: UiError["variant"] = "error";
  let actionable = false;

  // Errores de validación son menos graves
  if (
    code === BackendErrorCode.VALIDATION_ERROR ||
    code === BackendErrorCode.INVALID_DNI ||
    status === 400
  ) {
    variant = "warning";
    actionable = true; // Usuario puede corregir los datos
  }

  // Errores de autenticación son informativos
  if (
    code === BackendErrorCode.UNAUTHORIZED ||
    code === BackendErrorCode.TOKEN_INVALID ||
    status === 401
  ) {
    variant = "info";
    actionable = true; // Usuario puede reloguarse
  }

  // Errores de red son temporales
  if (status === 0 || status === 408) {
    variant = "warning";
    actionable = true; // Usuario puede reintentar
  }

  // Usar SIEMPRE el mensaje del backend (ya viene en apiError.message)
  return {
    title: ERROR_TITLES[variant],
    message: apiError.message, // El mensaje ya viene del backend en parseApiError
    variant,
    actionable,
  };
}

/**
 * Adaptador principal: convierte cualquier error a UiError
 * Esta es la función que debes usar en tus hooks y componentes
 */
export function adaptError(error: unknown): UiError {
  const apiError = parseApiError(error);
  return toUiError(apiError);
}

/**
 * Utility para logging de errores (solo en development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    // Logging removed: console statements were removed across the app.
    // Keep parsing to ensure any side-effects (none expected here).
    const apiError = parseApiError(error);
    void apiError;
  }

  // TODO: En producción, enviar a servicio de logging (Sentry, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   sentryClient.captureException(error, { extra: { context } });
  // }
}
