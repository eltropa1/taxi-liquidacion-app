import { getDatabase } from "../../database/database";

/**
 * Caso de uso: cerrar una jornada de trabajo.
 */
export class CloseWorkday {
  static async execute(): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `
      UPDATE workdays
      SET endTime = ?, isClosed = 1
      WHERE isClosed = 0
      `,
      [now],
    );
  }
}
