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
      source: TripSource;
      payment: PaymentType | null;
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
      source: TripSource;
      payment: PaymentType | null;
    }>(
      `
      SELECT
        id,
        startTime,
        endTime,
        amount,
        source,
        payment
      FROM trips
      WHERE substr(startTime, 1, 10) = ?
      ORDER BY startTime DESC
      `,
      [dayKey]
    );

    return rows;
  }

  /**
   * Actualiza/Edita un viaje con nuevos datos.
   */
  static async updateTrip(
  id: number,
  amount: number,
  payment: PaymentType,
  source: TripSource
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
    UPDATE trips
    SET amount = ?, payment = ?, source = ?
    WHERE id = ?
    `,
    [amount, payment, source, id]
  );
}

/**
   * Borra un viaje con nuevos datos.
   */
static async deleteTrip(id: number): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
    DELETE FROM trips
    WHERE id = ?
    `,
    [id]
  );
}
/**
 * Devuelve todos los viajes de una fecha concreta.
 */
static async getTripsForDate(date: Date): Promise<
  Array<{
    id: number;
    startTime: string;
    endTime: string | null;
    amount: number | null;
    source: TripSource;
    payment: PaymentType | null;
  }>
> {
  const db = await getDatabase();

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const dayKey = `${yyyy}-${mm}-${dd}`;

  const rows = await db.getAllAsync<{
    id: number;
    startTime: string;
    endTime: string | null;
    amount: number | null;
    source: TripSource;
    payment: PaymentType | null;
  }>(
    `
    SELECT
      id,
      startTime,
      endTime,
      amount,
      source,
      payment
    FROM trips
    WHERE substr(startTime, 1, 10) = ?
    ORDER BY startTime DESC
    `,
    [dayKey]
  );

  return rows;
}

/**
 * Devuelve un resumen de viajes entre dos fechas (inclusive)
 */
static async getSummaryBetweenDates(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  taxi: number;
  uber: number;
  cabify: number;
  efectivo: number;
  tarjeta: number;
}> {
  const db = await getDatabase();

  const format = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const rows = await db.getAllAsync<{
    amount: number | null;
    source: TripSource;
    payment: PaymentType | null;
  }>(
    `
    SELECT amount, source, payment
    FROM trips
    WHERE substr(startTime, 1, 10) BETWEEN ? AND ?
    `,
    [format(startDate), format(endDate)]
  );

  let total = 0;
  let taxi = 0;
  let uber = 0;
  let cabify = 0;
  let efectivo = 0;
  let tarjeta = 0;

  for (const t of rows) {
    const amount = t.amount ?? 0;
    total += amount;

    if (t.source === TripSource.TAXI) taxi += amount;
    if (t.source === TripSource.UBER) uber += amount;
    if (t.source === TripSource.CABIFY) cabify += amount;

    if (t.payment === PaymentType.CASH) efectivo += amount;
    if (t.payment === PaymentType.CARD || t.payment === PaymentType.APP)
      tarjeta += amount;
  }

  return { total, taxi, uber, cabify, efectivo, tarjeta };
}


}
