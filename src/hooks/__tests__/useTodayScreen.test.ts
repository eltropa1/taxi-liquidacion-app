import {
  SummaryService,
  TripQueryService,
  WorkdayService,
} from "../../application/runtime";
import { loadTodayScreenData } from "../useTodayScreen";

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
    getSummaryForWorkday: jest.fn().mockResolvedValue(null),
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

describe("loadTodayScreenData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests the weekly summary for the selected date, not the current clock date", async () => {
    const selectedDate = new Date(2026, 0, 1, 12, 0, 0, 0);

    await loadTodayScreenData(selectedDate);

    expect(SummaryService.getWeekSummary).toHaveBeenCalledWith(selectedDate);
  });

  it("uses the open jornada as the workday id when today does not yet have workdayInfo", async () => {
    const selectedDate = new Date(2026, 6, 20, 2, 16, 0, 0);
    const activeWorkday = {
      id: 77,
      startTime: "2026-07-20T02:16:00.000Z",
      startOdometer: 4000,
    };

    (WorkdayService.getOpenWorkday as jest.Mock).mockResolvedValueOnce(activeWorkday);
    (WorkdayService.getWorkdayInfoForDate as jest.Mock).mockResolvedValueOnce(null);

    await loadTodayScreenData(selectedDate);

    expect(SummaryService.getSummaryForWorkday).toHaveBeenCalledWith(77);
    expect(TripQueryService.getTripsForWorkday).toHaveBeenCalledWith(77);
  });
});
