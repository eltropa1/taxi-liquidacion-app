import { getOperationalWeekRange } from "../operationalWeek";

function expectLocalDate(date: Date, year: number, month: number, day: number) {
  expect(date.getFullYear()).toBe(year);
  expect(date.getMonth()).toBe(month);
  expect(date.getDate()).toBe(day);
}

describe("getOperationalWeekRange", () => {
  it("calculates a Monday-to-Sunday operational week", () => {
    const range = getOperationalWeekRange(
      new Date(2026, 0, 1, 12, 0, 0, 0),
      "monday",
    );

    expectLocalDate(range.startDate, 2025, 11, 29);
    expectLocalDate(range.endDate, 2026, 0, 4);
  });

  it("calculates a Wednesday-to-Tuesday operational week", () => {
    const range = getOperationalWeekRange(
      new Date(2026, 0, 1, 12, 0, 0, 0),
      "wednesday",
    );

    expectLocalDate(range.startDate, 2025, 11, 31);
    expectLocalDate(range.endDate, 2026, 0, 6);
  });

  it("calculates a Saturday-to-Friday operational week", () => {
    const range = getOperationalWeekRange(
      new Date(2026, 0, 5, 12, 0, 0, 0),
      "saturday",
    );

    expectLocalDate(range.startDate, 2026, 0, 3);
    expectLocalDate(range.endDate, 2026, 0, 9);
  });

  it("handles month boundaries", () => {
    const range = getOperationalWeekRange(
      new Date(2026, 7, 1, 12, 0, 0, 0),
      "monday",
    );

    expectLocalDate(range.startDate, 2026, 6, 27);
    expectLocalDate(range.endDate, 2026, 7, 2);
  });

  it("handles year boundaries", () => {
    const range = getOperationalWeekRange(
      new Date(2026, 0, 1, 12, 0, 0, 0),
      "monday",
    );

    expectLocalDate(range.startDate, 2025, 11, 29);
    expectLocalDate(range.endDate, 2026, 0, 4);
  });
});

