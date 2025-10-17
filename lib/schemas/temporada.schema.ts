/**
 * Schema de validación para Temporadas usando Zod
 */

import { z } from "zod";
import { MENSAJES_ERROR } from "@/lib/constants";

export const temporadaSchema = z
  .object({
    // Nombre - requerido
    nombre: z
      .string()
      .min(1, MENSAJES_ERROR.NOMBRE_TEMPORADA_INVALIDO)
      .transform((val) => val.trim()),

    // Fecha de inicio - requerida
    fechaInicio: z
      .string()
      .min(1, MENSAJES_ERROR.FECHA_INICIO_INVALIDA)
      .refine(
        (val) => {
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: MENSAJES_ERROR.FECHA_INICIO_INVALIDA }
      ),

    // Fecha de fin - requerida
    fechaFin: z
      .string()
      .min(1, MENSAJES_ERROR.FECHA_FIN_INVALIDA)
      .refine(
        (val) => {
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: MENSAJES_ERROR.FECHA_FIN_INVALIDA }
      ),

    // Descripción - opcional, máximo 100 caracteres
    descripcion: z
      .string()
      .max(100, MENSAJES_ERROR.LONGITUD_DESCRIPCION_INVALIDA)
      .optional()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),
  })
  // Validación a nivel de objeto: fechaFin > fechaInicio
  .refine(
    (data) => {
      const inicio = new Date(data.fechaInicio);
      const fin = new Date(data.fechaFin);
      return fin > inicio;
    },
    {
      message: MENSAJES_ERROR.ORDEN_FECHAS_INVALIDO,
      path: ["fechaFin"], // El error se mostrará en el campo fechaFin
    }
  );

// Tipo inferido del schema
export type TemporadaFormData = z.infer<typeof temporadaSchema>;
