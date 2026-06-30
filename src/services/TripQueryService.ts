import { PaymentType, TripSource } from "../constants/enums";
import { getDatabase } from "../database/database";
import { Trip } from "../domain/trips/canonical";
import {
  TripRecordMapper,
  TripRecordRow,
} from "../database/mappers/TripRecordMapper";
import { WorkdayService } from "./WorkdayService";

export class TripQueryService {
  private static async getTripRecordById(
    id: number,
  ): Promise<TripRecordRow | null> {
    const db = await getDatabase();

    return db.getFirstAsync<TripRecordRow>(
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

  static async getCanonicalTripById(id: number): Promise<Trip | null> {
    const row = await this.getTripRecordById(id);
    if (!row) return null;

    return TripRecordMapper.toCanonicalTrip(row);
  }

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
    const row = await this.getTripRecordById(id);
    if (!row) return null;

    return {
      id: row.id,
      startTime: row.startTime,
      endTime: row.endTime,
      amount: row.amount,
      payment: row.payment,
      source: row.source,
      customSource: row.customSource,
      chargedAmount: row.chargedAmount,
      cashTip: row.cashTip,
      manualPickupZone: row.manualPickupZone,
      manualDropoffZone: row.manualDropoffZone,
    };
  }

  static async getTripsForDate(date: Date) {
    const workday = await WorkdayService.getWorkdayForDate(date);
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

}
