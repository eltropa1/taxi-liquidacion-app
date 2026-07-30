import {
  getNextOperationalWeekRange,
  getOperationalWeekRange,
  getPreviousOperationalWeekRange,
} from "../operationalWeek";

function expectLocalDate(date: Date, year: number, month: number, day: number) {
  expect(date.getFullYear()).toBe(year);
  expect(date.getMonth()).toBe(month);
  expect(date.getDate()).toBe(day);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addCalendarDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function expectRangeEqual(left: { startDate: Date; endDate: Date }, right: { startDate: Date; endDate: Date }) {
  expect(left.startDate.getTime()).toBe(right.startDate.getTime());
  expect(left.endDate.getTime()).toBe(right.endDate.getTime());
}

describe("operational week range", () => {
  it("keeps a normal operational week fully contained in the same month", () => {
    const range = getOperationalWeekRange(
      new Date(2026, 6, 8, 12, 0, 0, 0),
      "monday",
    );

    expectLocalDate(range.startDate, 2026, 6, 6);
    expectLocalDate(range.endDate, 2026, 6, 12);
  });

  it("starts a short operational week at the beginning of a month when the month boundary cuts the block", () => {
    const range = getOperationalWeekRange(
      new Date(2026, 7, 1, 12, 0, 0, 0),
      "monday",
    );

    expectLocalDate(range.startDate, 2026, 7, 1);
    expectLocalDate(range.endDate, 2026, 7, 2);
  });

  it.each(["monday", "thursday"] as const)(
    "covers July 2026 exactly once per day with %s as the week start",
    (weekStartDay) => {
      const monthStart = new Date(2026, 6, 1, 12, 0, 0, 0);
      const monthEnd = new Date(2026, 6, 31, 12, 0, 0, 0);
      const periods: { startDate: Date; endDate: Date }[] = [];
      const coveredDays = new Map<string, number>();
      let cursor = new Date(monthStart);

      while (cursor <= monthEnd) {
        const range = getOperationalWeekRange(cursor, weekStartDay);
        periods.push(range);

        for (
          let day = new Date(range.startDate);
          day <= range.endDate;
          day = addCalendarDays(day, 1)
        ) {
          const key = toDateKey(day);
          coveredDays.set(key, (coveredDays.get(key) ?? 0) + 1);
        }

        cursor = addCalendarDays(range.endDate, 1);
      }

      expect(periods).toHaveLength(weekStartDay === "monday" ? 5 : 6);
      expect(periods[0]?.startDate).toEqual(new Date(2026, 6, 1, 0, 0, 0, 0));
      expect(periods[periods.length - 1]?.endDate).toEqual(
        new Date(2026, 6, 31, 23, 59, 59, 999),
      );

      for (const period of periods) {
        expect(period.startDate.getMonth()).toBe(6);
        expect(period.endDate.getMonth()).toBe(6);
      }

      for (let day = new Date(2026, 6, 1, 12, 0, 0, 0); day.getMonth() === 6; day = addCalendarDays(day, 1)) {
        expect(coveredDays.get(toDateKey(day))).toBe(1);
      }
    },
  );

  it("shortens the final operational week when the month ends before the configured seven-day block completes", () => {
    const range = getOperationalWeekRange(
      new Date(2026, 6, 31, 12, 0, 0, 0),
      "tuesday",
    );

    expectLocalDate(range.startDate, 2026, 6, 28);
    expectLocalDate(range.endDate, 2026, 6, 31);
  });

  it.each([
    {
      label: "28-day month",
      anchor: new Date(2026, 1, 28, 12, 0, 0, 0),
      weekStartDay: "wednesday" as const,
      start: [2026, 1, 25],
      end: [2026, 1, 28],
    },
    {
      label: "29-day month",
      anchor: new Date(2024, 1, 29, 12, 0, 0, 0),
      weekStartDay: "monday" as const,
      start: [2024, 1, 26],
      end: [2024, 1, 29],
    },
    {
      label: "30-day month",
      anchor: new Date(2026, 3, 30, 12, 0, 0, 0),
      weekStartDay: "tuesday" as const,
      start: [2026, 3, 28],
      end: [2026, 3, 30],
    },
    {
      label: "31-day month",
      anchor: new Date(2026, 6, 31, 12, 0, 0, 0),
      weekStartDay: "monday" as const,
      start: [2026, 6, 27],
      end: [2026, 6, 31],
    },
  ])(
    "keeps the month boundary hard for the $label",
    ({ anchor, weekStartDay, start, end }) => {
      const range = getOperationalWeekRange(anchor, weekStartDay);

      expectLocalDate(range.startDate, start[0], start[1], start[2]);
      expectLocalDate(range.endDate, end[0], end[1], end[2]);
    },
  );

  it("keeps the January boundary hard so a new year never becomes a single official week with December", () => {
    const range = getOperationalWeekRange(
      new Date(2027, 0, 1, 12, 0, 0, 0),
      "wednesday",
    );

    expectLocalDate(range.startDate, 2027, 0, 1);
    expectLocalDate(range.endDate, 2027, 0, 5);
  });

  it.each([
    {
      label: "periodo normal",
      anchor: new Date(2026, 6, 14, 12, 0, 0, 0),
      weekStartDay: "monday" as const,
    },
    {
      label: "periodo corto inicial",
      anchor: new Date(2026, 6, 1, 12, 0, 0, 0),
      weekStartDay: "monday" as const,
    },
    {
      label: "periodo corto final",
      anchor: new Date(2026, 6, 31, 12, 0, 0, 0),
      weekStartDay: "tuesday" as const,
    },
    {
      label: "cambio de mes",
      anchor: new Date(2026, 6, 28, 12, 0, 0, 0),
      weekStartDay: "monday" as const,
    },
    {
      label: "diciembre a enero",
      anchor: new Date(2027, 0, 1, 12, 0, 0, 0),
      weekStartDay: "wednesday" as const,
    },
  ])(
    "preserves bidirectional navigation for $label",
    ({ anchor, weekStartDay }) => {
      const current = getOperationalWeekRange(anchor, weekStartDay);
      const previous = getPreviousOperationalWeekRange(current, weekStartDay);
      const next = getNextOperationalWeekRange(current, weekStartDay);

      expectRangeEqual(
        getNextOperationalWeekRange(previous, weekStartDay),
        current,
      );
      expectRangeEqual(
        getPreviousOperationalWeekRange(next, weekStartDay),
        current,
      );
    },
  );
});
