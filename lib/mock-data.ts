// Mock data centralizado para el sistema de gestión del club
import { Socio, Temporada, Asociacion, RegistroEntrada, EstadisticasDiarias } from './types';
import { ESTADO_SOCIO, GENERO } from './constants';

// Mock Socios
export const mockSocios: Socio[] = [
  {
    id: '1',
    dni: '12345678',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@email.com',
    telefono: '1234567890',
    fechaNacimiento: '1985-03-15',
    genero: GENERO.MASCULINO,
    estado: ESTADO_SOCIO.ACTIVO,
    fechaIngreso: '2023-01-15',
    direccion: 'Av. Corrientes 1234, CABA'
  },
  {
    id: '2',
    dni: '87654321',
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@email.com',
    telefono: '0987654321',
    fechaNacimiento: '1990-07-22',
    genero: GENERO.FEMENINO,
    estado: ESTADO_SOCIO.ACTIVO,
    fechaIngreso: '2023-02-10',
    direccion: 'Rivadavia 5678, CABA'
  },
  {
    id: '3',
    dni: '11223344',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.rodriguez@email.com',
    telefono: '1122334455',
    fechaNacimiento: '1978-11-08',
    genero: GENERO.MASCULINO,
    estado: ESTADO_SOCIO.ACTIVO,
    fechaIngreso: '2023-01-20',
    direccion: 'San Martín 910, CABA'
  },
  {
    id: '4',
    dni: '55667788',
    nombre: 'Ana',
    apellido: 'López',
    email: 'ana.lopez@email.com',
    telefono: '5566778899',
    fechaNacimiento: '1992-05-14',
    genero: GENERO.FEMENINO,
    estado: ESTADO_SOCIO.INACTIVO,
    fechaIngreso: '2023-03-05',
    direccion: 'Belgrano 1122, CABA'
  },
  {
    id: '5',
    dni: '99887766',
    nombre: 'Roberto',
    apellido: 'Martínez',
    email: 'roberto.martinez@email.com',
    telefono: '9988776655',
    fechaNacimiento: '1980-12-03',
    genero: GENERO.MASCULINO,
    estado: ESTADO_SOCIO.ACTIVO,
    fechaIngreso: '2023-01-30',
    direccion: 'Libertad 3344, CABA'
  },
  {
    id: '6',
    dni: '44556677',
    nombre: 'Laura',
    apellido: 'Fernández',
    email: 'laura.fernandez@email.com',
    telefono: '4455667788',
    fechaNacimiento: '1988-09-18',
    genero: GENERO.FEMENINO,
    estado: ESTADO_SOCIO.ACTIVO,
    fechaIngreso: '2023-02-15',
    direccion: 'Maipú 5566, CABA'
  },
  {
    id: '7',
    dni: '33445566',
    nombre: 'Diego',
    apellido: 'Silva',
    email: 'diego.silva@email.com',
    telefono: '3344556677',
    fechaNacimiento: '1995-01-25',
    genero: GENERO.MASCULINO,
    estado: ESTADO_SOCIO.ACTIVO,
    fechaIngreso: '2023-03-10',
    direccion: 'Florida 7788, CABA'
  },
  {
    id: '8',
    dni: '22334455',
    nombre: 'Sofía',
    apellido: 'Torres',
    email: 'sofia.torres@email.com',
    telefono: '2233445566',
    fechaNacimiento: '1987-06-12',
    genero: GENERO.FEMENINO,
    estado: ESTADO_SOCIO.ACTIVO,
    fechaIngreso: '2023-02-20',
    direccion: 'Callao 9900, CABA'
  }
];

