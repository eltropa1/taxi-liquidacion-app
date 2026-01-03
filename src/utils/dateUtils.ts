/**
 * Utilidades de fechas centralizadas para toda la app.
 *
 * REGLAS DE NEGOCIO:
 * - Semana: lunes a domingo
 * - El mes es frontera dura (no se mezclan meses)
 * - Las semanas pueden ser parciales
 * - Todo es automático, sin intervención del usuario
 */

export type DateRange = {
  start: Date;
  end: Date;
};

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
 * Devuelve el lunes de la semana natural de una fecha
 * (lunes = 1, domingo = 7)
 */
export function getMondayOfWeek(date: Date): Date {
  const day = date.getDay(); // domingo = 0
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday;
}

/**
 * Devuelve el domingo de la semana natural de una fecha
 */
export function getSundayOfWeek(date: Date): Date {
  const monday = getMondayOfWeek(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

/**
 * Devuelve el rango REAL de la semana actual,
 * recortado automáticamente al mes actual.
 */
export function getCurrentWeekRange(today: Date = new Date()): DateRange {
  const startOfMonth = getStartOfMonth(today);
  const endOfMonth = getEndOfMonth(today);

  const naturalWeekStart = getMondayOfWeek(today);
  const naturalWeekEnd = getSundayOfWeek(today);

  const start =
    naturalWeekStart < startOfMonth ? startOfMonth : naturalWeekStart;

  const end =
    naturalWeekEnd > endOfMonth
      ? endOfMonth
      : naturalWeekEnd > today
      ? today
      : naturalWeekEnd;

  return { start, end };
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
