import { getDatabase } from "../database/database";

/**
 * Servicio encargado de gestionar los días reales de trabajo.
 *
 * Un día de trabajo:
 * - Se abre manualmente o automáticamente al iniciar un viaje
 * - Puede cruzar medianoche
 * - Se cierra SOLO cuando el usuario lo indica
 */
export class WorkdayService {
  /**
   * Devuelve el día de trabajo actualmente abierto (si existe)
   */
  static async getOpenWorkday() {
    const db = await getDatabase();

    const result = await db.getAllAsync<any>(`
      SELECT *
      FROM workdays
      WHERE isClosed = 0
      ORDER BY startTime DESC
      LIMIT 1
    `);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Crea un nuevo día de trabajo si no hay ninguno abierto
   */
  static async openWorkdayIfNeeded() {
    const db = await getDatabase();

    const openDay = await this.getOpenWorkday();
    if (openDay) return openDay;

    const now = new Date().toISOString();

    await db.execAsync(`
      INSERT INTO workdays (startTime, isClosed, createdAt)
      VALUES ('${now}', 0, '${now}')
    `);

    return this.getOpenWorkday();
  }

  /**
   * Cierra el día de trabajo actual
   */
  static async closeCurrentWorkday() {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const openDay = await this.getOpenWorkday();
    if (!openDay) return;

    await db.execAsync(`
      UPDATE workdays
      SET endTime = '${now}', isClosed = 1
      WHERE id = ${openDay.id}
    `);
  }

  /**
   * Asocia un viaje al día de trabajo abierto
   */
  static async assignTripToCurrentWorkday(tripId: number) {
    const db = await getDatabase();

    const workday = await this.openWorkdayIfNeeded();
    if (!workday) return;

    await db.execAsync(`
      UPDATE trips
      SET workdayId = ${workday.id}
      WHERE id = ${tripId}
    `);
  }
}
