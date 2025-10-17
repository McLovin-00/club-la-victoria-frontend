// Constantes centralizadas para el sistema de gestión del club

// Géneros
export enum GENERO {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO'
} 

// Estados de socios
export enum ESTADO_SOCIO {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO'
}

//Stale time para React Query
export const STALE_TIME = 1000 * 60 * 5;

// Estados de temporadas
export const ESTADO_TEMPORADA = {
  ACTIVA: 'activa',
  INACTIVA: 'inactiva',
  PROXIMA: 'proxima',
  FINALIZADA: 'finalizada'
} as const;

// Estados de asociaciones
export const ESTADO_ASOCIACION = {
  ACTIVA: 'activa',
  INACTIVA: 'inactiva'
} as const;

// Configuración de paginación
export const PAGINACION = {
  TAMAÑO_PAGINA_POR_DEFECTO: 10,
  TAMAÑO_PAGINA_MAXIMO: 50,
  TAMAÑO_PAGINA_MINIMO: 5,
  OPCIONES_TAMAÑO_PAGINA: [5, 10, 20, 50]
} as const;

// Configuración de búsqueda
export const BUSQUEDA = {
  DELAY_DEBOUNCE: 300, // milisegundos
  LONGITUD_MINIMA_BUSQUEDA: 2,
  LONGITUD_MAXIMA_BUSQUEDA: 50
} as const;

// Límites de validación
export const VALIDACION = {
  DNI: {
    LONGITUD_MINIMA: 8,
    LONGITUD_MAXIMA: 8,
    REGEX: /^\d{8}$/
  },
  EMAIL: {
    LONGITUD_MAXIMA: 100,
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  EDAD: {
    MAXIMA: 120
  }
} as const;

// Mensajes de error comunes
export const MENSAJES_ERROR = {
  ERROR_RED: 'Error de conexión. Verifique su conexión a internet.',
  NO_AUTORIZADO: 'No tiene permisos para realizar esta acción.',
  NO_ENCONTRADO: 'El recurso solicitado no fue encontrado.',
  ERROR_VALIDACION: 'Los datos ingresados no son válidos.',
  ERROR_SERVIDOR: 'Error interno del servidor. Intente nuevamente.',
  TIMEOUT: 'La operación ha tardado demasiado. Intente nuevamente.',
  DNI_DUPLICADO: 'Ya existe un socio con este DNI.',
  EMAIL_DUPLICADO: 'Ya existe un socio con este email.',
  RANGO_FECHA_INVALIDO: 'La fecha de inicio debe ser anterior a la fecha de fin.',
  TEMPORADA_LLENA: 'La temporada ha alcanzado el máximo de socios permitidos.',
  DNI_INVALIDO: 'El DNI debe tener exactamente 8 dígitos numéricos.',
  EMAIL_INVALIDO: 'El formato del email no es válido.',
  FECHA_NACIMIENTO_INVALIDA: 'La fecha de nacimiento no puede ser posterior a hoy.',
  NOMBRE_TEMPORADA_INVALIDO: 'El nombre de la temporada es requerido.',
  FECHA_INICIO_INVALIDA: 'La fecha de inicio es requerida.',
  FECHA_FIN_INVALIDA: 'La fecha de fin es requerida.',
  ORDEN_FECHAS_INVALIDO: 'La fecha de fin debe ser posterior a la fecha de inicio.',
  LONGITUD_DESCRIPCION_INVALIDA: 'La descripción no puede tener más de 100 caracteres.',
  EDAD_FUERA_DE_RANGO: 'La edad debe estar entre 0 y 120 años.',
  CAMPO_REQUERIDO: 'Este campo es obligatorio.'
} as const;

// Mensajes de éxito
export const MENSAJES_EXITO = {
  SOCIO_CREADO: 'Socio creado exitosamente.',
  SOCIO_ELIMINADO: 'Socio eliminado exitosamente.',
  SOCIO_ACTUALIZADO: 'Socio actualizado exitosamente.',
  TEMPORADA_CREADA: 'Temporada creada exitosamente.',
  TEMPORADA_ELIMINADA: 'Temporada eliminada exitosamente.',
  TEMPORADA_ACTUALIZADA: 'Temporada actualizada exitosamente.',
  ASOCIACION_CREADA: 'Socio agregado a la temporada.',
  ASOCIACION_ELIMINADA: 'Socio removido de la temporada.'
} as const;
// Mensajes informativos para asociaciones
export const MENSAJES_ASOCIACION = {
  ADVERTENCIA_TEMPORADA_FINALIZADA: 'Esta temporada ya ha finalizado. No se pueden agregar nuevos socios a temporadas finalizadas. Solo puedes ver la lista de socios que participaron.',
  INFO_TEMPORADA_FUTURA: 'Esta temporada comenzará el',
  SUFIJO_INFO_TEMPORADA_FUTURA: '. Puedes agregar y eliminar socios antes de que comience.',
  INFO_TEMPORADA_FINALIZADA: 'Esta temporada finalizó el',
  SUFIJO_INFO_TEMPORADA_FINALIZADA: '. No se pueden agregar ni eliminar socios de temporadas finalizadas.',

  // Placeholders y mensajes UI
  BUSCAR_SOCIOS_DISPONIBLES: 'Buscar socios disponibles...',
  BUSCAR_SOCIOS_ASOCIADOS: 'Buscar socios asociados por nombre, DNI o email...',
  CARGANDO_SOCIOS: 'Cargando socios...',
  NO_SOCIOS_ENCONTRADOS: 'No se encontraron socios disponibles',
  NO_SOCIOS_DISPONIBLES: 'No hay socios disponibles para agregar',
  NO_SOCIOS_ASOCIADOS_ENCONTRADOS: 'No se encontraron socios asociados',
  NO_SOCIOS_ASOCIADOS: 'No hay socios asociados a esta temporada',

  // Estados de temporada
  ESTADO_TEMPORADA_FINALIZADA: 'Finalizada',
  ESTADO_TEMPORADA_FUTURA: 'Futura',
  ESTADO_TEMPORADA_ACTIVA: 'Temporada Activa',

  // Acciones
  AGREGAR_SOCIOS: 'Agregar Socios',
  AGREGAR_SOCIOS_A_TEMPORADA: 'Agregar Socios a',
  BUSCAR_Y_SELECCIONAR_SOCIOS: 'Busca y selecciona los socios que deseas agregar a esta temporada',

  // Diálogo de eliminación
  TITULO_ELIMINAR_SOCIO_TEMPORADA: '¿Eliminar socio de la temporada?',
  DESC_ELIMINAR_SOCIO_TEMPORADA: 'Esta acción no se puede deshacer. Se eliminará permanentemente al socio',
  SUFIJO_ELIMINAR_SOCIO_TEMPORADA: 'de esta temporada.',
  ELIMINAR_SOCIO: 'Eliminar',
  CANCELAR: 'Cancelar',
  ELIMINAR_DESHABILITADO: 'Eliminar (deshabilitado)',

  // Errores específicos de asociaciones
  ERROR_AGREGAR_SOCIO_TEMPORADA: 'Error al agregar socio a la temporada',
  ERROR_NO_REMOVER_TEMPORADA_FINALIZADA: 'No se pueden eliminar socios de temporadas finalizadas',
} as const;

