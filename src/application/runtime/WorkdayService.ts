import { getApplicationPersistence } from "../ports/persistence";

export class WorkdayService {
  static async getOpenWorkday() {
    return getApplicationPersistence().workdayRepository.getOpenWorkday();
  }

  static async openWorkdayIfNeeded() {
    return getApplicationPersistence().workdayRepository.openWorkdayIfNeeded();
  }

  static async openWorkday() {
    return getApplicationPersistence().workdayRepository.openWorkday();
  }

  static async closeCurrentWorkday() {
    await getApplicationPersistence().workdayRepository.closeCurrentWorkday();
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
