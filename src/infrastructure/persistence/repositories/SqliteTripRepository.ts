import type {
  TripEditedInput,
  TripExportRecord,
  TripManualInput,
  TripManualZoneUpdateInput,
  TripListRecord,
  TripPersistenceRecord,
  TripRepositoryPort,
  TripStartInput,
  TripTimeUpdateInput,
  TripUpdateInput,
} from "../../../application/ports/persistence";
import type { Trip } from "../../../domain/trips/canonical";
import type { PersistenceDatabase } from "../database";
import { TripRecordMapper } from "../mappers/TripRecordMapper";
import type { TripRecordRow } from "../mappers/TripRecordMapper";

export class SqliteTripRepository implements TripRepositoryPort {
  constructor(private readonly database: PersistenceDatabase) {}

  async createStartedTrip(input: TripStartInput): Promise<{ id: number }> {
    const createdAt = input.createdAt ?? input.startedAt;
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
  }

  async createManualTrip(input: TripManualInput): Promise<{ id: number }> {
    const createdAt = input.createdAt ?? new Date();
    const result = await this.database.runAsync(
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
        input.startTime.toISOString(),
        input.endTime.toISOString(),
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
      WHERE endTime IS NULL
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
  }

  async findCanonicalTripById(id: number): Promise<Trip | null> {
    const row = await this.database.getFirstAsync<TripRecordRow>(
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
        amount,
        source,
        payment,
        chargedAmount,
        cashTip
      FROM trips
      WHERE workdayId = ?
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
        amount,
        source,
        payment,
        chargedAmount,
        cashTip
      FROM trips
      WHERE workdayId IN (${placeholders})
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
      ORDER BY startTime ASC
      `,
    );
  }

  async updateTrip(input: TripUpdateInput): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE trips
      SET amount = ?, payment = ?, source = ?, customSource = ?, chargedAmount = ?, cashTip = ?
      WHERE id = ?
      `,
      [
        input.amount,
        input.payment,
        input.source,
        input.customSource ?? null,
        input.chargedAmount ?? null,
        input.cashTip ?? null,
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
    });
  }

  async deleteTrip(id: number): Promise<void> {
    await this.database.runAsync(
      `
      DELETE FROM trips
      WHERE id = ?
      `,
      [id],
    );
  }
}
