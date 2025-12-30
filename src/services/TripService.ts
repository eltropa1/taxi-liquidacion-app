import { PaymentType, TripSource } from "../constants/enums";
import { getDatabase } from "../database/database";

/**
 * Servicio de viajes.
 * Contiene la lógica de negocio relacionada con los viajes y los días de trabajo.
 */
export class TripService {
  // ===================================================
  // VIAJES
  // ===================================================

  /**
   * Inicia un nuevo viaje.
   * El viaje queda asociado al día de trabajo activo.
   */
  static async startTrip(): Promise<void> {
    const db = await getDatabase();

    const startTime = new Date().toISOString();
    const createdAt = startTime;

    const workday = await this.getActiveWorkday();
    if (!workday) {
      throw new Error("No hay un día de trabajo abierto");
    }

    await db.runAsync(
      `
      INSERT INTO trips (startTime, source, createdAt, workdayId)
      VALUES (?, ?, ?, ?)
      `,
      [startTime, TripSource.TAXI, createdAt, workday.id]
    );
  }

  /**
   * Devuelve el viaje activo (sin endTime), si existe.
   */
  static async getActiveTrip(): Promise<{
    id: number;
    startTime: string;
  } | null> {
    const db = await getDatabase();

    const result = await db.getFirstAsync<{
      id: number;
      startTime: string;
    }>(
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
   * Finaliza el viaje activo guardando importe, forma de pago y origen.
   */
  static async finishActiveTripWithData(
    amount: number,
    payment: PaymentType,
    source: TripSource,
    customSource?: string
  ): Promise<void> {
    const db = await getDatabase();

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
      SET endTime = ?, amount = ?, payment = ?, source = ?, customSource = ?
      WHERE id = ?
      `,
      [endTime,
        amount, 
        payment, 
        source, 
        customSource ?? null,
        active.id]
    );
  }

  /**
   * Actualiza los datos de un viaje existente.
   */
  static async updateTrip(
    id: number,
    amount: number,
    payment: PaymentType,
    source: TripSource,
    customSource?: string
  ): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      `
      UPDATE trips
      SET amount = ?, payment = ?, source = ?, customSource = ?
      WHERE id = ?
      `,
      [amount, payment, source, customSource ?? null, id]
    );
  }

  /**
   * Borra un viaje.
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

  // ===================================================
  // CONSULTAS POR FECHA / DÍA DE TRABAJO
  // ===================================================

  /**
   * Devuelve los viajes del día de trabajo correspondiente a una fecha.
   * La fecha puede pertenecer a un workday que cruce medianoche.
   */
  static async getTripsForDate(
    date: Date
  ): Promise<
    Array<{
      id: number;
      startTime: string;
      endTime: string | null;
      amount: number | null;
      source: TripSource;
      payment: PaymentType | null;
    }>
  > {
    const workday = await this.getWorkdayForDate(date);
    if (!workday) return [];

    return this.getTripsForWorkday(workday.id);
  }

  /**
   * Devuelve todos los viajes asociados a un día de trabajo concreto.
   */
  static async getTripsForWorkday(
    workdayId: number
  ): Promise<
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
      WHERE workdayId = ?
      ORDER BY startTime DESC
      `,
      [workdayId]
    );

    return rows;
  }

  // ===================================================
  // RESÚMENES
  // ===================================================

  /**
   * Devuelve un resumen de viajes entre dos fechas (inclusive).
   * ⚠️ Nota: este resumen sigue siendo por fecha natural,
   * no por día de trabajo (lo ajustaremos más adelante si quieres).
   */
  static async getSummaryBetweenDates(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    taxi: number;
    uber: number;
    cabify: number;
    freeNow: number;
    efectivo: number;
    tarjeta: number;
    app: number;
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
    let freeNow = 0;
    let efectivo = 0;
    let tarjeta = 0;
    let app = 0;

    for (const t of rows) {
      const amount = t.amount ?? 0;
      total += amount;

      // --- Plataforma origen ---
      if (t.source === TripSource.TAXI) taxi += amount;
      if (t.source === TripSource.UBER) uber += amount;
      if (t.source === TripSource.CABIFY) cabify += amount;
      if (t.source === TripSource.FREE_NOW) freeNow += amount; // FreeNow por separado

      // --- Forma de pago ---
      if (t.payment === PaymentType.CASH) efectivo += amount;
      if (t.payment === PaymentType.CARD) tarjeta += amount;
      if (t.payment === PaymentType.APP) app += amount;
    }

    return { total, taxi, uber, cabify, freeNow, efectivo, tarjeta, app };
  }  



/**
 * Devuelve un resumen para un día de trabajo concreto.
 * Esta es la forma CORRECTA de calcular totales diarios.
 * En este resumen, FreeNow se muestra por separado.
 * efectivo y tarjeta se calculan por separado.
 */
static async getSummaryForWorkday(
  workdayId: number
): Promise<{
  total: number;
  taxi: number;
  uber: number;
  cabify: number;
  freeNow: number;
  efectivo: number;
  tarjeta: number;
  app: number;
}> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{
    amount: number | null;
    source: TripSource;
    payment: PaymentType | null;
  }>(
    `
    SELECT amount, source, payment
    FROM trips
    WHERE workdayId = ?
    `,
    [workdayId]
  );

  let total = 0;
  let taxi = 0;
  let uber = 0;
  let cabify = 0;
  let freeNow = 0;
  let efectivo = 0;
  let tarjeta = 0;
  let app = 0;

  for (const t of rows) {
    const amount = t.amount ?? 0;
    total += amount;

    // --- Plataforma origen ---
    if (t.source === TripSource.TAXI) taxi += amount;
    if (t.source === TripSource.UBER) uber += amount;
    if (t.source === TripSource.CABIFY) cabify += amount;
    if (t.source === TripSource.FREE_NOW) freeNow += amount; // FreeNow por separado

    // --- Forma de pago ---
    if (t.payment === PaymentType.CASH) efectivo += amount;
    if (t.payment === PaymentType.CARD) tarjeta += amount;
    if (t.payment === PaymentType.APP) app += amount;
  }

  return { total, taxi, uber, cabify, freeNow, efectivo, tarjeta, app };
}



