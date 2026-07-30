import {
  compareCalendarMonths,
  getCalendarMonthRange,
  getNextCalendarMonthRange,
  getNextOperationalWeekRange,
  getOperationalWeekRange,
  getPreviousCalendarMonthRange,
  getPreviousOperationalWeekRange,
  compareCalendarYears,
  getCalendarYearRange,
  getNextCalendarYearRange,
  getPreviousCalendarYearRange,
  isSameCalendarYear,
  type WeekStartDay,
} from "../../domain/date-time";
import type {
  HistoricalPeriodRange,
  HistoricalPeriodResolver,
  HistoricalPeriodSelection,
  HistoricalPeriodType,
} from "./historicalQueryTypes";

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMonthLabel(date: Date) {
  return capitalize(
    date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    }),
  );
}

function formatYearLabel(date: Date) {
  return date.getFullYear().toString();
}

function formatShortDateLabel(value: Date, includeYear = false) {
  return value.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: includeYear ? "numeric" : undefined,
  });
}

function formatFortnightLabel(startDate: Date, endDate: Date) {
  return `${formatShortDateLabel(startDate)} - ${formatShortDateLabel(endDate, true)}`;
}

function formatCustomRangeLabel(startDate: Date, endDate: Date) {
  const includeYear = startDate.getFullYear() !== endDate.getFullYear();
  return `${formatShortDateLabel(startDate, includeYear)} - ${formatShortDateLabel(
    endDate,
    true,
  )}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function getFortnightStartDay(date: Date) {
  return date.getDate() <= 15 ? 1 : 16;
}

function getCalendarFortnightRange(anchorDate: Date) {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const startDay = getFortnightStartDay(anchorDate);
  const endDay = startDay === 1 ? 15 : new Date(year, month + 1, 0).getDate();

  return {
    startDate: new Date(year, month, startDay, 0, 0, 0, 0),
    endDate: new Date(year, month, endDay, 23, 59, 59, 999),
  };
}

function getPreviousCalendarFortnightRange(currentRange: ReturnType<typeof getCalendarFortnightRange>) {
  if (currentRange.startDate.getDate() === 1) {
    const previousMonthLastDay = new Date(
      currentRange.startDate.getFullYear(),
      currentRange.startDate.getMonth(),
      0,
    ).getDate();
    return {
      startDate: new Date(
        currentRange.startDate.getFullYear(),
        currentRange.startDate.getMonth() - 1,
        16,
        0,
        0,
        0,
        0,
      ),
      endDate: new Date(
        currentRange.startDate.getFullYear(),
        currentRange.startDate.getMonth() - 1,
        previousMonthLastDay,
        23,
        59,
        59,
        999,
      ),
    };
  }

  return {
    startDate: new Date(
      currentRange.startDate.getFullYear(),
      currentRange.startDate.getMonth(),
      1,
      0,
      0,
      0,
      0,
    ),
    endDate: new Date(
      currentRange.startDate.getFullYear(),
      currentRange.startDate.getMonth(),
      15,
      23,
      59,
      59,
      999,
    ),
  };
}

function getNextCalendarFortnightRange(currentRange: ReturnType<typeof getCalendarFortnightRange>) {
  if (currentRange.startDate.getDate() === 1) {
    return {
      startDate: new Date(
        currentRange.startDate.getFullYear(),
        currentRange.startDate.getMonth(),
        16,
        0,
        0,
        0,
        0,
      ),
      endDate: new Date(
        currentRange.startDate.getFullYear(),
        currentRange.startDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    };
  }

  return {
    startDate: new Date(
      currentRange.startDate.getFullYear(),
      currentRange.startDate.getMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    ),
    endDate: new Date(
      currentRange.startDate.getFullYear(),
      currentRange.startDate.getMonth() + 1,
      15,
      23,
      59,
      59,
      999,
    ),
  };
}

function compareCalendarFortnights(left: Date, right: Date): number {
  const yearDifference = left.getFullYear() - right.getFullYear();
  if (yearDifference !== 0) {
    return yearDifference;
  }

  const monthDifference = left.getMonth() - right.getMonth();
  if (monthDifference !== 0) {
    return monthDifference;
  }

  return getFortnightStartDay(left) - getFortnightStartDay(right);
}

function normalizeCustomRange(selection: Extract<HistoricalPeriodSelection, { periodType: "custom" }>, now: Date) {
  const startDate = startOfDay(selection.startDate);
  const endLimit = endOfDay(now);
  const endDate = endOfDay(selection.endDate).getTime() > endLimit.getTime() ? endLimit : endOfDay(selection.endDate);

  if (startDate.getTime() > endDate.getTime()) {
    throw new Error("Invalid custom historical range: startDate must be before or equal to endDate");
  }

  return {
    startDate,
    endDate,
  };
}

const weekPeriodResolver: HistoricalPeriodResolver = {
  periodType: "week",
  resolveRange(selection, weekStartDay, now) {
    const anchorDate = selection.periodType === "custom" ? selection.startDate : selection.anchorDate;
    const range = getOperationalWeekRange(anchorDate, weekStartDay);
    const currentRange = getOperationalWeekRange(now, weekStartDay);
    const isCurrent =
      range.startDate.getTime() === currentRange.startDate.getTime() &&
      range.endDate.getTime() === currentRange.endDate.getTime();
    const previousRange = getPreviousOperationalWeekRange(range, weekStartDay);
    const nextRange = getNextOperationalWeekRange(range, weekStartDay);

    return {
      periodType: "week",
      startDate: range.startDate,
      endDate: range.endDate,
      label: `${isCurrent ? "Semana actual" : "Semana histórica"} · ${formatShortDateLabel(range.startDate)} - ${formatShortDateLabel(range.endDate)}`,
      isCurrent,
      isEmpty: false,
      canNavigatePrevious: true,
      canNavigateNext: !isCurrent,
      previousSelection: {
        periodType: "week",
        anchorDate: previousRange.startDate,
      },
      nextSelection: isCurrent
        ? null
        : {
            periodType: "week",
            anchorDate: nextRange.startDate,
          },
    };
  },
};

const monthPeriodResolver: HistoricalPeriodResolver = {
  periodType: "month",
  resolveRange(selection, _weekStartDay, now) {
    const anchorDate = selection.periodType === "custom" ? selection.startDate : selection.anchorDate;
    const range = getCalendarMonthRange(anchorDate);
    const currentRange = getCalendarMonthRange(now);
    const isCurrent = range.startDate.getTime() === currentRange.startDate.getTime();
    const previousRange = getPreviousCalendarMonthRange(range);
    const nextRange = getNextCalendarMonthRange(range);
    const canNavigateNext = compareCalendarMonths(range.startDate, currentRange.startDate) < 0;

    return {
      periodType: "month",
      startDate: range.startDate,
      endDate: range.endDate,
      label: `${isCurrent ? "Mes actual" : "Mes histórico"} · ${formatMonthLabel(range.startDate)}`,
      isCurrent,
      isEmpty: false,
      canNavigatePrevious: true,
      canNavigateNext,
      previousSelection: {
        periodType: "month",
        anchorDate: previousRange.startDate,
      },
      nextSelection: canNavigateNext
        ? {
            periodType: "month",
            anchorDate: nextRange.startDate,
          }
        : null,
    };
  },
};

const fortnightPeriodResolver: HistoricalPeriodResolver = {
  periodType: "fortnight",
  resolveRange(selection, _weekStartDay, now) {
    const anchorDate = selection.periodType === "custom" ? selection.startDate : selection.anchorDate;
    const range = getCalendarFortnightRange(anchorDate);
    const currentRange = getCalendarFortnightRange(now);
    const isCurrent =
      range.startDate.getTime() === currentRange.startDate.getTime() &&
      range.endDate.getTime() === currentRange.endDate.getTime();
    const previousRange = getPreviousCalendarFortnightRange(range);
    const nextRange = getNextCalendarFortnightRange(range);
    const canNavigateNext = compareCalendarFortnights(range.startDate, currentRange.startDate) < 0;

    return {
      periodType: "fortnight",
      startDate: range.startDate,
      endDate: range.endDate,
      label: `${isCurrent ? "Quincena actual" : "Quincena histórica"} · ${formatFortnightLabel(
        range.startDate,
        range.endDate,
      )}`,
      isCurrent,
      isEmpty: false,
      canNavigatePrevious: true,
      canNavigateNext,
      previousSelection: {
        periodType: "fortnight",
        anchorDate: previousRange.startDate,
      },
      nextSelection: canNavigateNext
        ? {
            periodType: "fortnight",
            anchorDate: nextRange.startDate,
          }
        : null,
    };
  },
};

const yearPeriodResolver: HistoricalPeriodResolver = {
  periodType: "year",
  resolveRange(selection, _weekStartDay, now) {
    const anchorDate = selection.periodType === "custom" ? selection.startDate : selection.anchorDate;
    const range = getCalendarYearRange(anchorDate);
    const currentRange = getCalendarYearRange(now);
    const isCurrent = isSameCalendarYear(range.startDate, currentRange.startDate);
    const previousRange = getPreviousCalendarYearRange(range);
    const nextRange = getNextCalendarYearRange(range);
    const canNavigateNext = compareCalendarYears(range.startDate, currentRange.startDate) < 0;

    return {
      periodType: "year",
      startDate: range.startDate,
      endDate: range.endDate,
      label: `${isCurrent ? "Año actual" : "Año histórico"} · ${formatYearLabel(range.startDate)}`,
      isCurrent,
      isEmpty: false,
      canNavigatePrevious: true,
      canNavigateNext,
      previousSelection: {
        periodType: "year",
        anchorDate: previousRange.startDate,
      },
      nextSelection: canNavigateNext
        ? {
            periodType: "year",
            anchorDate: nextRange.startDate,
          }
        : null,
    };
  },
};

const customPeriodResolver: HistoricalPeriodResolver = {
  periodType: "custom",
  resolveRange(selection, _weekStartDay, now) {
    if (selection.periodType !== "custom") {
      throw new Error("Invalid custom historical selection");
    }

    const { startDate, endDate } = normalizeCustomRange(selection, now);

    return {
      periodType: "custom",
      startDate,
      endDate,
      label: `Rango personalizado · ${formatCustomRangeLabel(startDate, endDate)}`,
      isCurrent: false,
      isEmpty: false,
      canNavigatePrevious: false,
      canNavigateNext: false,
      previousSelection: null,
      nextSelection: null,
    };
  },
};

const PERIOD_RESOLVERS: Partial<Record<HistoricalPeriodType, HistoricalPeriodResolver>> = {
  week: weekPeriodResolver,
  fortnight: fortnightPeriodResolver,
  month: monthPeriodResolver,
  year: yearPeriodResolver,
  custom: customPeriodResolver,
};

export function resolveHistoricalPeriodRange(
  selection: HistoricalPeriodSelection,
  weekStartDay: WeekStartDay,
  now: Date,
): HistoricalPeriodRange {
  const resolver = PERIOD_RESOLVERS[selection.periodType];

  if (!resolver) {
    throw new Error(`Historical period type not supported yet: ${selection.periodType}`);
  }

  return resolver.resolveRange(selection, weekStartDay, now);
}
