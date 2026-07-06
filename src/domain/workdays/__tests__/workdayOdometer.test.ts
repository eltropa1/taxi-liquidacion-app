import {
  calculateWorkdayKilometers,
  parsePositiveIntegerInput,
  validateWorkdayOdometers,
} from "../workdayOdometer";

describe("workdayOdometer", () => {
  it("parses only positive integer inputs", () => {
    expect(parsePositiveIntegerInput("123")).toBe(123);
    expect(parsePositiveIntegerInput("  45 ")).toBe(45);
    expect(parsePositiveIntegerInput("0")).toBeNull();
    expect(parsePositiveIntegerInput("12.5")).toBeNull();
    expect(parsePositiveIntegerInput("-7")).toBeNull();
  });

  it("validates the start and end odometer rules", () => {
    expect(validateWorkdayOdometers(null, null)).toEqual({
      ok: false,
      error: "START_ODOMETER_REQUIRED",
    });

    expect(validateWorkdayOdometers(10, null)).toEqual({ ok: true });
    expect(validateWorkdayOdometers(10, 12)).toEqual({ ok: true });
    expect(validateWorkdayOdometers(10, 9)).toEqual({
      ok: false,
      error: "END_ODOMETER_BEFORE_START",
    });
  });

  it("calculates workday kilometers only when both odometers exist", () => {
    expect(calculateWorkdayKilometers(null, null)).toBeNull();
    expect(calculateWorkdayKilometers(1200, null)).toBeNull();
    expect(calculateWorkdayKilometers(1200, 1234)).toBe(34);
  });
});
