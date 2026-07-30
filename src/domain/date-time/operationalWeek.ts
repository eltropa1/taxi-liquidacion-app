export type WeekStartDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type OperationalWeekRange = Readonly<{
  startDate: Date;
  endDate: Date;
}>;

export const WEEK_START_DAY_ORDER: readonly WeekStartDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const WEEK_START_DAY_TO_DAY_INDEX: Record<WeekStartDay, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

export function isWeekStartDay(value: string): value is WeekStartDay {
  return WEEK_START_DAY_ORDER.includes(value as WeekStartDay);
}

function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getStartOfMonth(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
}

function getEndOfMonth(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
}

function getWeekStartOnOrBefore(date: Date, weekStartDay: WeekStartDay): Date {
  const dayIndex = date.getDay();
  const weekStartIndex = WEEK_START_DAY_TO_DAY_INDEX[weekStartDay];
  const offsetToStart = (dayIndex - weekStartIndex + 7) % 7;
  return startOfDay(addCalendarDays(date, -offsetToStart));
}

function getWeekStartOnOrAfter(date: Date, weekStartDay: WeekStartDay): Date {
  const dayIndex = date.getDay();
  const weekStartIndex = WEEK_START_DAY_TO_DAY_INDEX[weekStartDay];
  const offsetToStart = (weekStartIndex - dayIndex + 7) % 7;
  return startOfDay(addCalendarDays(date, offsetToStart));
}

/**
 * Calcula el rango operativo semanal a partir de una fecha ancla y del día
 * de inicio configurado por el usuario.
 */
export function getOperationalWeekRange(
  anchorDate: Date,
  weekStartDay: WeekStartDay,
): OperationalWeekRange {
  const monthStart = getStartOfMonth(anchorDate);
  const monthEnd = getEndOfMonth(anchorDate);
  const firstWeekStart = getWeekStartOnOrAfter(monthStart, weekStartDay);

  if (anchorDate < firstWeekStart) {
    return {
      startDate: monthStart,
      endDate: endOfDay(addCalendarDays(firstWeekStart, -1)),
    };
  }

  const startDate = getWeekStartOnOrBefore(anchorDate, weekStartDay);
  const nextWeekStart = getWeekStartOnOrAfter(
    addCalendarDays(startDate, 1),
    weekStartDay,
  );
  const candidateEndDate = endOfDay(addCalendarDays(nextWeekStart, -1));
  const endDate =
    candidateEndDate.getTime() > monthEnd.getTime() ? monthEnd : candidateEndDate;

  return {
    startDate,
    endDate,
  };
}

export function getPreviousOperationalWeekRange(
  currentRange: OperationalWeekRange,
  weekStartDay: WeekStartDay,
): OperationalWeekRange {
  return getOperationalWeekRange(addCalendarDays(currentRange.startDate, -1), weekStartDay);
}

export function getNextOperationalWeekRange(
  currentRange: OperationalWeekRange,
  weekStartDay: WeekStartDay,
): OperationalWeekRange {
  return getOperationalWeekRange(addCalendarDays(currentRange.endDate, 1), weekStartDay);
}
