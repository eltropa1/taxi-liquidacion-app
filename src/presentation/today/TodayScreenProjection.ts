import {
  calculateProgress,
  calculateRemainingAmount,
} from "../../domain/trips/tripEconomics";
import { calculateWorkdayKilometers } from "../../domain/workdays/workdayOdometer";
import { PaymentType, TripSource } from "../../constants/enums";
import type { ServiceStatus } from "../../domain/services";

export type TodayTripRow = {
  id: number;
  startTime: string;
  endTime: string | null;
  serviceStatus?: ServiceStatus | null;
  amount: number | null;
  source: TripSource;
  payment: PaymentType | null;
};

export type TodayGoals = Readonly<{
  daily: number;
  weekly: number;
  monthly: number;
}>;

export type TodayWorkdayInfo = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  startOdometer: number | null;
  endOdometer: number | null;
  isClosed: boolean;
}>;

export type TodayActiveWorkday = {
  id: number;
  startTime: string;
  startOdometer: number | null;
} | null | undefined;

export type TodayDailySummary = {
  servicesTotal: number;
  servicesTaxi: number;
  servicesUber: number;
  servicesCabify: number;
  servicesFreeNow: number;
  servicesOther: number;
  total: number;
  taxi: number;
  uber: number;
  cabify: number;
  freeNow: number;
  efectivo: number;
  tarjeta: number;
  app: number;
  propinaTarjeta: number;
  propinaEfectivo: number;
} | null;

export type TodayScreenData = Readonly<{
  selectedDate: Date;
  activeTripId: number | null;
  trips: readonly TodayTripRow[];
  weeklySummary: any;
  monthlySummary: any;
  goals: TodayGoals;
  workdayInfo: TodayWorkdayInfo | null;
  activeWorkday: TodayActiveWorkday;
  dailySummary: TodayDailySummary;
}>;

export type TodayScreenProjection = Readonly<{
  isToday: boolean;
  resolvedWorkdayInfo: Readonly<{
    startTime: string;
    endTime: string | null;
    startOdometer: number | null;
    endOdometer: number | null;
    workedKilometers: number | null;
    isClosed: boolean;
    isVirtual: boolean;
  }>;
  totalToday: number;
  remainingDaily: number | null;
  remainingWeekly: number | null;
  remainingMonthly: number | null;
  dailyProgress: number | null;
  weeklyProgress: number | null;
  monthlyProgress: number | null;
  dailyStatus: { label: string; color: string } | null;
  weeklyStatus: { label: string; color: string } | null;
  monthlyStatus: { label: string; color: string } | null;
}>;

function getStatus(percent: number | null) {
  if (percent === null) return null;
  if (percent >= 80) return { label: "Vas bien", color: "#2ecc71" };
  if (percent >= 50) return { label: "Vas justo", color: "#f1c40f" };
  return { label: "Vas mal", color: "#e74c3c" };
}

function buildResolvedWorkdayInfo(
  selectedDate: Date,
  workdayInfo: TodayWorkdayInfo | null,
) {
  return workdayInfo
    ? {
      startTime: workdayInfo.startTime,
      endTime: workdayInfo.endTime,
      startOdometer: workdayInfo.startOdometer,
      endOdometer: workdayInfo.endOdometer,
      workedKilometers: calculateWorkdayKilometers(
        workdayInfo.startOdometer,
        workdayInfo.endOdometer,
      ),
      isClosed: workdayInfo.isClosed,
      isVirtual: false,
    }
    : {
        startTime: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          0,
          0,
          0,
        ).toISOString(),
        endTime: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59,
        ).toISOString(),
        startOdometer: null,
        endOdometer: null,
        workedKilometers: null,
        isClosed: true,
        isVirtual: true,
      };
}

function getDailyTotal(
  dailySummary: TodayDailySummary,
  trips: readonly TodayTripRow[],
) {
  if (dailySummary) return dailySummary.total;
  return trips.reduce((acc, trip) => acc + (trip.amount ?? 0), 0);
}

export function buildTodayScreenProjection(
  data: TodayScreenData,
): TodayScreenProjection {
  const isToday =
    data.selectedDate.toDateString() === new Date().toDateString();
  const resolvedWorkdayInfo = buildResolvedWorkdayInfo(
    data.selectedDate,
    data.workdayInfo,
  );
  const totalToday = getDailyTotal(data.dailySummary, data.trips);

  const remainingDaily = calculateRemainingAmount(totalToday, data.goals.daily);
  const remainingWeekly =
    data.weeklySummary !== null
      ? calculateRemainingAmount(data.weeklySummary.total, data.goals.weekly)
      : null;
  const remainingMonthly =
    data.monthlySummary !== null
      ? calculateRemainingAmount(data.monthlySummary.total, data.goals.monthly)
      : null;

  const dailyProgress = calculateProgress(totalToday, data.goals.daily);
  const weeklyProgress = calculateProgress(
    data.weeklySummary?.total ?? 0,
    data.goals.weekly,
  );
  const monthlyProgress = calculateProgress(
    data.monthlySummary?.total ?? 0,
    data.goals.monthly,
  );

  return {
    isToday,
    resolvedWorkdayInfo,
    totalToday,
    remainingDaily,
    remainingWeekly,
    remainingMonthly,
    dailyProgress,
    weeklyProgress,
    monthlyProgress,
    dailyStatus: getStatus(dailyProgress),
    weeklyStatus: getStatus(weeklyProgress),
    monthlyStatus: getStatus(monthlyProgress),
  };
}
