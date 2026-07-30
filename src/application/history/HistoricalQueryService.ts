import type { GoalPolicy } from "../ports/runtime";
import { getApplicationPersistence } from "../ports/persistence";
import { GoalService, WeekConfigurationService } from "../runtime";
import { calculateSummary } from "../runtime/summaryMetrics";
import type { WorkdayRecord } from "../ports/persistence";
import { getCalendarMonthRange, getOperationalWeekRange } from "../../domain/date-time";
import type { WeekStartDay } from "../../domain/date-time";
import type {
  HistoricalDataset,
  HistoricalGoalContext,
  HistoricalPeriodBreakdown,
  HistoricalPeriodSelection,
  HistoricalTripRecord,
  HistoricalWorkdayBreakdown,
  HistoricalWorkdayRecord,
} from "./historicalQueryTypes";
import { resolveHistoricalPeriodRange } from "./historicalPeriodResolvers";

type WorkdayGoalResolution =
  | Readonly<{
      status: "resolved";
      source: "current" | "historical";
      policy: GoalPolicy;
    }>
  | Readonly<{
      status: "mixed";
      reason: "multiple_policies" | "missing_evidence";
    }>
  | Readonly<{
      status: "unknown";
      reason: "no_evidence" | "missing_policy";
    }>;

type HistoricalWorkdayEntry = Readonly<{
  workday: HistoricalWorkdayRecord;
  trips: readonly HistoricalTripRecord["trip"][];
  goalResolution: WorkdayGoalResolution;
  recordCount: number;
  summary: HistoricalWorkdayBreakdown["summary"];
}>;

function mapWorkday(row: WorkdayRecord): HistoricalWorkdayRecord {
  return {
    id: row.id,
    startTime: row.startTime,
    endTime: row.endTime,
    isClosed: row.isClosed,
    goalPolicyId: row.goalPolicyId ?? null,
    startOdometer: row.startOdometer,
    endOdometer: row.endOdometer,
  };
}

