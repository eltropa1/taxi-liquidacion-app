import { addCalendarDays } from "../dateUtils";

describe("addCalendarDays", () => {
  it("moves a date by a calendar day without changing the local clock time", () => {
    const start = new Date(2026, 2, 28, 12, 30, 0, 0);
    const next = addCalendarDays(start, 1);
    const previous = addCalendarDays(start, -1);

    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(2);
    expect(next.getDate()).toBe(29);
    expect(next.getHours()).toBe(12);
    expect(next.getMinutes()).toBe(30);

    expect(previous.getFullYear()).toBe(2026);
    expect(previous.getMonth()).toBe(2);
    expect(previous.getDate()).toBe(27);
    expect(previous.getHours()).toBe(12);
    expect(previous.getMinutes()).toBe(30);
  });
});
