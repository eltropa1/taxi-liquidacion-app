import { PaymentType, TripSource } from "../constants/enums";
import { getDatabase } from "../database/database";

import { TripGeoSnapshotRepository } from "../database/repositories/TripGeoSnapshotRepository";
import { GeoLocationFactory } from "../geo-location";
import { GeoAdministrativeResolver } from "../geo/geocoding/engine";

/**
 * Servicio de localización GPS (aislado).
 * TripService NO conoce detalles de GPS.
 */
const geoLocationService = GeoLocationFactory.create();

/**
 * Servicio de viajes.
 * Contiene TODA la lógica de negocio histórica
 * + integración GEO sin romper nada existente.
 */
export class TripService {
  // ===================================================
  // VIAJES
  // ===================================================

  /**
   * Inicia un nuevo viaje.
   * Registra snapshot GEO de INICIO (START).
   */
  static async startTrip(): Promise<void> {
    const db = await getDatabase();

    const startTime = new Date().toISOString();
    const createdAt = startTime;

    const workday = await this.getActiveWorkday();
    if (!workday) {
      throw new Error("No hay un día de trabajo abierto");
    }
   

    // 1️⃣ Crear viaje
    await db.runAsync(
      `
      INSERT INTO trips (startTime, source, createdAt, workdayId)
      VALUES (?, ?, ?, ?)
      `,
      [startTime, TripSource.TAXI, createdAt, workday.id],
    );

    // 2️⃣ Obtener viaje activo
    const trip = await db.getFirstAsync<{ id: number }>(
      `
      SELECT id
      FROM trips
      WHERE endTime IS NULL
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );

    if (!trip) return;

    // 3️⃣ GPS real
    const location = await geoLocationService.getCurrentLocation();

    // 4️⃣ Resolver snapshot administrativo
    const geoSnapshot = GeoAdministrativeResolver.resolve(
      location.latitude,
      location.longitude,
    );
    

    // 5️⃣ Guardar snapshot START
    await TripGeoSnapshotRepository.insert({
      tripId: trip.id,
      kind: "START",
      snapshot: geoSnapshot,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Devuelve el viaje activo (sin endTime).
   */
  static async getActiveTrip(): Promise<{
    id: number;
    startTime: string;
  } | null> {
    const db = await getDatabase();

    return db.getFirstAsync(
      `
      SELECT id, startTime
      FROM trips
      WHERE endTime IS NULL
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );
  }

  /**
   * Devuelve un viaje por ID.
   * Usado exclusivamente para edición.
   */
  static async getTripById(id: number): Promise<{
    id: number;
    startTime: string;
    endTime: string | null;
    amount: number | null;
    payment: PaymentType | null;
    source: TripSource;
    customSource: string | null;
    chargedAmount: number | null;
    cashTip: number | null;
    manualPickupZone: string | null;
    manualDropoffZone: string | null;
  } | null> {
    const db = await getDatabase();

    return db.getFirstAsync(
      `
      SELECT
        id,
        startTime,
        endTime,
        amount,
        payment,
        source,
        customSource,
        chargedAmount,
        cashTip,
        manualPickupZone,
        manualDropoffZone
      FROM trips
      WHERE id = ?
      `,
      [id],
    );
  }