function sortByStartTime<T extends { startTime: string }>(items: readonly T[]) {
  return [...items].sort(
    (left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
  );
}

function resolvePeriodGoalContext(
  workdayContexts: readonly WorkdayGoalResolution[],
): HistoricalGoalContext {
  if (workdayContexts.length === 0) {
    return {
      status: "unknown",
      reason: "no_evidence",
    };
  }

  const resolvedContexts = workdayContexts.filter(
    (context): context is Extract<WorkdayGoalResolution, { status: "resolved" }> =>
      context.status === "resolved",
  );

  if (resolvedContexts.length === 0) {
    const unknownReason = workdayContexts.some(
      (context) => context.status !== "resolved" && context.reason === "missing_policy",
    )
      ? "missing_policy"
      : "no_evidence";

    return {
      status: "unknown",
      reason: unknownReason,
    };
  }

  const uniquePolicies = new Map(
    resolvedContexts.map((context) => [context.policy.id, context.policy]),
  );
  const sortedPolicies = [...uniquePolicies.values()].sort(
    (left, right) => new Date(left.effectiveAt).getTime() - new Date(right.effectiveAt).getTime(),
  );

  if (uniquePolicies.size > 1) {
    return {
      status: "mixed",
      reason: "multiple_policies",
      policies: sortedPolicies,
    };
  }

  if (workdayContexts.length !== resolvedContexts.length) {
    return {
      status: "mixed",
      reason: "missing_evidence",
      policies: sortedPolicies,
    };
  }

  const policy = resolvedContexts[0].policy;
  const source = resolvedContexts.some((context) => context.source === "current")
    ? "current"
    : "historical";

  return {
    status: "resolved",
    source,
    policy,
  };
}

function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function buildMonthBreakdown(
  period: HistoricalDataset["period"],
  workdayEntries: readonly HistoricalWorkdayEntry[],
): readonly HistoricalPeriodBreakdown[] {
  const breakdown: HistoricalPeriodBreakdown[] = [];
  let cursor = new Date(period.startDate);

  while (cursor <= period.endDate) {
    const monthRange = getCalendarMonthRange(cursor);
    const periodWorkdays = workdayEntries.filter((entry) => {
      const workdayStart = new Date(entry.workday.startTime);
      return (
        workdayStart.getTime() >= monthRange.startDate.getTime() &&
        workdayStart.getTime() <= monthRange.endDate.getTime()
      );
    });
    const trips = periodWorkdays.flatMap((entry) => entry.trips);

    breakdown.push({
      periodType: "month",
      startDate: monthRange.startDate,
      endDate: monthRange.endDate,
      selection: {
        periodType: "month",
        anchorDate: monthRange.startDate,
      },
      workdayCount: periodWorkdays.length,
      recordCount: trips.length,
      summary: calculateSummary(trips, true),
      goalContext: resolvePeriodGoalContext(periodWorkdays.map((entry) => entry.goalResolution)),
    });

    cursor = new Date(monthRange.startDate.getFullYear(), monthRange.startDate.getMonth() + 1, 1, 12, 0, 0, 0);
  }

  return breakdown;
}

function buildPeriodBreakdown(
  period: HistoricalDataset["period"],
  workdayEntries: readonly HistoricalWorkdayEntry[],
  weekStartDay: WeekStartDay,
): readonly HistoricalPeriodBreakdown[] {
  if (period.periodType === "year") {
    return buildMonthBreakdown(period, workdayEntries);
  }

  if (period.periodType !== "month") {
    return [];
  }

  const breakdown: HistoricalPeriodBreakdown[] = [];
  let cursor = new Date(period.startDate);

  while (cursor <= period.endDate) {
    const weekRange = getOperationalWeekRange(cursor, weekStartDay);
    const periodWorkdays = workdayEntries.filter((entry) => {
      const workdayStart = new Date(entry.workday.startTime);
      return (
        workdayStart.getTime() >= weekRange.startDate.getTime() &&
        workdayStart.getTime() <= weekRange.endDate.getTime()
      );
    });
    const trips = periodWorkdays.flatMap((entry) => entry.trips);

    breakdown.push({
      periodType: "week",
      startDate: weekRange.startDate,
      endDate: weekRange.endDate,
      selection: {
        periodType: "week",
        anchorDate: weekRange.startDate,
      },
      workdayCount: periodWorkdays.length,
      recordCount: trips.length,
      summary: calculateSummary(trips, true),
      goalContext: resolvePeriodGoalContext(periodWorkdays.map((entry) => entry.goalResolution)),
    });

    cursor = addCalendarDays(weekRange.endDate, 1);
  }

  return breakdown;
}

async function resolveWorkdayGoalContext(
  workday: HistoricalWorkdayRecord,
  currentPolicyLoader: () => Promise<GoalPolicy | null>,
  policyCache: Map<string, Promise<GoalPolicy | null>>,
): Promise<WorkdayGoalResolution> {
  if (!workday.isClosed) {
    const policy = await currentPolicyLoader();
    if (!policy) {
      return {
        status: "unknown",
        reason: "missing_policy",
      };
    }

    return {
      status: "resolved",
      source: "current",
      policy,
    };
  }

  if (!workday.goalPolicyId) {
    return {
      status: "unknown",
      reason: "no_evidence",
    };
  }

  if (!policyCache.has(workday.goalPolicyId)) {
    policyCache.set(workday.goalPolicyId, GoalService.getGoalPolicyById(workday.goalPolicyId));
  }

  const policy = await policyCache.get(workday.goalPolicyId)!;
  if (!policy) {
    return {
      status: "unknown",
      reason: "missing_policy",
    };
  }

  return {
    status: "resolved",
    source: "historical",
    policy,
  };
}

export class HistoricalQueryService {
  static async getHistoricalDataset(
    selection: HistoricalPeriodSelection,
  ): Promise<HistoricalDataset> {
    const weekStartDay = await WeekConfigurationService.getWeekStartDay();
    const period = resolveHistoricalPeriodRange(selection, weekStartDay, new Date());

    const persistence = getApplicationPersistence();
    const workdayRows = await persistence.workdayRepository.findWorkdaysBetweenDates(
      period.startDate,
      period.endDate,
    );
    const workdays = sortByStartTime(workdayRows.map(mapWorkday));
    let currentPolicyPromise: Promise<GoalPolicy | null> | null = null;
    const currentPolicyLoader = () => {
      if (!currentPolicyPromise) {
        currentPolicyPromise = GoalService.getCurrentGoalPolicy();
      }

      return currentPolicyPromise;
    };
    const policyCache = new Map<string, Promise<GoalPolicy | null>>();

    const workdayEntries = await Promise.all(
      workdays.map(async (workday): Promise<HistoricalWorkdayEntry> => {
        const trips = sortByStartTime(await persistence.tripRepository.findTripsForWorkday(workday.id));
        const goalResolution = await resolveWorkdayGoalContext(
          workday,
          currentPolicyLoader,
          policyCache,
        );

        return {
          workday,
          trips,
          goalResolution,
          recordCount: trips.length,
          summary: calculateSummary(trips, true),
        };
      }),
    );

    const breakdown: HistoricalWorkdayBreakdown[] = workdayEntries.map(
      ({ goalResolution, trips, ...entry }) => ({
        ...entry,
        goalContext:
          goalResolution.status === "resolved"
            ? {
                status: "resolved",
                source: goalResolution.source,
                policy: goalResolution.policy,
              }
            : goalResolution.status === "mixed"
              ? {
                  status: "mixed",
                  reason: goalResolution.reason,
                  policies: [],
                }
              : {
                  status: "unknown",
                  reason: goalResolution.reason,
                },
      }),
    );

    const records: HistoricalTripRecord[] = workdayEntries.flatMap(({ workday, trips }) =>
      trips.map((trip) => ({
        workdayId: workday.id,
        trip,
      })),
    );

    const summary = calculateSummary(records.map((record) => record.trip), true);
    const goalContext = resolvePeriodGoalContext(
      breakdown.map((entry) => entry.goalContext as WorkdayGoalResolution),
    );
    const periodBreakdown = buildPeriodBreakdown(period, workdayEntries, weekStartDay);

    return {
      period: {
        ...period,
        isEmpty: workdays.length === 0,
      },
      summary,
      periodBreakdown,
      breakdown,
      workdays,
      records,
      goalContext,
    };
  }

  static async getWeekHistoricalDataset(anchorDate: Date = new Date()): Promise<HistoricalDataset> {
    return this.getHistoricalDataset({
      periodType: "week",
      anchorDate,
    });
  }

  static async getMonthHistoricalDataset(anchorDate: Date = new Date()): Promise<HistoricalDataset> {
    return this.getHistoricalDataset({
      periodType: "month",
      anchorDate,
    });
  }
}
