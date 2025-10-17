/**
 * Mapeo de códigos de error del backend a mensajes en español
 * Estos mensajes se muestran al usuario final
 */

import { BackendErrorCode } from "./error.types";

export const ERROR_MESSAGES: Record<
  BackendErrorCode | "ERR_UNKNOWN" | "ERR_NETWORK" | "ERR_TIMEOUT",
  string
> = {
  // Generales
  ERR_INTERNAL_SERVER:
    "Error interno del servidor. Por favor, intente nuevamente más tarde.",
  ERR_UNEXPECTED: "Ocurrió un error inesperado. Por favor, contacte a soporte.",
  ERR_UNKNOWN: "Ocurrió un error desconocido. Por favor, intente nuevamente.",

  // Autenticación
  ERR_USER_NOT_FOUND: "Usuario no encontrado. Verifique sus credenciales.",
  ERR_INVALID_PASSWORD: "La contraseña ingresada es incorrecta.",
  ERR_UNAUTHORIZED: "No tiene permisos para realizar esta acción.",
  ERR_TOKEN_INVALID: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",

  // Validación
  ERR_VALIDATION: "Los datos ingresados no son válidos. Verifique los campos marcados.",
  ERR_INVALID_DNI: "El DNI ingresado no es válido. Debe contener 8 dígitos numéricos.",
  ERR_DNI_EXISTS: "Ya existe un socio registrado con este DNI.",

  // Recursos no encontrados
  ERR_SOCIO_NOT_FOUND: "El socio solicitado no fue encontrado.",
  ERR_TEMPORADA_NOT_FOUND: "La temporada solicitada no fue encontrada.",
  ERR_REGISTRO_NOT_FOUND: "El registro de ingreso no fue encontrado.",
  ERR_ASOCIACION_NOT_FOUND: "La asociación no fue encontrada.",

  // Negocio
  ERR_ALREADY_REGISTERED_TODAY: "Esta persona ya registró su ingreso hoy.",
  ERR_OVERLAPPING_SEASONS:
    "Las fechas de la temporada se solapan con otra temporada existente.",
  ERR_CANNOT_DELETE_SOCIO:
    "No se puede eliminar el socio porque tiene registros asociados.",

  // Base de datos
  ERR_DB_CONSTRAINT: "La operación viola una restricción de la base de datos.",
  ERR_DB_CONNECTION: "Error de conexión con la base de datos. Intente nuevamente.",
  ERR_DB_UNIQUE: "El valor ingresado ya existe en el sistema.",
  ERR_DB_FOREIGN_KEY:
    "La operación no se puede completar debido a dependencias en otros registros.",

  // Errores de red
  ERR_NETWORK: "Error de conexión. Verifique su conexión a internet.",
  ERR_TIMEOUT: "La operación tardó demasiado tiempo. Por favor, intente nuevamente.",
};

// Títulos cortos para toasts/alerts
export const ERROR_TITLES: Record<"error" | "warning" | "info", string> = {
  error: "Error",
  warning: "Advertencia",
  info: "Información",
};
