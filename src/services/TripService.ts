import { PaymentType, TripSource } from "../constants/enums";
import { getDatabase } from "../database/database";

/**
 * Servicio de viajes.
 * Contiene la lógica de negocio relacionada con los viajes.
 */
export class TripService {
  /**
   * Inicia un nuevo viaje.
   * Guarda la hora de inicio automáticamente.
   */
  static async startTrip() {
    const db = await getDatabase();

    const startTime = new Date().toISOString();
    const createdAt = startTime;

    await db.runAsync(
      `
      INSERT INTO trips (startTime, source, createdAt)
      VALUES (?, ?, ?)
      `,
      [startTime, TripSource.TAXI, createdAt]
    );
  }
  /**
   * Devuelve el viaje "en curso" (sin endTime), si existe.
   * Si no hay ninguno, devuelve null.
   */
  static async getActiveTrip(): Promise<{
    id: number;
    startTime: string;
  } | null> {
    const db = await getDatabase();

    const result = await db.getFirstAsync<{ id: number; startTime: string }>(
      `
      SELECT id, startTime
      FROM trips
      WHERE endTime IS NULL
      ORDER BY startTime DESC
      LIMIT 1
      `
    );

    return result ?? null;
  }

  /**
   * Finaliza el viaje activo guardando
   * importe, forma de pago y tipo de viaje.
   */
  static async finishActiveTripWithData(
    amount: number,
    payment: PaymentType,
    source: TripSource
  ): Promise<void> {
    const db = await getDatabase();

    // Buscamos el viaje activo
    const active = await db.getFirstAsync<{ id: number }>(
      `
      SELECT id
      FROM trips
      WHERE endTime IS NULL
      ORDER BY startTime DESC
      LIMIT 1
      `
    );

    if (!active) return;

    const endTime = new Date().toISOString();

    await db.runAsync(
      `
      UPDATE trips
      SET endTime = ?, amount = ?, payment = ?, source = ?
      WHERE id = ?
      `,
      [endTime, amount, payment, source, active.id]
    );
  }

  /**
   * Devuelve todos los viajes del día actual.
   * Incluye viajes finalizados y el que esté en curso.
   */
  static async getTripsForToday(): Promise<
    Array<{
      id: number;
      startTime: string;
      endTime: string | null;
      amount: number | null;
    }>
  > {
    const db = await getDatabase();

    // Fecha de hoy en formato YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dayKey = `${yyyy}-${mm}-${dd}`;

    const rows = await db.getAllAsync<{
      id: number;
      startTime: string;
      endTime: string | null;
      amount: number | null;
    }>(
      `
      SELECT id, startTime, endTime, amount
      FROM trips
      WHERE substr(startTime, 1, 10) = ?
      ORDER BY startTime DESC
      `,
      [dayKey]
    );

    return rows;
  }
}
