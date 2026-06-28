import { getDatabase } from "../../database/database";

/**
 * Caso de uso: abrir una jornada de trabajo.
 */
export class OpenWorkday {
  static async execute(): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `
      INSERT INTO workdays (startTime, createdAt)
      VALUES (?, ?)
      `,
      [now, now],
    );
  }
}
