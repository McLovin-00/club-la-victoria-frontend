/**
 * Date Utilities
 * Centralized date formatting functions for consistent date handling across the application
 */

/**
 * Parse a date string and add timezone offset to avoid timezone issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object with timezone adjustment
 */
function parseDateSafe(dateString: string): Date {
  // Add T00:00:00 to ensure the date is interpreted in local timezone
  return new Date(dateString + "T00:00:00");
}

/**
 * Format a date string in long format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "15 de enero de 2024")
 */
export function formatDateLong(dateString: string): string {
  const date = parseDateSafe(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date string in short format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "15 ene 2024")
 */
export function formatDateShort(dateString: string): string {
  const date = parseDateSafe(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string in numeric format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "15/1/2024")
 */
export function formatDateNumeric(dateString: string): string {
  const date = parseDateSafe(dateString);
  return date.toLocaleDateString("es-ES");
}

/**
 * Format a date string with a specified format
 * @param dateString - Date string in YYYY-MM-DD format
 * @param format - Format type: "long", "short", or "numeric" (default: "short")
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: "long" | "short" | "numeric" = "short"
): string {
  switch (format) {
    case "long":
      return formatDateLong(dateString);
    case "numeric":
      return formatDateNumeric(dateString);
    case "short":
    default:
      return formatDateShort(dateString);
  }
}

/**
 * Format a date range
 * @param startDate - Start date string in YYYY-MM-DD format
 * @param endDate - End date string in YYYY-MM-DD format
 * @param format - Format type: "long", "short", or "numeric" (default: "short")
 * @returns Formatted date range string (e.g., "15 ene 2024 - 15 feb 2024")
 */
export function formatDateRange(
  startDate: string,
  endDate: string,
  format: "long" | "short" | "numeric" = "short"
): string {
  return `${formatDate(startDate, format)} - ${formatDate(endDate, format)}`;
}

/**
 * Check if a date is in the past
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date is in the past
 */
export function isDatePast(dateString: string): boolean {
  const date = parseDateSafe(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if a date is in the future
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date is in the future
 */
export function isDateFuture(dateString: string): boolean {
  const date = parseDateSafe(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

/**
 * Check if a date is today
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date is today
 */
export function isDateToday(dateString: string): boolean {
  const date = parseDateSafe(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
}

/**
 * Check if a date range is active (current date is within the range)
 * @param startDate - Start date string in YYYY-MM-DD format
 * @param endDate - End date string in YYYY-MM-DD format
 * @returns True if the current date is within the range
 */
export function isDateRangeActive(startDate: string, endDate: string): boolean {
  const start = parseDateSafe(startDate);
  const end = parseDateSafe(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= start && today <= end;
}
