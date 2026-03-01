import {
  getCurrentMonthRange,
  getCurrentWeekRange,
  getTodayRange,
} from "../utils/dateUtils";
import { TripService } from "./TripService";

/**
 * Servicio encargado de construir los resúmenes
 * usando rangos de fechas CORRECTOS.
 *
 * ⚠️ La UI NO debe calcular fechas.
 */
export class SummaryService {
  /**
   * Resumen del día actual
   */
  static async getTodaySummary() {
    const { start, end } = getTodayRange();
    return TripService.getSummaryBetweenDates(start, end);
  }

  /**
   * Resumen de la semana actual (lunes-domingo, recortada al mes)
   */
  static async getWeekSummary() {
    const { start, end } = getCurrentWeekRange();
    return TripService.getSummaryBetweenDates(start, end);
  }

  /**
 * Resumen del mes activo.
 *
 * Regla de dominio:
 * - Si existe workday abierto → mes del startTime del workday.
 * - Si no existe → mes natural actual.
 */
static async getMonthSummary() {
  // 1️⃣ Resolver fecha ancla de mes activo
  const activeWorkday = await TripService.getActiveWorkday();

  const anchorDate = activeWorkday
    ? new Date(activeWorkday.startTime)
    : new Date();

  // 2️⃣ Construir rango del mes de esa fecha
  const { start, end } = getCurrentMonthRange(anchorDate);

  // 3️⃣ Delegar agregación por workdays
  return TripService.getSummaryBetweenDates(start, end);
}
}
