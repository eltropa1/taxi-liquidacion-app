import { SummaryService, TripQueryService, WorkdayService } from "../application/runtime";
import type {
  SummaryActiveWorkday,
  SummaryDailySummary,
  SummaryTripRecord,
  SummaryWorkdayInfo,
} from "../presentation/summary";

export type SummaryScreenCriticalState = Readonly<{
  workdayInfo: SummaryWorkdayInfo | null;
  activeWorkday: SummaryActiveWorkday;
}>;

export type SummaryScreenEnrichmentState = Readonly<{
  trips: readonly SummaryTripRecord[];
  dailySummary: SummaryDailySummary;
}>;

function isSameCalendarDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString();
}

export async function loadSummaryScreenCriticalState(
  selectedDate: Date,
): Promise<SummaryScreenCriticalState> {
  const activeWorkdayPromise = WorkdayService.getOpenWorkday().then((result) => result);
  const workdayInfoPromise = WorkdayService.getWorkdayInfoForDate(selectedDate).then(
    (result) => result,
  );

  const [activeWorkday, workdayInfo] = await Promise.all([
    activeWorkdayPromise,
    workdayInfoPromise,
  ]);

  return {
    activeWorkday: isSameCalendarDay(selectedDate, new Date()) ? activeWorkday : null,
    workdayInfo,
  };
}

export async function loadSummaryScreenEnrichmentState(
  workdayId: number | null,
): Promise<SummaryScreenEnrichmentState> {
  if (workdayId === null) {
    return {
      trips: [],
      dailySummary: null,
    };
  }

  const tripsPromise = TripQueryService.getTripsForWorkday(workdayId).then((result) => result);
  const dailySummaryPromise = SummaryService.getSummaryForWorkday(workdayId).then(
    (result) => result,
  );

  const [trips, dailySummary] = await Promise.all([
    tripsPromise,
    dailySummaryPromise,
  ]);

  return {
    trips,
    dailySummary,
  };
}

export async function loadSummaryScreenData(selectedDate: Date) {
  const criticalStatePromise = loadSummaryScreenCriticalState(selectedDate);

  const criticalState = await criticalStatePromise;
  const enrichmentState = await loadSummaryScreenEnrichmentState(
    criticalState.workdayInfo?.id ?? criticalState.activeWorkday?.id ?? null,
  );

  return {
    ...criticalState,
    ...enrichmentState,
  };
}