// Mock Temporadas
export const mockTemporadas: Temporada[] = [
  {
    id: '1',
    nombre: 'Temporada Verano 2024',
    fechaInicio: '2023-12-01',
    fechaFin: '2024-03-31',
    descripcion: 'Temporada de verano con actividades acuáticas',
  },
  {
    id: '2',
    nombre: 'Temporada Invierno 2024',
    fechaInicio: '2024-06-01',
    fechaFin: '2024-09-30',
    descripcion: 'Temporada de invierno con actividades indoor',
  },
  {
    id: '3',
    nombre: 'Temporada Primavera 2024',
    fechaInicio: '2024-09-01',
    fechaFin: '2024-12-31',
    descripcion: 'Temporada de primavera con actividades al aire libre',
  },
  {
    id: '4',
    nombre: 'Temporada Verano 2025',
    fechaInicio: '2024-12-01',
    fechaFin: '2025-10-31',
    descripcion: 'Temporada de verano 2025 con actividades acuáticas y pileta climatizada',
  }
];

// Mock Asociaciones
export const mockAsociaciones: Asociacion[] = [
  // Temporada Verano 2024 - Socios asociados
  {
    id: 'assoc-1',
    idSocio: '1', // Juan Pérez
    idTemporada: '1', // Temporada Verano 2024
    fechaAsociacion: '2023-12-01',
    estado: 'activa'
  },
  {
    id: 'assoc-2', 
    idSocio: '2', // María González
    idTemporada: '1',
    fechaAsociacion: '2023-12-01',
    estado: 'activa'
  },
  {
    id: 'assoc-3',
    idSocio: '3', // Carlos Rodríguez
    idTemporada: '1', 
    fechaAsociacion: '2023-12-01',
    estado: 'activa'
  },
  
  // Temporada Invierno 2024 - Socios asociados
  {
    id: 'assoc-4',
    idSocio: '4', // Ana López
    idTemporada: '2',
    fechaAsociacion: '2024-06-01',
    estado: 'activa'
  },
  {
    id: 'assoc-5',
    idSocio: '5', // Roberto Martínez
    idTemporada: '2',
    fechaAsociacion: '2024-06-01',
    estado: 'activa'
  },
  
  // Temporada Primavera 2024 - Socios asociados
  {
    id: 'assoc-6',
    idSocio: '6', // Laura Fernández
    idTemporada: '3',
    fechaAsociacion: '2024-09-01',
    estado: 'activa'
  },
  {
    id: 'assoc-7',
    idSocio: '7', // Diego Silva
    idTemporada: '3',
    fechaAsociacion: '2024-09-01',
    estado: 'activa'
  },
  {
    id: 'assoc-8',
    idSocio: '8', // Sofía Torres
    idTemporada: '3',
    fechaAsociacion: '2024-09-01',
    estado: 'activa'
  },
  
  // Temporada Verano 2025 - Socios asociados
  {
    id: 'assoc-9',
    idSocio: '1', // Juan Pérez
    idTemporada: '4',
    fechaAsociacion: '2024-12-01',
    estado: 'activa'
  },
  {
    id: 'assoc-10',
    idSocio: '2', // María González
    idTemporada: '4',
    fechaAsociacion: '2024-12-01',
    estado: 'activa'
  },
  {
    id: 'assoc-11',
    idSocio: '6', // Laura Fernández
    idTemporada: '4',
    fechaAsociacion: '2024-12-01',
    estado: 'activa'
  }
];

