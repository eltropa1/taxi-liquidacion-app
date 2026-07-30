import type { GoalPolicy } from "../ports/runtime";
import type { SummaryMetrics } from "../runtime/summaryMetrics";
import type { TripListRecord } from "../ports/persistence";
import type { WeekStartDay } from "../../domain/date-time";

export type HistoricalPeriodType = "week" | "month" | "custom" | "fortnight" | "year";

export type HistoricalPeriodSelection =
  | Readonly<{
      periodType: Exclude<HistoricalPeriodType, "custom">;
      anchorDate: Date;
    }>
  | Readonly<{
      periodType: "custom";
      startDate: Date;
      endDate: Date;
    }>;

export type HistoricalPeriodResolver = Readonly<{
  periodType: HistoricalPeriodType;
  resolveRange: (
    selection: HistoricalPeriodSelection,
    weekStartDay: WeekStartDay,
    now: Date,
  ) => HistoricalPeriodRange;
}>;

export type HistoricalPeriodRange = Readonly<{
  periodType: HistoricalPeriodType;
  startDate: Date;
  endDate: Date;
  label: string;
  isCurrent: boolean;
  isEmpty: boolean;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  previousSelection: HistoricalPeriodSelection | null;
  nextSelection: HistoricalPeriodSelection | null;
}>;

export type HistoricalPeriodBreakdown = Readonly<{
  periodType: HistoricalPeriodType;
  startDate: Date;
  endDate: Date;
  selection: HistoricalPeriodSelection;
  workdayCount: number;
  recordCount: number;
  summary: SummaryMetrics;
  goalContext: HistoricalGoalContext;
}>;

export type HistoricalGoalContext =
  | Readonly<{
      status: "resolved";
      source: "current" | "historical";
      policy: GoalPolicy;
    }>
  | Readonly<{
      status: "mixed";
      reason: "multiple_policies" | "missing_evidence";
      policies: readonly GoalPolicy[];
    }>
  | Readonly<{
      status: "unknown";
      reason: "no_evidence" | "missing_policy";
    }>;

export type HistoricalWorkdayRecord = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  isClosed: boolean;
  goalPolicyId: string | null;
  startOdometer: number | null;
  endOdometer: number | null;
}>;

export type HistoricalTripRecord = Readonly<{
  workdayId: number;
  trip: TripListRecord;
}>;

export type HistoricalWorkdayBreakdown = Readonly<{
  workday: HistoricalWorkdayRecord;
  recordCount: number;
  summary: SummaryMetrics;
  goalContext: HistoricalGoalContext;
}>;

export type HistoricalDataset = Readonly<{
  period: HistoricalPeriodRange;
  summary: SummaryMetrics;
  periodBreakdown?: readonly HistoricalPeriodBreakdown[];
  breakdown: readonly HistoricalWorkdayBreakdown[];
  workdays: readonly HistoricalWorkdayRecord[];
  records: readonly HistoricalTripRecord[];
  goalContext: HistoricalGoalContext;
}>;
