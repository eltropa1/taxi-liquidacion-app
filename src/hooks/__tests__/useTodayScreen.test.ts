jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock("../../application/runtime", () => ({
  GoalService: {
    getGoals: jest.fn().mockResolvedValue({ daily: 0, weekly: 0, monthly: 0 }),
  },
  SummaryService: {
    getWeekSummary: jest.fn().mockResolvedValue(null),
    getMonthSummary: jest.fn().mockResolvedValue(null),
    getSummaryForWorkday: jest.fn(),
  },
  TripQueryService: {
    getActiveTrip: jest.fn().mockResolvedValue(null),
    getTripsForWorkday: jest.fn().mockResolvedValue([]),
  },
  WorkdayService: {
    getOpenWorkday: jest.fn().mockResolvedValue(null),
    getWorkdayInfoForDate: jest.fn().mockResolvedValue(null),
  },
}));

import { loadTodayScreenData } from "../useTodayScreen";
import { SummaryService } from "../../application/runtime";

describe("loadTodayScreenData", () => {
  it("requests the weekly summary for the selected date, not the current clock date", async () => {
    const selectedDate = new Date(2026, 0, 1, 12, 0, 0, 0);

    await loadTodayScreenData(selectedDate);

    expect(SummaryService.getWeekSummary).toHaveBeenCalledWith(selectedDate);
  });
});
