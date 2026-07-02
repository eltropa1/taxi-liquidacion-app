/**
 * Utilidades de fechas centralizadas para toda la app.
 *
 * REGLAS DE NEGOCIO:
 * - El mes es frontera dura (no se mezclan meses)
 * - Todo es automático, sin intervención del usuario
 */

export type DateRange = {
  start: Date;
  end: Date;
};

/**
 * Desplaza una fecha por días de calendario manteniendo la hora local.
 */
export function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Devuelve el primer día del mes actual
 */
export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Devuelve el último día del mes actual
 */
export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Devuelve el rango del mes actual hasta hoy
 */
export function getCurrentMonthRange(today: Date = new Date()): DateRange {
  return {
    start: getStartOfMonth(today),
    end: today,
  };
}

/**
 * Devuelve el rango del día actual
 */
export function getTodayRange(today: Date = new Date()): DateRange {
  return {
    start: today,
    end: today,
  };
}
