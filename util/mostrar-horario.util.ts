import { formatInTimeZone } from "date-fns-tz";

export const mostrarHorarioHHMM = (fecha: Date | string) => {
  // Si la fecha es una cadena que termina con 'Z', la interpretamos como ya en zona horaria de Buenos Aires
  const dateToFormat =
    typeof fecha === "string" && fecha.endsWith("Z")
      ? new Date(fecha.slice(0, -1) + "-03:00") // Reemplazamos 'Z' con '-03:00' para Argentina
      : new Date(fecha);

  return formatInTimeZone(
    dateToFormat,
    "America/Argentina/Buenos_Aires",
    "HH:mm"
  );
};
