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
   * Devuelve el workday exacto asociado a una fecha natural.
   */
  static async getWorkdayForDate(
    date: Date,
  ): Promise<{ id: number; startTime: string } | null> {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      const active = await this.getOpenWorkday();
      if (active) return active;
    }

    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
    ).toISOString();

    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
    ).toISOString();

    const db = await getDatabase();

    return db.getFirstAsync(
      `
      SELECT *
      FROM workdays
      WHERE startTime BETWEEN ? AND ?
      ORDER BY startTime DESC
      LIMIT 1
      `,
      [startOfDay, endOfDay],
    );
  }

  /**
   * Devuelve información completa del workday asociado a una fecha natural.
   */
  static async getWorkdayInfoForDate(date: Date): Promise<{
    id: number;
    startTime: string;
    endTime: string | null;
    isClosed: boolean;
  } | null> {
    const db = await getDatabase();

    const dayStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
    ).toISOString();

    const dayEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
    ).toISOString();

    const row = await db.getFirstAsync<{
      id: number;
      startTime: string;
      endTime: string | null;
      isClosed: number;
    }>(
      `
    SELECT id, startTime, endTime, isClosed
    FROM workdays
    WHERE startTime BETWEEN ? AND ?
    ORDER BY startTime ASC
    LIMIT 1
    `,
      [dayStart, dayEnd],
    );

    return row
      ? {
          id: row.id,
          startTime: row.startTime,
          endTime: row.endTime,
          isClosed: row.isClosed === 1,
        }
      : null;
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
