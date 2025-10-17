// Utilidades centralizadas para manejo de errores
// TODO: Migrate to new error handling system in lib/errors/

const ERROR_MESSAGES = {
  SERVER_ERROR: 'Error del servidor. Por favor, intente nuevamente.',
  VALIDATION_ERROR: 'Error de validación. Verifique los datos ingresados.',
  UNAUTHORIZED: 'No autorizado. Por favor, inicie sesión.',
  NOT_FOUND: 'Recurso no encontrado.',
  TIMEOUT: 'Tiempo de espera agotado. Por favor, intente nuevamente.',
  NETWORK_ERROR: 'Error de red. Verifique su conexión.',
  DUPLICATE_DNI: 'Ya existe un socio con este DNI.',
  DUPLICATE_EMAIL: 'Ya existe un socio con este email.',
};

// Clase personalizada para errores de API
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Clase para errores de validación
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Función para manejar errores de fetch
export const handleFetchError = async (response: Response): Promise<never> => {
  let errorMessage = ERROR_MESSAGES.SERVER_ERROR;
  let errorCode: string | undefined;
  let errorData: { message?: string; code?: string } | null = null;

  try {
    errorData = await response.json();
    errorMessage = errorData?.message || errorMessage;
    errorCode = errorData?.code;
  } catch {
    // Si no se puede parsear el JSON, usar mensaje por defecto
  }

  switch (response.status) {
    case 400:
      errorMessage = errorData?.message || ERROR_MESSAGES.VALIDATION_ERROR;
      break;
    case 401:
      errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
      break;
    case 404:
      errorMessage = ERROR_MESSAGES.NOT_FOUND;
      break;
    case 408:
      errorMessage = ERROR_MESSAGES.TIMEOUT;
      break;
    case 409:
      if (errorCode === 'DUPLICATE_DNI') {
        errorMessage = ERROR_MESSAGES.DUPLICATE_DNI;
      } else if (errorCode === 'DUPLICATE_EMAIL') {
        errorMessage = ERROR_MESSAGES.DUPLICATE_EMAIL;
      }
      break;
    case 422:
      errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
      break;
    case 500:
    default:
      errorMessage = ERROR_MESSAGES.SERVER_ERROR;
      break;
  }

  throw new ApiError(errorMessage, response.status, errorCode);
};

// Función para manejar errores de red
export const handleNetworkError = (error: unknown): never => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0);
  }
  
  if (error instanceof ApiError) {
    throw error;
  }
  
  throw new ApiError(
    error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR,
    500
  );
};

// Función para validar respuesta de API
export const validateApiResponse = <T>(data: unknown): T => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Respuesta de API inválida');
  }
  return data as T;
};

// Función para formatear errores para mostrar al usuario
export const formatErrorForUser = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return ERROR_MESSAGES.SERVER_ERROR;
};

// Función para logging de errores (para desarrollo)
export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR${context ? ` - ${context}` : ''}]:`, error);
  }
};

// Hook personalizado para manejo de errores en componentes
export const createErrorHandler = (onError?: (error: string) => void) => {
  return (error: unknown, context?: string) => {
    const errorMessage = formatErrorForUser(error);
    logError(error, context);
    
    if (onError) {
      onError(errorMessage);
    }
    
    return errorMessage;
  };
};

// Función para retry con backoff exponencial
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // No reintentar en errores de validación o autorización
      if (error instanceof ApiError && [400, 401, 403, 422].includes(error.status)) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Esperar antes del siguiente intento
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Función para manejar timeouts
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new ApiError(ERROR_MESSAGES.TIMEOUT, 408)), timeoutMs)
    )
  ]);
};
