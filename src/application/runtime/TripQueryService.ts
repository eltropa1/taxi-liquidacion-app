import { Trip } from "../../domain/trips/canonical";
import type { PaymentType, TripSource } from "../../constants/enums";
import { getApplicationPersistence } from "../ports/persistence";

type TripRow = {
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
};

export class TripQueryService {
  static async getActiveTrip(): Promise<{
    id: number;
    startTime: string;
  } | null> {
    return getApplicationPersistence().tripRepository.findActiveTrip();
  }

  static async getCanonicalTripById(id: number): Promise<Trip | null> {
    return getApplicationPersistence().tripRepository.findCanonicalTripById(id);
  }

  static async getTripById(id: number): Promise<TripRow | null> {
    return getApplicationPersistence().tripRepository.findTripById(id);
  }

  static async getTripsForDate(date: Date) {
    const workday = await getApplicationPersistence().workdayRepository.getWorkdayForDate(
      date,
    );
    if (!workday) return [];

    return getApplicationPersistence().tripRepository.findTripsForWorkday(workday.id);
  }

  static async getTripsForWorkday(workdayId: number) {
    return getApplicationPersistence().tripRepository.findTripsForWorkday(
      workdayId,
    );
  }
}
