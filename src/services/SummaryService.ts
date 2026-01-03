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
   * Resumen del mes actual
   */
  static async getMonthSummary() {
    const { start, end } = getCurrentMonthRange();
    return TripService.getSummaryBetweenDates(start, end);
  }
}
