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

export const WEEK_START_DAY_ORDER: ReadonlyArray<WeekStartDay> = [
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

/**
 * Calcula el rango operativo semanal a partir de una fecha ancla y del día
 * de inicio configurado por el usuario.
 */
export function getOperationalWeekRange(
  anchorDate: Date,
  weekStartDay: WeekStartDay,
): OperationalWeekRange {
  const anchorDayIndex = anchorDate.getDay();
  const weekStartIndex = WEEK_START_DAY_TO_DAY_INDEX[weekStartDay];
  const offsetToStart = (anchorDayIndex - weekStartIndex + 7) % 7;
  const startDate = startOfDay(addCalendarDays(anchorDate, -offsetToStart));
  const endDate = endOfDay(addCalendarDays(startDate, 6));

  return {
    startDate,
    endDate,
  };
}

