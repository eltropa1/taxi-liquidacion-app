import {
  getMsUntilNextLocalMidnight,
  isSameLocalCalendarDay,
  reconcileHomeDateState,
  type HomeDateState,
} from "../useHomeDateTracking";

jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native", () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
}));

describe("useHomeDateTracking helpers", () => {
  it("reanchors a live Home date when the calendar day changes", () => {
    const state: HomeDateState = {
      selectedDate: new Date(2026, 6, 19, 21, 0, 0, 0),
      mode: "live",
    };
    const next = reconcileHomeDateState(
      state,
      new Date(2026, 6, 20, 2, 16, 0, 0),
    );

    expect(next).not.toBe(state);
    expect(next.mode).toBe("live");
    expect(next.selectedDate).toEqual(new Date(2026, 6, 20, 2, 16, 0, 0));
  });

  it("keeps a historical Home date pinned even if the current day changes", () => {
    const state: HomeDateState = {
      selectedDate: new Date(2026, 6, 19, 12, 0, 0, 0),
      mode: "historical",
    };
    const next = reconcileHomeDateState(
      state,
      new Date(2026, 6, 20, 2, 16, 0, 0),
    );

    expect(next).toBe(state);
    expect(next.selectedDate).toEqual(new Date(2026, 6, 19, 12, 0, 0, 0));
  });

  it("detects same-day dates without forcing a refresh", () => {
    expect(
      isSameLocalCalendarDay(
        new Date(2026, 6, 20, 8, 0, 0, 0),
        new Date(2026, 6, 20, 23, 30, 0, 0),
      ),
    ).toBe(true);
  });

  it("computes the delay until the next local midnight", () => {
    const delay = getMsUntilNextLocalMidnight(
      new Date(2026, 6, 19, 23, 59, 0, 0),
    );

    expect(delay).toBe(60_000);
  });
});
