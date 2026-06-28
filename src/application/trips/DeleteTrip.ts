import { getDatabase } from "../../database/database";

export class DeleteTrip {
  static async execute(id: number): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      `
      DELETE FROM trips
      WHERE id = ?
      `,
      [id],
    );
  }
}
