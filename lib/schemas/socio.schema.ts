/**
 * Schema de validación para Socios usando Zod
 */

import { z } from "zod";
import { VALIDACION, MENSAJES_ERROR, GENERO, ESTADO_SOCIO } from "@/lib/constants";

export const socioSchema = z.object({
  // DNI - requerido, exactamente 8 dígitos
  dni: z
    .string()
    .min(1, MENSAJES_ERROR.CAMPO_REQUERIDO)
    .regex(VALIDACION.DNI.REGEX, MENSAJES_ERROR.DNI_INVALIDO)
    .length(VALIDACION.DNI.LONGITUD_MAXIMA, MENSAJES_ERROR.DNI_INVALIDO),

  // Nombre - requerido
  nombre: z
    .string()
    .min(1, MENSAJES_ERROR.CAMPO_REQUERIDO)
    .transform((val) => val.trim()),

  // Apellido - requerido
  apellido: z
    .string()
    .min(1, MENSAJES_ERROR.CAMPO_REQUERIDO)
    .transform((val) => val.trim()),

  // Dirección - requerida
  direccion: z
    .string()
    .min(1, MENSAJES_ERROR.CAMPO_REQUERIDO)
    .transform((val) => val.trim()),

  // Email - opcional, pero si se provee debe ser válido
  email: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return VALIDACION.EMAIL.REGEX.test(val.trim());
      },
      { message: MENSAJES_ERROR.EMAIL_INVALIDO }
    )
    .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),

  // Teléfono - opcional
  telefono: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : undefined)),

  // Fecha de nacimiento - requerida, no puede ser futura
  fechaNacimiento: z
    .string()
    .min(1, MENSAJES_ERROR.CAMPO_REQUERIDO)
    .refine(
      (val) => {
        const birthDate = new Date(val);
        return !isNaN(birthDate.getTime());
      },
      { message: "Fecha inválida" }
    )
    .refine(
      (val) => {
        const birthDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return birthDate <= today;
      },
      { message: MENSAJES_ERROR.FECHA_NACIMIENTO_INVALIDA }
    )
    .refine(
      (val) => {
        const birthDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age <= VALIDACION.EDAD.MAXIMA;
      },
      { message: MENSAJES_ERROR.EDAD_FUERA_DE_RANGO }
    ),

  // Género - requerido, debe ser MASCULINO o FEMENINO
  genero: z.enum([GENERO.MASCULINO, GENERO.FEMENINO], {
    errorMap: () => ({ message: MENSAJES_ERROR.CAMPO_REQUERIDO }),
  }),

  // Estado - requerido, debe ser ACTIVO o INACTIVO
  estado: z.enum([ESTADO_SOCIO.ACTIVO, ESTADO_SOCIO.INACTIVO], {
    errorMap: () => ({ message: MENSAJES_ERROR.CAMPO_REQUERIDO }),
  }),

  // Foto URL - opcional
  fotoUrl: z.string().optional(),
});

// Tipo inferido del schema
export type SocioFormData = z.infer<typeof socioSchema>;

// Schema para update (todos los campos opcionales excepto los que siempre se necesitan)
export const socioUpdateSchema = socioSchema.partial({
  email: true,
  telefono: true,
  fotoUrl: true,
});

export type SocioUpdateFormData = z.infer<typeof socioUpdateSchema>;
