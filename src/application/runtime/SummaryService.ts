import { getCurrentMonthRange, getTodayRange } from "../../utils/dateUtils";
import { getOperationalWeekRange } from "../../domain/date-time";
import { getApplicationPersistence } from "../ports/persistence";
import { WeekConfigurationService } from "./WeekConfigurationService";
import { calculateSummary, type SummaryMetrics } from "./summaryMetrics";

export class SummaryService {
  static async getSummaryBetweenDates(startDate: Date, endDate: Date) {
    const { workdayRepository, tripRepository } = getApplicationPersistence();
    const workdays = await workdayRepository.findWorkdayIdsBetweenDates(startDate, endDate);

    if (workdays.length === 0) {
      return calculateSummary([]);
    }

    const trips = await tripRepository.findTripsForWorkdayIds(
      workdays.map((workday) => workday.id),
    );

    return calculateSummary(trips);
  }

  static async getSummaryForWorkday(workdayId: number) {
    const trips = await getApplicationPersistence().tripRepository.findTripsForWorkday(
      workdayId,
    );
    return calculateSummary(trips, true) as SummaryMetrics;
  }

  static async getTodaySummary() {
    const { start, end } = getTodayRange();
    return this.getSummaryBetweenDates(start, end);
  }

  static async getWeekSummary(anchorDate: Date = new Date()) {
    const weekStartDay = await WeekConfigurationService.getWeekStartDay();
    const { startDate, endDate } = getOperationalWeekRange(
      anchorDate,
      weekStartDay,
    );
    return this.getSummaryBetweenDates(startDate, endDate);
  }

  static async getMonthSummary() {
    const activeWorkday = await getApplicationPersistence().workdayRepository.getOpenWorkday();
    const anchorDate = activeWorkday ? new Date(activeWorkday.startTime) : new Date();
    const { start, end } = getCurrentMonthRange(anchorDate);
    return this.getSummaryBetweenDates(start, end);
  }
}
