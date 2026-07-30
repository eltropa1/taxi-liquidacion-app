export type CalendarMonthRange = Readonly<{
  startDate: Date;
  endDate: Date;
}>;

export function getCalendarMonthRange(anchorDate: Date): CalendarMonthRange {
  return {
    startDate: new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1, 0, 0, 0, 0),
    endDate: new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

export function compareCalendarMonths(left: Date, right: Date): number {
  const yearDifference = left.getFullYear() - right.getFullYear();
  if (yearDifference !== 0) {
    return yearDifference;
  }

  return left.getMonth() - right.getMonth();
}

export function isSameCalendarMonth(left: Date, right: Date): boolean {
  return compareCalendarMonths(left, right) === 0;
}

export function getPreviousCalendarMonthRange(currentRange: CalendarMonthRange): CalendarMonthRange {
  return getCalendarMonthRange(
    new Date(currentRange.startDate.getFullYear(), currentRange.startDate.getMonth() - 1, 1, 12, 0, 0, 0),
  );
}

export function getNextCalendarMonthRange(currentRange: CalendarMonthRange): CalendarMonthRange {
  return getCalendarMonthRange(
    new Date(currentRange.startDate.getFullYear(), currentRange.startDate.getMonth() + 1, 1, 12, 0, 0, 0),
  );
}
