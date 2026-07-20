import { loadSummaryScreenData } from "../summaryScreenLoaders";
import {
  SummaryService,
  TripQueryService,
  WorkdayService,
} from "../../application/runtime";
import { PaymentType, TripSource } from "../../constants/enums";
import { buildSummaryScreenProjection } from "../../presentation";

jest.mock("../../application/runtime", () => ({
  SummaryService: {
    getSummaryForWorkday: jest.fn().mockResolvedValue(null),
  },
  TripQueryService: {
    getTripsForWorkday: jest.fn().mockResolvedValue([]),
  },
  WorkdayService: {
    getOpenWorkday: jest.fn().mockResolvedValue(null),
    getWorkdayInfoForDate: jest.fn().mockResolvedValue(null),
  },
}));

describe("loadSummaryScreenData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads only the selected jornada context and no weekly/monthly aggregates", async () => {
    const selectedDate = new Date(2026, 6, 20, 12, 0, 0, 0);

    await loadSummaryScreenData(selectedDate);

    expect(WorkdayService.getWorkdayInfoForDate).toHaveBeenCalledWith(selectedDate);
    expect(SummaryService.getSummaryForWorkday).not.toHaveBeenCalled();
  });

  it("requests the daily summary once a workday id exists", async () => {
    const selectedDate = new Date(2026, 6, 20, 12, 0, 0, 0);
    const workday = {
      id: 9,
      startTime: "2026-07-20T08:00:00.000Z",
      endTime: null,
      startOdometer: 1200,
      endOdometer: null,
      isClosed: false,
    };

    (WorkdayService.getOpenWorkday as jest.Mock).mockResolvedValueOnce(workday);
    (WorkdayService.getWorkdayInfoForDate as jest.Mock).mockResolvedValueOnce(workday);

    await loadSummaryScreenData(selectedDate);

    expect(SummaryService.getSummaryForWorkday).toHaveBeenCalledWith(9);
  });

  it("keeps a historical jornada isolated even when an open workday exists today", async () => {
    const selectedDate = new Date(2026, 6, 19, 12, 0, 0, 0);
    const historicalWorkday = {
      id: 41,
      startTime: "2026-07-19T08:00:00.000Z",
      endTime: "2026-07-19T16:00:00.000Z",
      startOdometer: 1000,
      endOdometer: 1125,
      isClosed: true,
    };
    const openWorkday = {
      id: 99,
      startTime: "2026-07-20T08:30:00.000Z",
      startOdometer: 2000,
    };
    const trip = {
      id: 7,
      startTime: "2026-07-19T09:00:00.000Z",
      endTime: "2026-07-19T09:12:00.000Z",
      amount: 12,
      source: TripSource.TAXI,
      payment: PaymentType.CASH,
      serviceStatus: "completed" as const,
    };

    (WorkdayService.getOpenWorkday as jest.Mock).mockResolvedValueOnce(openWorkday);
    (WorkdayService.getWorkdayInfoForDate as jest.Mock).mockResolvedValueOnce(
      historicalWorkday,
    );
    (TripQueryService.getTripsForWorkday as jest.Mock).mockResolvedValueOnce([trip]);
    const summary = {
      servicesTotal: 1,
      servicesTaxi: 1,
      servicesUber: 0,
      servicesCabify: 0,
      servicesFreeNow: 0,
      servicesOther: 0,
      total: 12,
      taxi: 12,
      uber: 0,
      cabify: 0,
      freeNow: 0,
      efectivo: 12,
      tarjeta: 0,
      app: 0,
      propinaTarjeta: 0,
      propinaEfectivo: 0,
    };
    (SummaryService.getSummaryForWorkday as jest.Mock).mockResolvedValueOnce(summary);

    const state = await loadSummaryScreenData(selectedDate);
    const projection = buildSummaryScreenProjection({
      selectedDate,
      currentTime: new Date(2026, 6, 20, 12, 0, 0, 0),
      workdayInfo: state.workdayInfo,
      activeWorkday: state.activeWorkday,
      trips: state.trips,
      dailySummary: state.dailySummary,
    });

    expect(state.activeWorkday).toBeNull();
    expect(state.workdayInfo?.id).toBe(41);
    expect(SummaryService.getSummaryForWorkday).toHaveBeenCalledWith(41);
    expect(SummaryService.getSummaryForWorkday).not.toHaveBeenCalledWith(99);
    expect(projection.statusLabel).toBe("CERRADA");
    expect(projection.workdayId).toBe(41);
    expect(projection.totalServices).toBe(1);
    expect(projection.totalAmount).toBe(12);
  });

  it("reloads the selected jornada when the date changes", async () => {
    const firstDate = new Date(2026, 6, 18, 12, 0, 0, 0);
    const secondDate = new Date(2026, 6, 19, 12, 0, 0, 0);

    const firstWorkday = {
      id: 51,
      startTime: "2026-07-18T08:00:00.000Z",
      endTime: "2026-07-18T14:00:00.000Z",
      startOdometer: 900,
      endOdometer: 980,
      isClosed: true,
    };
    const secondWorkday = {
      id: 52,
      startTime: "2026-07-19T08:00:00.000Z",
      endTime: "2026-07-19T15:00:00.000Z",
      startOdometer: 980,
      endOdometer: 1060,
      isClosed: true,
    };

    (WorkdayService.getOpenWorkday as jest.Mock)
      .mockResolvedValueOnce({ id: 99, startTime: "2026-07-20T08:30:00.000Z", startOdometer: 2000 })
      .mockResolvedValueOnce({ id: 99, startTime: "2026-07-20T08:30:00.000Z", startOdometer: 2000 });
    (WorkdayService.getWorkdayInfoForDate as jest.Mock)
      .mockResolvedValueOnce(firstWorkday)
      .mockResolvedValueOnce(secondWorkday);
    (TripQueryService.getTripsForWorkday as jest.Mock)
      .mockResolvedValueOnce([
        {
          id: 11,
          startTime: "2026-07-18T09:00:00.000Z",
          endTime: "2026-07-18T09:10:00.000Z",
          amount: 10,
          source: TripSource.TAXI,
          payment: PaymentType.CASH,
          serviceStatus: "completed" as const,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 22,
          startTime: "2026-07-19T10:00:00.000Z",
          endTime: "2026-07-19T10:12:00.000Z",
          amount: 14,
          source: TripSource.UBER,
          payment: PaymentType.CARD,
          serviceStatus: "completed" as const,
        },
      ]);
    (SummaryService.getSummaryForWorkday as jest.Mock)
      .mockResolvedValueOnce({
        servicesTotal: 1,
        servicesTaxi: 1,
        servicesUber: 0,
        servicesCabify: 0,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 10,
        taxi: 10,
        uber: 0,
        cabify: 0,
        freeNow: 0,
        efectivo: 10,
        tarjeta: 0,
        app: 0,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      })
      .mockResolvedValueOnce({
        servicesTotal: 1,
        servicesTaxi: 0,
        servicesUber: 1,
        servicesCabify: 0,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 14,
        taxi: 0,
        uber: 14,
        cabify: 0,
        freeNow: 0,
        efectivo: 0,
        tarjeta: 14,
        app: 0,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      });

    const firstState = await loadSummaryScreenData(firstDate);
    const secondState = await loadSummaryScreenData(secondDate);

    expect(firstState.activeWorkday).toBeNull();
    expect(secondState.activeWorkday).toBeNull();
    expect(firstState.workdayInfo?.id).toBe(51);
    expect(secondState.workdayInfo?.id).toBe(52);
    expect(SummaryService.getSummaryForWorkday).toHaveBeenNthCalledWith(1, 51);
    expect(SummaryService.getSummaryForWorkday).toHaveBeenNthCalledWith(2, 52);
    expect(TripQueryService.getTripsForWorkday).toHaveBeenNthCalledWith(1, 51);
    expect(TripQueryService.getTripsForWorkday).toHaveBeenNthCalledWith(2, 52);
  });
});
