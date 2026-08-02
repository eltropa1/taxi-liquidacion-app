import type {
  HistoricalTripUpsertInput,
  TripEditedInput,
  TripExportRecord,
  TripManualInput,
  TripManualZoneUpdateInput,
  TripListRecord,
  TripPersistenceRecord,
  TripRepositoryPort,
  TripStartInput,
  TripTimeUpdateInput,
  TripServiceUpdateInput,
  TripUpdateInput,
} from "../../../application/ports/persistence";
import type { Trip } from "../../../domain/trips/canonical";
import type { PersistenceDatabase } from "../database";
import { isUniqueConstraintViolation } from "../database/sqliteErrors";
import { TripRecordMapper } from "../mappers/TripRecordMapper";
import type { TripRecordRow } from "../mappers/TripRecordMapper";

export class SqliteTripRepository implements TripRepositoryPort {
  constructor(private readonly database: PersistenceDatabase) {}

  async runInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    await this.database.execAsync("BEGIN IMMEDIATE TRANSACTION;");

    try {
      const result = await operation();
      await this.database.execAsync("COMMIT;");
      return result;
    } catch (error) {
      try {
        await this.database.execAsync("ROLLBACK;");
      } catch (rollbackError) {
        console.error("Error ejecutando ROLLBACK de trip transaction", rollbackError);
      }

      throw error;
    }
  }

  async createStartedTrip(input: TripStartInput): Promise<{ id: number }> {
    const createdAt = input.createdAt ?? input.startedAt;

    try {
      const result = await this.database.runAsync(
        `
        INSERT INTO trips (startTime, source, createdAt, workdayId)
        VALUES (?, ?, ?, ?)
        `,
        [
          input.startedAt.toISOString(),
          input.source,
          createdAt.toISOString(),
          input.workdayId,
        ],
      );

      return { id: Number(result.lastInsertRowId ?? 0) };
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new Error(
          "Ya tienes un viaje en curso. Debes finalizarlo antes de iniciar otro.",
        );
      }
      throw error;
    }
  }

  async createManualTrip(input: TripManualInput): Promise<{ id: number }> {
    const createdAt = input.createdAt ?? new Date();
    const result = await this.database.runAsync(
      `
      INSERT INTO trips (
        startTime,
        endTime,
        serviceStatus,
        amount,
        payment,
        source,
        createdAt,
        workdayId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.startTime.toISOString(),
        input.endTime.toISOString(),
        input.serviceStatus ?? "completed",
        input.amount,
        input.payment,
        input.source,
        createdAt.toISOString(),
        input.workdayId,
      ],
    );

    return { id: Number(result.lastInsertRowId ?? 0) };
  }

  async findActiveTrip(): Promise<{ id: number; startTime: string } | null> {
    return this.database.getFirstAsync(
      `
      SELECT id, startTime
      FROM trips
      WHERE endTime IS NULL AND voidedAt IS NULL
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );
  }

  async findTripById(id: number): Promise<TripPersistenceRecord | null> {
    return this.database.getFirstAsync<TripPersistenceRecord>(
      `
      SELECT
        id,
        startTime,
        endTime,
        serviceStatus,
        amount,
        payment,
        source,
        customSource,
        chargedAmount,
        cashTip,
        manualPickupZone,
        manualDropoffZone,
        workdayId,
        closedWorkdayEditedAt
      FROM trips
      WHERE id = ?
      `,
      [id],
    );
  }

  async findCanonicalTripById(id: number): Promise<Trip | null> {
    const row = await this.database.getFirstAsync<TripRecordRow>(
      `
      SELECT
        id,
        startTime,
        endTime,
        serviceStatus,
        amount,
        payment,
        source,
        customSource,
        chargedAmount,
        cashTip,
        manualPickupZone,
        manualDropoffZone,
        workdayId
      FROM trips
      WHERE id = ?
      `,
      [id],
    );

    return row ? TripRecordMapper.toCanonicalTrip(row) : null;
  }

  async findTripsForWorkday(workdayId: number): Promise<TripListRecord[]> {
    return this.database.getAllAsync<TripListRecord>(
      `
      SELECT
        id,
        startTime,
        endTime,
        serviceStatus,
        amount,
        source,
        payment,
        chargedAmount,
        cashTip
      FROM trips
      WHERE workdayId = ? AND voidedAt IS NULL
      ORDER BY startTime DESC
      `,
      [workdayId],
    );
  }

  async findTripsForWorkdayIds(
    workdayIds: number[],
  ): Promise<TripListRecord[]> {
    if (workdayIds.length === 0) {
      return [];
    }

    const placeholders = workdayIds.map(() => "?").join(",");

    return this.database.getAllAsync<TripListRecord>(
      `
      SELECT
        id,
        startTime,
        endTime,
        serviceStatus,
        amount,
        source,
        payment,
        chargedAmount,
        cashTip
      FROM trips
      WHERE workdayId IN (${placeholders}) AND voidedAt IS NULL
      ORDER BY startTime ASC
      `,
      workdayIds,
    );
  }

  async findAllTripsForExport(): Promise<TripExportRecord[]> {
    return this.database.getAllAsync<TripExportRecord>(
      `
      SELECT
        startTime,
        endTime,
        amount,
        payment,
        source
      FROM trips
      WHERE voidedAt IS NULL
      ORDER BY startTime ASC
      `,
    );
  }

  async updateTrip(input: TripUpdateInput): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE trips
      SET amount = ?, payment = ?, source = ?, customSource = ?, chargedAmount = ?, cashTip = ?, serviceStatus = ?
      WHERE id = ?
      `,
      [
        input.amount,
        input.payment,
        input.source,
        input.customSource ?? null,
        input.chargedAmount ?? null,
        input.cashTip ?? null,
        input.serviceStatus ?? "completed",
        input.id,
      ],
    );
  }

  async updateTripService(input: TripServiceUpdateInput): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE trips
      SET amount = ?, payment = ?, source = ?, customSource = ?, chargedAmount = ?, cashTip = ?, serviceStatus = ?
      WHERE id = ?
      `,
      [
        input.amount ?? null,
        input.payment ?? null,
        input.source,
        input.customSource ?? null,
        input.chargedAmount ?? null,
        input.cashTip ?? null,
        input.serviceStatus,
        input.id,
      ],
    );
  }

  async updateTripTimes(input: TripTimeUpdateInput): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE trips
      SET startTime = ?, endTime = ?
      WHERE id = ?
      `,
      [input.startTime.toISOString(), input.endTime.toISOString(), input.id],
    );
  }

  async updateTripManualZones(
    input: TripManualZoneUpdateInput,
  ): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE trips
      SET manualPickupZone = ?, manualDropoffZone = ?
      WHERE id = ?
      `,
      [input.pickupZone, input.dropoffZone, input.id],
    );
  }

  async updateEditedTrip(input: TripEditedInput): Promise<void> {
    await this.updateTripManualZones({
      id: input.id,
      pickupZone: input.manualPickupZone,
      dropoffZone: input.manualDropoffZone,
    });

    await this.updateTripTimes({
      id: input.id,
      startTime: input.startTime,
      endTime: input.endTime,
    });

    await this.updateTrip({
      id: input.id,
      amount: input.amount,
      payment: input.payment,
      source: input.source,
      customSource: input.customSource,
      chargedAmount: input.chargedAmount,
      cashTip: input.cashTip,
      serviceStatus: input.serviceStatus ?? "completed",
    });
  }

  async voidTrip(id: number, voidedAt: Date): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE trips
      SET voidedAt = ?
      WHERE id = ?
      `,
      [voidedAt.toISOString(), id],
    );
  }

  async stampClosedWorkdayEdit(id: number, editedAt: Date): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE trips
      SET closedWorkdayEditedAt = ?
      WHERE id = ?
      `,
      [editedAt.toISOString(), id],
    );
  }

  async upsertHistoricalTrip(input: HistoricalTripUpsertInput): Promise<void> {
    await this.database.runAsync(
      `
      INSERT INTO trips (
        id,
        startTime,
        endTime,
        serviceStatus,
        amount,
        payment,
        source,
        createdAt,
        chargedAmount,
        cashTip,
        customSource,
        manualPickupZone,
        manualDropoffZone,
        workdayId,
        voidedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        startTime = excluded.startTime,
        endTime = excluded.endTime,
        serviceStatus = excluded.serviceStatus,
        amount = excluded.amount,
        payment = excluded.payment,
        source = excluded.source,
        createdAt = excluded.createdAt,
        chargedAmount = excluded.chargedAmount,
        cashTip = excluded.cashTip,
        customSource = excluded.customSource,
        manualPickupZone = excluded.manualPickupZone,
        manualDropoffZone = excluded.manualDropoffZone,
        workdayId = excluded.workdayId,
        voidedAt = excluded.voidedAt
      `,
      [
        input.id,
        input.startTime.toISOString(),
        input.endTime ? input.endTime.toISOString() : null,
        input.serviceStatus,
        input.amount,
        input.payment,
        input.source,
        input.createdAt.toISOString(),
        input.chargedAmount,
        input.cashTip,
        input.customSource,
        input.manualPickupZone,
        input.manualDropoffZone,
        input.workdayId,
        input.voidedAt ? input.voidedAt.toISOString() : null,
      ],
    );
  }
}
