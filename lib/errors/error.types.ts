/**
 * Tipos para manejo de errores sincronizado con backend
 * Fuente de verdad: backend/src/constants/errors/error-messages.ts
 */

// Códigos de error del backend (sincronizados)
export const BackendErrorCode = {
  // Generales
  INTERNAL_SERVER_ERROR: "ERR_INTERNAL_SERVER",
  UNEXPECTED_ERROR: "ERR_UNEXPECTED",

  // Autenticación
  USER_NOT_FOUND: "ERR_USER_NOT_FOUND",
  INVALID_PASSWORD: "ERR_INVALID_PASSWORD",
  UNAUTHORIZED: "ERR_UNAUTHORIZED",
  TOKEN_INVALID: "ERR_TOKEN_INVALID",

  // Validación
  VALIDATION_ERROR: "ERR_VALIDATION",
  INVALID_DNI: "ERR_INVALID_DNI",
  DNI_ALREADY_EXISTS: "ERR_DNI_EXISTS",

  // Recursos no encontrados
  SOCIO_NOT_FOUND: "ERR_SOCIO_NOT_FOUND",
  TEMPORADA_NOT_FOUND: "ERR_TEMPORADA_NOT_FOUND",
  REGISTRO_NOT_FOUND: "ERR_REGISTRO_NOT_FOUND",
  ASOCIACION_NOT_FOUND: "ERR_ASOCIACION_NOT_FOUND",

  // Negocio
  SOCIO_ALREADY_REGISTERED_TODAY: "ERR_ALREADY_REGISTERED_TODAY",
  OVERLAPPING_SEASONS: "ERR_OVERLAPPING_SEASONS",
  CANNOT_DELETE_SOCIO: "ERR_CANNOT_DELETE_SOCIO",

  // Base de datos
  DB_CONSTRAINT_ERROR: "ERR_DB_CONSTRAINT",
  DB_CONNECTION_ERROR: "ERR_DB_CONNECTION",
  DB_UNIQUE_VIOLATION: "ERR_DB_UNIQUE",
  DB_FOREIGN_KEY_VIOLATION: "ERR_DB_FOREIGN_KEY",
} as const;

export type BackendErrorCode =
  (typeof BackendErrorCode)[keyof typeof BackendErrorCode];

// Estructura de error devuelto por el backend
export interface BackendErrorResponse {
  statusCode: number;
  message: string;
  code?: BackendErrorCode;
  error?: string; // "Bad Request", "Internal Server Error", etc.
}

// Error de API parseado y tipado
export interface ApiError {
  status: number;
  code: BackendErrorCode | "ERR_UNKNOWN";
  message: string;
  timestamp: Date;
}

// Error para mostrar al usuario (UI-friendly)
export interface UiError {
  title: string;
  message: string;
  variant: "error" | "warning" | "info";
  actionable: boolean; // ¿El usuario puede hacer algo al respecto?
}

// Tipo de error de Axios
export interface AxiosErrorData {
  response?: {
    data?: BackendErrorResponse;
    status?: number;
  };
  message?: string;
  code?: string; // 'ERR_NETWORK', 'ECONNABORTED', etc.
}
