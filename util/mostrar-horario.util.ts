import { formatInTimeZone } from "date-fns-tz";

/**
 * Formatea una fecha a HH:mm para Argentina sin sumar ni restar horas de más.
 * Soporta formatos ISO con 'Z', con offset, y objetos Date.
 */
export const mostrarHorarioHHMM = (fecha: Date | string) => {
  if (!fecha) return "-";

  let dateToFormat: Date;
  if (typeof fecha === "string") {
    // Si ya tiene offset -03:00, lo pasamos directo
    if (/([+-][0-9]{2}:[0-9]{2})$/.test(fecha)) {
      dateToFormat = new Date(fecha);
    } else if (fecha.endsWith("Z")) {
      // Si viene en UTC (Z), convertimos a Argentina
      dateToFormat = new Date(
        new Date(fecha).toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
      );
    } else {
      // Si no encontramos zona, lo procesamos como horario argentino
      dateToFormat = new Date(fecha);
    }
  } else {
    // Es Date
    dateToFormat = fecha;
  }

  return formatInTimeZone(dateToFormat, "America/Argentina/Buenos_Aires", "HH:mm");
};
