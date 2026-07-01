import { PaymentType, TripSource } from "../../../constants/enums";
import { buildTodayScreenProjection } from "../TodayScreenProjection";

describe("buildTodayScreenProjection", () => {
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
        startTime: "2026-07-01T08:00:00.000Z",
        endTime: null,
        isClosed: false,
      },
      activeWorkday: { id: 9, startTime: "2026-07-01T08:00:00.000Z" },
      dailySummary: null,
    });

    expect(projection.isToday).toBe(true);
    expect(projection.totalToday).toBe(12);
    expect(projection.remainingDaily).toBe(3);
    expect(projection.remainingWeekly).toBe(20);
    expect(projection.dailyStatus?.label).toBe("Vas bien");
    expect(projection.resolvedWorkdayInfo.isVirtual).toBe(false);
    expect(projection.totalsBySource.taxi).toBe(12);
    expect(projection.totalsByPayment.efectivo).toBe(12);
  });
});
