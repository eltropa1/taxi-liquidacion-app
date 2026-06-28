import {
  getCurrentMonthRange,
  getCurrentWeekRange,
  getTodayRange,
} from "../utils/dateUtils";
import { PaymentType, TripSource } from "../constants/enums";
import { getDatabase } from "../database/database";
import { WorkdayService } from "./WorkdayService";

/**
 * Servicio encargado de construir los resúmenes
 * usando rangos de fechas CORRECTOS.
 *
 * ⚠️ La UI NO debe calcular fechas.
 */
export class SummaryService {
  static async getSummaryBetweenDates(startDate: Date, endDate: Date) {
    const db = await getDatabase();

    const format = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;

    // 1️⃣ Obtener workdays cuyo startTime esté en el rango
    const workdays = await db.getAllAsync<{ id: number }>(
      `
      SELECT id
      FROM workdays
      WHERE substr(startTime, 1, 10) BETWEEN ? AND ?
      `,
      [format(startDate), format(endDate)],
    );

    if (workdays.length === 0) {
      return {
        total: 0,
        taxi: 0,
        uber: 0,
        cabify: 0,
        freeNow: 0,
        efectivo: 0,
        tarjeta: 0,
        app: 0,
      };
    }

    const workdayIds = workdays.map((w) => w.id);

    // 2️⃣ Obtener todos los trips pertenecientes a esos workdays
    const placeholders = workdayIds.map(() => "?").join(",");

    const rows = await db.getAllAsync<{
      amount: number | null;
      source: TripSource;
      payment: PaymentType | null;
    }>(
      `
      SELECT amount, source, payment
      FROM trips
      WHERE workdayId IN (${placeholders})
      `,
      workdayIds,
    );

    let total = 0,
      taxi = 0,
      uber = 0,
      cabify = 0,
      freeNow = 0,
      efectivo = 0,
      tarjeta = 0,
      app = 0;

    for (const t of rows) {
      const amount = t.amount ?? 0;
      total += amount;

      if (t.source === TripSource.TAXI) taxi += amount;
      if (t.source === TripSource.UBER) uber += amount;
      if (t.source === TripSource.CABIFY) cabify += amount;
      if (t.source === TripSource.FREE_NOW) freeNow += amount;

      if (t.payment === PaymentType.CASH) efectivo += amount;
      if (t.payment === PaymentType.CARD) tarjeta += amount;
      if (t.payment === PaymentType.APP) app += amount;
    }

    return { total, taxi, uber, cabify, freeNow, efectivo, tarjeta, app };
  }

  static async getSummaryForWorkday(workdayId: number) {
    const db = await getDatabase();

    const rows = await db.getAllAsync<{
      amount: number | null;
      chargedAmount: number | null;
      cashTip: number | null;
      source: TripSource;
      payment: PaymentType | null;
    }>(
      `
      SELECT amount, chargedAmount, cashTip, source, payment
      FROM trips
      WHERE workdayId = ?
      `,
      [workdayId],
    );

    let total = 0,
      taxi = 0,
      uber = 0,
      cabify = 0,
      freeNow = 0,
      efectivo = 0,
      tarjeta = 0,
      app = 0,
      propinaTarjeta = 0,
      propinaEfectivo = 0;

    for (const t of rows) {
      const amount = t.amount ?? 0;
      const charged = t.chargedAmount ?? amount;

      total += amount;

      if (t.source === TripSource.TAXI) taxi += amount;
      if (t.source === TripSource.UBER) uber += amount;
      if (t.source === TripSource.CABIFY) cabify += amount;
      if (t.source === TripSource.FREE_NOW) freeNow += amount;

      if (t.payment === PaymentType.CASH) efectivo += amount;
      if (t.payment === PaymentType.CARD) tarjeta += charged;
      if (t.payment === PaymentType.APP) app += amount;

      if (t.payment === PaymentType.CARD && charged > amount) {
        propinaTarjeta += charged - amount;
      }

      if (t.payment === PaymentType.CASH && (t.cashTip ?? 0) > 0) {
        propinaEfectivo += t.cashTip ?? 0;
      }
    }

    return {
      total,
      taxi,
      uber,
      cabify,
      freeNow,
      efectivo,
      tarjeta,
      app,
      propinaTarjeta,
      propinaEfectivo,
    };
  }

  /**
   * Resumen del día actual
   */
  static async getTodaySummary() {
    const { start, end } = getTodayRange();
    return this.getSummaryBetweenDates(start, end);
  }

  /**
   * Resumen de la semana actual (lunes-domingo, recortada al mes)
   */
  static async getWeekSummary() {
    const { start, end } = getCurrentWeekRange();
    return this.getSummaryBetweenDates(start, end);
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
  const activeWorkday = await WorkdayService.getOpenWorkday();

  const anchorDate = activeWorkday
    ? new Date(activeWorkday.startTime)
    : new Date();

  // 2️⃣ Construir rango del mes de esa fecha
  const { start, end } = getCurrentMonthRange(anchorDate);

  // 3️⃣ Delegar agregación por workdays
  return this.getSummaryBetweenDates(start, end);
}
}