  // ===================================================
  // DÍAS DE TRABAJO
  // ===================================================

  /**
   * Abre un nuevo día de trabajo.
   * Solo debe llamarse si no hay uno activo.
   */
  static async openWorkday(): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `
      INSERT INTO workdays (startTime, createdAt)
      VALUES (?, ?)
      `,
      [now, now]
    );
  }

  /**
   * Cierra el día de trabajo activo.
   */
  static async closeActiveWorkday(): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `
      UPDATE workdays
      SET endTime = ?, isClosed = 1
      WHERE isClosed = 0
      `,
      [now]
    );
  }

  /**
   * Devuelve el día de trabajo abierto actualmente.
   */
  static async getActiveWorkday(): Promise<{
    id: number;
    startTime: string;
  } | null> {
    const db = await getDatabase();

    const result = await db.getFirstAsync<{
      id: number;
      startTime: string;
    }>(
      `
      SELECT id, startTime
      FROM workdays
      WHERE isClosed = 0
      ORDER BY startTime DESC
      LIMIT 1
      `
    );

    return result ?? null;
  }

  /**
   * Devuelve el día de trabajo al que pertenece una fecha dada.
   * Si el día no está cerrado, se considera hasta el momento actual.
   */
  static async getWorkdayForDate(date: Date): Promise<{
    id: number;
    startTime: string;
    endTime: string | null;
  } | null> {
    const db = await getDatabase();
    const iso = date.toISOString();

    const result = await db.getFirstAsync<{
      id: number;
      startTime: string;
      endTime: string | null;
    }>(
      `
      SELECT id, startTime, endTime
      FROM workdays
      WHERE startTime <= ?
        AND (endTime >= ? OR endTime IS NULL)
      ORDER BY startTime DESC
      LIMIT 1
      `,
      [iso, iso]
    );

    return result ?? null;
  }

/**
 * Devuelve información del día de trabajo
 * al que pertenece una fecha (por solape de día natural).
 */
static async getWorkdayInfoForDate(date: Date): Promise<{
  id: number;
  startTime: string;
  endTime: string | null;
  isClosed: boolean;
} | null> {
  const db = await getDatabase();

  // Inicio y fin del día natural seleccionado
  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0
  ).toISOString();

  const dayEnd = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59
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
    WHERE startTime <= ?
      AND (endTime >= ? OR endTime IS NULL)
    ORDER BY startTime DESC
    LIMIT 1
    `,
    [dayEnd, dayStart]
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
 * Crea un viaje manual completo.
 * No depende de startTrip / finishTrip.
 */
static async createManualTrip(params: {
  startTime: Date;
  endTime: Date;
  amount: number;
  payment: PaymentType;
  source: TripSource;
}) {
  const db = await getDatabase();

  const workday = await this.getWorkdayForDate(params.startTime);
  if (!workday) {
    throw new Error("No existe día de trabajo para esa fecha");
  }

  await db.runAsync(
    `
    INSERT INTO trips (
      startTime,
      endTime,
      amount,
      payment,
      source,
      createdAt,
      workdayId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      params.startTime.toISOString(),
      params.endTime.toISOString(),
      params.amount,
      params.payment,
      params.source,
      new Date().toISOString(),
      workday.id,
    ]
  );
}
}