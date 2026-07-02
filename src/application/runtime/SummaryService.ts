import { getCurrentMonthRange, getTodayRange } from "../../utils/dateUtils";
import { PaymentType, TripSource } from "../../constants/enums";
import { getOperationalWeekRange } from "../../domain/date-time";
import { getApplicationPersistence } from "../ports/persistence";
import { WeekConfigurationService } from "./WeekConfigurationService";

type Summary = {
  total: number;
  taxi: number;
  uber: number;
  cabify: number;
  freeNow: number;
  efectivo: number;
  tarjeta: number;
  app: number;
  propinaTarjeta?: number;
  propinaEfectivo?: number;
};

function emptySummary(includeTips = false): Summary {
  return {
    total: 0,
    taxi: 0,
    uber: 0,
    cabify: 0,
    freeNow: 0,
    efectivo: 0,
    tarjeta: 0,
    app: 0,
    ...(includeTips
      ? {
          propinaTarjeta: 0,
          propinaEfectivo: 0,
        }
      : {}),
  };
}

function accumulateSummary(summary: Summary, trip: {
  amount: number | null;
  chargedAmount?: number | null;
  cashTip?: number | null;
  source: TripSource;
  payment: PaymentType | null;
}) {
  const amount = trip.amount ?? 0;
  const chargedAmount = trip.chargedAmount ?? amount;

  summary.total += amount;

  if (trip.source === TripSource.TAXI) summary.taxi += amount;
  if (trip.source === TripSource.UBER) summary.uber += amount;
  if (trip.source === TripSource.CABIFY) summary.cabify += amount;
  if (trip.source === TripSource.FREE_NOW) summary.freeNow += amount;

  if (trip.payment === PaymentType.CASH) summary.efectivo += amount;
  if (trip.payment === PaymentType.CARD) summary.tarjeta += chargedAmount;
  if (trip.payment === PaymentType.APP) summary.app += amount;

  if ("propinaTarjeta" in summary && trip.payment === PaymentType.CARD && chargedAmount > amount) {
    summary.propinaTarjeta = (summary.propinaTarjeta ?? 0) + (chargedAmount - amount);
  }

  if ("propinaEfectivo" in summary && trip.payment === PaymentType.CASH && (trip.cashTip ?? 0) > 0) {
    summary.propinaEfectivo = (summary.propinaEfectivo ?? 0) + (trip.cashTip ?? 0);
  }
}

export class SummaryService {
  static async getSummaryBetweenDates(startDate: Date, endDate: Date) {
    const { workdayRepository, tripRepository } = getApplicationPersistence();
    const workdays = await workdayRepository.findWorkdayIdsBetweenDates(startDate, endDate);

    if (workdays.length === 0) {
      return emptySummary();
    }

    const trips = await tripRepository.findTripsForWorkdayIds(
      workdays.map((workday) => workday.id),
    );

    const summary = emptySummary();
    for (const trip of trips) {
      accumulateSummary(summary, trip);
    }

    return summary;
  }

  static async getSummaryForWorkday(workdayId: number) {
    const trips = await getApplicationPersistence().tripRepository.findTripsForWorkday(
      workdayId,
    );
    const summary = emptySummary(true);

    for (const trip of trips) {
      accumulateSummary(summary, trip);
    }

    return summary as Required<Summary>;
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
