export type CalendarYearRange = Readonly<{
  startDate: Date;
  endDate: Date;
}>;

export function getCalendarYearRange(anchorDate: Date): CalendarYearRange {
  return {
    startDate: new Date(anchorDate.getFullYear(), 0, 1, 0, 0, 0, 0),
    endDate: new Date(anchorDate.getFullYear(), 11, 31, 23, 59, 59, 999),
  };
}

export function compareCalendarYears(left: Date, right: Date): number {
  return left.getFullYear() - right.getFullYear();
}

export function isSameCalendarYear(left: Date, right: Date): boolean {
  return compareCalendarYears(left, right) === 0;
}

export function getPreviousCalendarYearRange(currentRange: CalendarYearRange): CalendarYearRange {
  return getCalendarYearRange(new Date(currentRange.startDate.getFullYear() - 1, 0, 1, 12, 0, 0, 0));
}

export function getNextCalendarYearRange(currentRange: CalendarYearRange): CalendarYearRange {
  return getCalendarYearRange(new Date(currentRange.startDate.getFullYear() + 1, 0, 1, 12, 0, 0, 0));
}