// Mock Registros de Entrada
export const mockRegistrosEntrada: RegistroEntrada[] = [
  // Entradas de ayer (2024-12-30)
  {
    id: '1',
    idSocio: '1',
    nombreSocio: 'Juan Pérez',
    dniSocio: '12345678',
    horaEntrada: '09:30',
    fecha: '2024-12-30'
  },
  {
    id: '2',
    idSocio: '2',
    nombreSocio: 'María González',
    dniSocio: '87654321',
    horaEntrada: '10:15',
    fecha: '2024-12-30'
  },
  {
    id: '3',
    idSocio: '3',
    nombreSocio: 'Carlos Rodríguez',
    dniSocio: '11223344',
    horaEntrada: '08:45',
    fecha: '2024-12-30'
  },
  {
    id: '4',
    idSocio: '4',
    nombreSocio: 'Ana López',
    dniSocio: '55667788',
    horaEntrada: '11:00',
    fecha: '2024-12-30'
  },
  {
    id: '5',
    idSocio: '5',
    nombreSocio: 'Roberto Martínez',
    dniSocio: '99887766',
    horaEntrada: '07:30',
    fecha: '2024-12-30'
  },
  // Entradas de hoy (2024-12-31)
  {
    id: '6',
    idSocio: '1',
    nombreSocio: 'Juan Pérez',
    dniSocio: '12345678',
    horaEntrada: '08:00',
    fecha: '2024-12-31'
  },
  {
    id: '7',
    idSocio: '6',
    nombreSocio: 'Laura Fernández',
    dniSocio: '44556677',
    horaEntrada: '09:15',
    fecha: '2024-12-31'
  },
  {
    id: '8',
    idSocio: '7',
    nombreSocio: 'Diego Silva',
    dniSocio: '33445566',
    horaEntrada: '10:30',
    fecha: '2024-12-31'
  },
  {
    id: '9',
    idSocio: '2',
    nombreSocio: 'María González',
    dniSocio: '87654321',
    horaEntrada: '11:45',
    fecha: '2024-12-31'
  },
  {
    id: '10',
    idSocio: '8',
    nombreSocio: 'Sofía Torres',
    dniSocio: '22334455',
    horaEntrada: '12:00',
    fecha: '2024-12-31'
  }
];

// Mock Estadísticas Diarias
export const mockEstadisticasDiarias: EstadisticasDiarias[] = [
  // Ayer
  {
    fecha: '2024-12-30',
    totalEntradas: 45,
    actualmenteDentro: 0,
    picoOcupacion: 28,
    tiempoPromedioEstadia: 4.2
  },
  // Hoy
  {
    fecha: '2024-12-31',
    totalEntradas: 32,
    actualmenteDentro: 8,
    picoOcupacion: 25,
    tiempoPromedioEstadia: 3.8
  }
];

// Funciones utilitarias para trabajar con mock data
export const getMockSocios = (): Socio[] => {
  return mockSocios;
};

export const getMockTemporadas = (): Temporada[] => {
  return mockTemporadas;
};

export const getSocioById = (id: string): Socio | undefined => {
  return mockSocios.find(socio => socio.id === id);
};

export const getTemporadaById = (id: string): Temporada | undefined => {
  return mockTemporadas.find(temporada => temporada.id === id);
};

export const getAsociacionesByTemporadaId = (idTemporada: string): Asociacion[] => {
  return mockAsociaciones.filter(asociacion => asociacion.idTemporada === idTemporada);
};

export const getAsociacionesBySocioId = (idSocio: string): Asociacion[] => {
  return mockAsociaciones.filter(asociacion => asociacion.idSocio === idSocio);
};

export const getSociosDisponiblesParaTemporada = (idTemporada: string): Socio[] => {
  const idsSociosAsociados = mockAsociaciones
    .filter(asociacion => asociacion.idTemporada === idTemporada)
    .map(asociacion => asociacion.idSocio);

  return mockSocios.filter(socio =>
    socio.id && !idsSociosAsociados.includes(socio.id) &&
    socio.estado === ESTADO_SOCIO.ACTIVO
  );
};

export const getRegistrosEntradaByRangoFecha = (fechaInicio: string, fechaFin: string): RegistroEntrada[] => {
  return mockRegistrosEntrada.filter(registro => registro.fecha >= fechaInicio && registro.fecha <= fechaFin);
};

export const getEstadisticasDiariasByRangoFecha = (fechaInicio: string, fechaFin: string): EstadisticasDiarias[] => {
  return mockEstadisticasDiarias.filter(estadistica => estadistica.fecha >= fechaInicio && estadistica.fecha <= fechaFin);
};