  /**
   * Finaliza el viaje activo.
   * Registra snapshot GEO de FIN (END).
   */
  static async finishActiveTripWithData(
    amount: number,
    payment: PaymentType,
    source: TripSource,
    customSource?: string,
    chargedAmount?: number,
    cashTip?: number,
  ): Promise<void> {
    const db = await getDatabase();

    const active = await db.getFirstAsync<{ id: number }>(
      `
      SELECT id
      FROM trips
      WHERE endTime IS NULL
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );

    if (!active) return;

    const endTime = new Date().toISOString();
  
    // Importe realmente cobrado
    const finalChargedAmount =
      payment === PaymentType.CARD && typeof chargedAmount === "number"
        ? chargedAmount
        : amount;

    // 1️⃣ Cerrar viaje
    await db.runAsync(
      `
      UPDATE trips
      SET endTime = ?, amount = ?, chargedAmount = ?, cashTip = ?, payment = ?, source = ?, customSource = ?
      WHERE id = ?
      `,
      [
        endTime,
        amount,
        finalChargedAmount,
        cashTip ?? null,
        payment,
        source,
        customSource ?? null,
        active.id,
      ],
    );

    // 2️⃣ GPS real
    const location = await geoLocationService.getCurrentLocation();

    // 3️⃣ Resolver snapshot administrativo
    const geoSnapshot = GeoAdministrativeResolver.resolve(
      location.latitude,
      location.longitude,
    );

    // 4️⃣ Guardar snapshot END
    await TripGeoSnapshotRepository.insert({
      tripId: active.id,
      kind: "END",
      snapshot: geoSnapshot,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Actualiza datos de un viaje.
   */
  static async updateTrip(
    id: number,
    amount: number,
    payment: PaymentType,
    source: TripSource,
    customSource?: string,
    chargedAmount?: number,
    cashTip?: number,
  ): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      `
      UPDATE trips
      SET amount = ?, payment = ?, source = ?, customSource = ?, chargedAmount = ?, cashTip = ?
      WHERE id = ?
      `,
      [
        amount,
        payment,
        source,
        customSource ?? null,
        chargedAmount ?? null,
        cashTip ?? null,
        id,
      ],
    );
  }
  /**
   * Actualiza las horas de un viaje existente.
   * No recalcula importes ni resúmenes.
   */
  static async updateTripTimes(
    id: number,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      `
    UPDATE trips
    SET startTime = ?, endTime = ?
    WHERE id = ?
    `,
      [startTime.toISOString(), endTime.toISOString(), id],
    );
  }

  /**
 * Actualiza las zonas manuales de un viaje.
 * No altera snapshots GEO automáticos.
 */
static async updateTripManualZones(
  id: number,
  pickupZone: string | null,
  dropoffZone: string | null
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
    UPDATE trips
    SET manualPickupZone = ?, manualDropoffZone = ?
    WHERE id = ?
    `,
    [pickupZone, dropoffZone, id]
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
      [id],
    );
  }

  // ===================================================
  // CONSULTAS POR FECHA / WORKDAY
  // ===================================================

  static async getTripsForDate(date: Date) {
    const workday = await this.getWorkdayForDate(date);
    if (!workday) return [];

    return this.getTripsForWorkday(workday.id);
  }

  static async getTripsForWorkday(workdayId: number) {
    const db = await getDatabase();

    return db.getAllAsync(
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
      [workdayId],
    );
  }

  // ===================================================
  // RESÚMENES (SIN CAMBIOS)
  // ===================================================

  static async getSummaryBetweenDates(startDate: Date, endDate: Date) {
    const db = await getDatabase();

    const format = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;

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
      [format(startDate), format(endDate)],
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

  // ===================================================
  // DÍAS DE TRABAJO
  // ===================================================

  static async openWorkday(): Promise<void> {
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

  static async closeActiveWorkday(): Promise<void> {
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

  static async getActiveWorkday(): Promise<{
    id: number;
    startTime: string;
  } | null> {
    const db = await getDatabase();

    return db.getFirstAsync(
      `
      SELECT id, startTime
      FROM workdays
      WHERE isClosed = 0
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );
  }

  static async getWorkdayForDate(
    date: Date,
  ): Promise<{ id: number; startTime: string } | null> {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      const active = await this.getActiveWorkday();
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
   * Devuelve información del día de trabajo
   * asociado EXACTAMENTE a una fecha natural.
   *
   * IMPORTANTE:
   * - Solo devuelve workday si EMPIEZA ese día.
   * - No devuelve el último día trabajado anterior.
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
      ],
    );
  }
}
