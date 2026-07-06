import { PaymentType, TripSource } from "../../../constants/enums";
import { buildTodayScreenProjection } from "../TodayScreenProjection";

describe("buildTodayScreenProjection", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-07-01T12:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("derives the visual state without changing business data", () => {
    const projection = buildTodayScreenProjection({
      selectedDate: new Date("2026-07-01T00:00:00.000Z"),
      activeTripId: 3,
      trips: [
        {
          id: 1,
          startTime: "2026-07-01T08:00:00.000Z",
          endTime: "2026-07-01T08:10:00.000Z",
          amount: 12,
          source: TripSource.TAXI,
          payment: PaymentType.CASH,
        },
      ],
      weeklySummary: { total: 20 },
      monthlySummary: { total: 30 },
      goals: { daily: 15, weekly: 40, monthly: 100 },
      workdayInfo: {
        id: 9,
        startTime: "2026-07-01T08:00:00.000Z",
        endTime: null,
        startOdometer: 1200,
        endOdometer: 1234,
        isClosed: false,
      },
      activeWorkday: {
        id: 9,
        startTime: "2026-07-01T08:00:00.000Z",
        startOdometer: 1200,
      },
      dailySummary: null,
    });

    expect(projection.isToday).toBe(true);
    expect(projection.totalToday).toBe(12);
    expect(projection.remainingDaily).toBe(3);
    expect(projection.remainingWeekly).toBe(20);
    expect(projection.dailyStatus?.label).toBe("Vas bien");
    expect(projection.resolvedWorkdayInfo.isVirtual).toBe(false);
    expect(projection.resolvedWorkdayInfo.workedKilometers).toBe(34);
  });

  it("keeps legacy workdays without odometers safe", () => {
    const projection = buildTodayScreenProjection({
      selectedDate: new Date("2026-06-30T00:00:00.000Z"),
      activeTripId: null,
      trips: [],
      weeklySummary: null,
      monthlySummary: null,
      goals: { daily: 0, weekly: 0, monthly: 0 },
      workdayInfo: {
        id: 22,
        startTime: "2026-06-30T08:00:00.000Z",
        endTime: null,
        startOdometer: null,
        endOdometer: null,
        isClosed: true,
      },
      activeWorkday: null,
      dailySummary: null,
    });

    expect(projection.resolvedWorkdayInfo.workedKilometers).toBeNull();
  });
});
