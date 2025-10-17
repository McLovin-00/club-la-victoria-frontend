// Tipos centralizados para el sistema de gestión del club

import { ESTADO_SOCIO, GENERO } from "./constants";

// Interfaz principal de Socio
export interface Socio {
  id?: string;
  dni: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  fechaIngreso?: string;
  direccion: string;
  estado: ESTADO_SOCIO;
  genero: GENERO;
}

export interface SocioWithFoto extends Socio {
  fotoUrl?: string;
}

// Interfaz de Temporada
export interface Temporada {
  id?: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string;
}

// Interfaz de Asociación entre Socio y Temporada
export interface Asociacion {
  id: string;
  idSocio: string;
  idTemporada: string;
  fechaAsociacion: string;
  estado: 'activa' | 'inactiva';
  socio?: Socio;
  temporada?: Temporada;
}

// Interfaz para estadísticas de entradas
export interface RegistroEntrada {
  id: string;
  idSocio: string;
  nombreSocio: string;
  dniSocio: string;
  horaEntrada: string;
  fecha: string;
}

// Interfaz para estadísticas diarias
export interface EstadisticasDiarias {
  fecha: string;
  totalEntradas: number;
  actualmenteDentro: number;
  picoOcupacion: number;
  tiempoPromedioEstadia?: number;
}

// Interfaces para paginación
export interface Paginacion {
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  elementosPorPagina: number;
  tieneSiguientePagina: boolean;
  tieneAnteriorPagina: boolean;
}

// Interfaz para respuestas de búsqueda
export interface RespuestaBusqueda {
  socios: Socio[];
  paginacion: Paginacion;
}

// Enums para registros de ingreso
export enum TipoIngreso {
  SOCIO_CLUB = "SOCIO_CLUB",
  SOCIO_PILETA = "SOCIO_PILETA",
  NO_SOCIO = "NO_SOCIO",
}

export enum MetodoPago {
  EFECTIVO = "EFECTIVO",
  TRANSFERENCIA = "TRANSFERENCIA",
}

// Interfaz para socio en registros de ingreso (versión simplificada)
export interface SocioRegistro {
  idSocio: number;
  nombre: string;
  apellido: string;
  dni: string;
}

// Interfaz para registro de ingreso
export interface RegistroIngreso {
  idIngreso: number;
  idSocio?: number;
  dniNoSocio?: string;
  tipoIngreso: TipoIngreso;
  habilitaPileta: boolean;
  metodoPago?: MetodoPago;
  importe: number;
  fechaHoraIngreso: Date;
  socio?: SocioRegistro;
}

// Interfaz para respuesta de estadísticas del backend
export interface StatisticsResponseDto {
  date: string;
  totalIngresos: number;
  totalIngresosPileta: number;
  totalIngresosClub: number;
  totalSocios: number;
  totalNoSocios: number;
  registros: RegistroIngreso[];
}

// Aliases for English compatibility (for statistics component)
export type EntryLog = RegistroEntrada;
export type DailyStats = EstadisticasDiarias;
