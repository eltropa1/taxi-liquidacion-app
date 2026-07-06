import { getApplicationPersistence } from "../ports/persistence";

export class WorkdayService {
  static async getOpenWorkday() {
    return getApplicationPersistence().workdayRepository.getOpenWorkday();
  }

  static async openWorkdayIfNeeded() {
    return getApplicationPersistence().workdayRepository.getOpenWorkday();
  }

  static async openWorkday(startOdometer: number) {
    return getApplicationPersistence().workdayRepository.openWorkday(
      startOdometer,
    );
  }

  static async closeCurrentWorkday(endOdometer?: number | null) {
    await getApplicationPersistence().workdayRepository.closeCurrentWorkday(
      endOdometer ?? null,
    );
  }

  static async getWorkdayForDate(date: Date) {
    return getApplicationPersistence().workdayRepository.getWorkdayForDate(date);
  }

  static async getWorkdayInfoForDate(date: Date) {
    return getApplicationPersistence().workdayRepository.getWorkdayInfoForDate(date);
  }

  static async assignTripToCurrentWorkday(tripId: number) {
    await getApplicationPersistence().workdayRepository.assignTripToCurrentWorkday(
      tripId,
    );
  }
}
