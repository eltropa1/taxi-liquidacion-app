import { configureApplicationPersistence, resetApplicationPersistence } from "../../ports/persistence";
import { configureApplicationRuntime, resetApplicationRuntime } from "../applicationRuntime";
import { SummaryService } from "../SummaryService";
import { PaymentType, TripSource } from "../../../constants/enums";

describe("SummaryService", () => {
  const persistence = {
    tripRepository: {
      findTripsForWorkday: jest.fn(),
      findTripsForWorkdayIds: jest.fn(),
    },
    workdayRepository: {
      findWorkdayIdsBetweenDates: jest.fn(),
      getOpenWorkday: jest.fn(),
    },
  };

  beforeEach(() => {
    configureApplicationPersistence(persistence as any);
    configureApplicationRuntime({
      goalStorage: {
        getGoals: jest.fn(),
        getCurrentGoalPolicy: jest.fn(),
        getGoalsAt: jest.fn(),
        getGoalHistory: jest.fn(),
        getGoalPolicyById: jest.fn(),
        saveGoals: jest.fn(),
      },
      weekConfigurationStorage: {
        getWeekConfiguration: jest.fn().mockResolvedValue({
          weekStartDay: "wednesday",
        }),
        saveWeekConfiguration: jest.fn(),
      },
      geoLocation: {} as any,
      geoAdministrativeResolver: {} as any,
      tripCsvExporter: {} as any,
    });
  });

  afterEach(() => {
    resetApplicationPersistence();
    resetApplicationRuntime();
    jest.clearAllMocks();
  });

  it("passes the operational week range to the repository", async () => {
    persistence.workdayRepository.findWorkdayIdsBetweenDates.mockResolvedValue(
      [],
    );

    await SummaryService.getWeekSummary(new Date(2026, 0, 1, 12, 0, 0, 0));

    expect(persistence.workdayRepository.findWorkdayIdsBetweenDates).toHaveBeenCalledTimes(
      1,
    );

    const [startDate, endDate] =
      persistence.workdayRepository.findWorkdayIdsBetweenDates.mock.calls[0];

    expect(startDate).toEqual(new Date(2026, 0, 1, 0, 0, 0, 0));
    expect(endDate).toEqual(new Date(2026, 0, 6, 23, 59, 59, 999));
  });

  it("derives service counters from the trips of a workday", async () => {
    persistence.tripRepository.findTripsForWorkday.mockResolvedValue([
      {
        id: 1,
        startTime: "2026-07-01T08:00:00.000Z",
        endTime: "2026-07-01T08:10:00.000Z",
        amount: 10,
        source: TripSource.TAXI,
        payment: PaymentType.CASH,
        chargedAmount: 10,
        cashTip: 0,
      },
      {
        id: 2,
        startTime: "2026-07-01T09:00:00.000Z",
        endTime: "2026-07-01T09:15:00.000Z",
        amount: 12,
        source: TripSource.UBER,
        payment: PaymentType.CARD,
        chargedAmount: 13,
        cashTip: 0,
      },
      {
        id: 3,
        startTime: "2026-07-01T10:00:00.000Z",
        endTime: "2026-07-01T10:20:00.000Z",
        amount: 8,
        source: TripSource.CABIFY,
        payment: PaymentType.APP,
        chargedAmount: 8,
        cashTip: 0,
      },
      {
        id: 4,
        startTime: "2026-07-01T11:00:00.000Z",
        endTime: "2026-07-01T11:25:00.000Z",
        amount: 5,
        source: TripSource.CUSTOM,
        payment: null,
        chargedAmount: null,
        cashTip: null,
      },
    ]);

    const summary = await SummaryService.getSummaryForWorkday(9);

    expect(summary.servicesTotal).toBe(4);
    expect(summary.servicesTaxi).toBe(1);
    expect(summary.servicesUber).toBe(1);
    expect(summary.servicesCabify).toBe(1);
    expect(summary.servicesFreeNow).toBe(0);
    expect(summary.servicesOther).toBe(1);
    expect(summary.total).toBe(35);
    expect(summary.taxi).toBe(10);
    expect(summary.uber).toBe(12);
    expect(summary.cabify).toBe(8);
    expect(summary.efectivo).toBe(10);
    expect(summary.tarjeta).toBe(13);
    expect(summary.app).toBe(8);
  });
});
