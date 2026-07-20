import { PaymentType } from "../../../constants/enums";
import { buildSummaryScreenProjection } from "../SummaryScreenProjection";

describe("buildSummaryScreenProjection", () => {
  it("builds the open-day summary with dynamic hours and drill-down groups", () => {
    const projection = buildSummaryScreenProjection({
      selectedDate: new Date(2026, 6, 20, 12, 0, 0, 0),
      currentTime: new Date(2026, 6, 20, 12, 0, 0, 0),
      workdayInfo: {
        id: 7,
        startTime: new Date(2026, 6, 20, 8, 0, 0, 0).toISOString(),
        endTime: null,
        startOdometer: 1200,
        endOdometer: null,
        isClosed: false,
      },
      activeWorkday: {
        id: 7,
        startTime: new Date(2026, 6, 20, 8, 0, 0, 0).toISOString(),
        startOdometer: 1200,
      },
      trips: [
        {
          id: 1,
          startTime: new Date(2026, 6, 20, 8, 10, 0, 0).toISOString(),
          endTime: new Date(2026, 6, 20, 8, 20, 0, 0).toISOString(),
          amount: 12,
          source: "taxi",
          payment: PaymentType.CASH,
          serviceStatus: "completed",
        },
        {
          id: 2,
          startTime: new Date(2026, 6, 20, 9, 0, 0, 0).toISOString(),
          endTime: new Date(2026, 6, 20, 9, 15, 0, 0).toISOString(),
          amount: 8,
          source: "uber",
          payment: PaymentType.CARD,
          serviceStatus: "completed",
        },
        {
          id: 3,
          startTime: new Date(2026, 6, 20, 10, 0, 0, 0).toISOString(),
          endTime: new Date(2026, 6, 20, 10, 20, 0, 0).toISOString(),
          amount: null,
          source: "cabify",
          payment: null,
          serviceStatus: "incomplete",
        },
        {
          id: 4,
          startTime: new Date(2026, 6, 20, 11, 0, 0, 0).toISOString(),
          endTime: null,
          amount: null,
          source: "freeNow",
          payment: null,
          serviceStatus: null,
        },
      ],
      dailySummary: {
        servicesTotal: 4,
        servicesTaxi: 1,
        servicesUber: 1,
        servicesCabify: 1,
        servicesFreeNow: 1,
        servicesOther: 0,
        total: 20,
        taxi: 12,
        uber: 8,
        cabify: 0,
        freeNow: 0,
        efectivo: 12,
        tarjeta: 8,
        app: 0,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
    });

    expect(projection.dateLabel).toBe("Lun, 20 jul");
    expect(projection.statusLabel).toBe("ABIERTA");
    expect(projection.totalServices).toBe(4);
    expect(projection.completedServices).toBe(3);
    expect(projection.pendingServices).toBe(1);
    expect(projection.incidentServices).toBe(2);
    expect(projection.totalAmount).toBe(20);
    expect(projection.workedDurationLabel).toBe("4 h");
    expect(projection.workedKilometers).toBeNull();
    expect(projection.tripHistory.map((trip) => trip.id)).toEqual([1, 2, 3, 4]);
    expect(projection.platformRows.map((row) => row.id)).toEqual([
      "taxi",
      "uber",
      "cabify",
      "freeNow",
    ]);
    expect(projection.paymentRows.map((row) => row.id)).toEqual([
      "cash",
      "card",
    ]);
    expect(projection.incidentRows.map((row) => row.id)).toEqual([
      "pending",
      "open",
    ]);
  });

  it("builds the closed-day summary with definitive hours and kilometers", () => {
    const projection = buildSummaryScreenProjection({
      selectedDate: new Date(2026, 6, 19, 12, 0, 0, 0),
      currentTime: new Date(2026, 6, 20, 12, 0, 0, 0),
      workdayInfo: {
        id: 8,
        startTime: new Date(2026, 6, 19, 8, 0, 0, 0).toISOString(),
        endTime: new Date(2026, 6, 19, 14, 30, 0, 0).toISOString(),
        startOdometer: 1500,
        endOdometer: 1575,
        isClosed: true,
      },
      activeWorkday: null,
      trips: [],
      dailySummary: null,
    });

    expect(projection.dateLabel).toBe("Dom, 19 jul");
    expect(projection.statusLabel).toBe("CERRADA");
    expect(projection.workedDurationLabel).toBe("6 h 30 min");
    expect(projection.workedKilometers).toBe(75);
    expect(projection.totalAmount).toBe(0);
    expect(projection.tripHistory).toHaveLength(0);
  });
});
