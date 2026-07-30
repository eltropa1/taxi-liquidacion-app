import { PaymentType, TripSource } from "../../../constants/enums";
import {
  configureApplicationPersistence,
  resetApplicationPersistence,
} from "../../ports/persistence";
import {
  configureApplicationRuntime,
  resetApplicationRuntime,
} from "../../runtime/applicationRuntime";
import { HistoricalQueryService } from "../HistoricalQueryService";

describe("HistoricalQueryService", () => {
  const persistence = {
    tripRepository: {
      findTripsForWorkday: jest.fn(),
    },
    workdayRepository: {
      findWorkdaysBetweenDates: jest.fn(),
    },
    tripGeoSnapshotRepository: {} as any,
  };

  const goalPolicy = {
    id: "goal-current",
    effectiveAt: "2026-07-20T00:00:00.000Z",
    goals: {
      daily: 250,
      weekly: 1200,
      monthly: 4000,
    },
  };

  const goalStorage = {
    getGoals: jest.fn(),
    getCurrentGoalPolicy: jest.fn().mockResolvedValue(goalPolicy),
    getGoalsAt: jest.fn(),
    getGoalHistory: jest.fn(),
    getGoalPolicyById: jest.fn().mockResolvedValue(goalPolicy),
    saveGoals: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 21, 12, 0, 0, 0));

    configureApplicationPersistence(persistence as any);
    configureApplicationRuntime({
      goalStorage,
      weekConfigurationStorage: {
        getWeekConfiguration: jest.fn().mockResolvedValue({
          weekStartDay: "monday",
        }),
        saveWeekConfiguration: jest.fn(),
      },
      geoLocation: {} as any,
      geoAdministrativeResolver: {} as any,
      tripCsvExporter: {} as any,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    resetApplicationPersistence();
    resetApplicationRuntime();
    jest.clearAllMocks();
  });

  it("builds a custom historical range as a canonical explicit dataset without inventing a weekly breakdown", async () => {
    persistence.workdayRepository.findWorkdaysBetweenDates.mockResolvedValueOnce([
      {
        id: 21,
        startTime: "2026-06-30T22:30:00.000Z",
        endTime: "2026-07-01T01:10:00.000Z",
        startOdometer: 400,
        endOdometer: 430,
        isClosed: true,
        createdAt: "2026-06-30T22:30:00.000Z",
        goalPolicyId: "goal-historical",
      },
      {
        id: 22,
        startTime: "2026-07-02T08:00:00.000Z",
        endTime: "2026-07-02T15:00:00.000Z",
        startOdometer: 430,
        endOdometer: 470,
        isClosed: false,
        createdAt: "2026-07-02T08:00:00.000Z",
        goalPolicyId: null,
      },
      {
        id: 23,
        startTime: "2026-07-05T09:30:00.000Z",
        endTime: "2026-07-05T14:30:00.000Z",
        startOdometer: 470,
        endOdometer: 510,
        isClosed: true,
        createdAt: "2026-07-05T09:30:00.000Z",
        goalPolicyId: "goal-historical",
      },
    ]);

    persistence.tripRepository.findTripsForWorkday
      .mockResolvedValueOnce([
        {
          id: 201,
          startTime: "2026-06-30T22:45:00.000Z",
          endTime: "2026-06-30T23:00:00.000Z",
          amount: 14,
          source: TripSource.TAXI,
          payment: PaymentType.CASH,
          chargedAmount: 14,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 202,
          startTime: "2026-07-02T10:15:00.000Z",
          endTime: "2026-07-02T10:25:00.000Z",
          amount: 20,
          source: TripSource.UBER,
          payment: PaymentType.CARD,
          chargedAmount: 20,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 203,
          startTime: "2026-07-05T11:00:00.000Z",
          endTime: "2026-07-05T11:12:00.000Z",
          amount: 22,
          source: TripSource.CABIFY,
          payment: PaymentType.APP,
          chargedAmount: 22,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ]);

    goalStorage.getCurrentGoalPolicy.mockResolvedValue(goalPolicy);
    goalStorage.getGoalPolicyById.mockImplementation(async (policyId: string) => {
      if (policyId === "goal-historical") {
        return {
          id: "goal-historical",
          effectiveAt: "2026-06-15T00:00:00.000Z",
          goals: {
            daily: 240,
            weekly: 1100,
            monthly: 3600,
          },
        };
      }

      return goalPolicy;
    });

    const dataset = await HistoricalQueryService.getHistoricalDataset({
      periodType: "custom",
      startDate: new Date(2026, 5, 29, 12, 0, 0, 0),
      endDate: new Date(2026, 6, 5, 12, 0, 0, 0),
    });

    expect(persistence.workdayRepository.findWorkdaysBetweenDates).toHaveBeenCalledWith(
      new Date(2026, 5, 29, 0, 0, 0, 0),
      new Date(2026, 6, 5, 23, 59, 59, 999),
    );
    expect(dataset.period.periodType).toBe("custom");
    expect(dataset.period.label).toBe("Rango personalizado · 29 jun - 5 jul 2026");
    expect(dataset.period.isCurrent).toBe(false);
    expect(dataset.period.canNavigatePrevious).toBe(false);
    expect(dataset.period.canNavigateNext).toBe(false);
    expect(dataset.periodBreakdown).toEqual([]);
    expect(dataset.breakdown).toHaveLength(3);
    expect(dataset.workdays.map((workday) => workday.id)).toEqual([21, 22, 23]);
    expect(dataset.records.map((record) => record.workdayId)).toEqual([21, 22, 23]);
    expect(dataset.summary.servicesTotal).toBe(3);
    expect(dataset.summary.total).toBe(56);
    expect(dataset.goalContext).toEqual({
      status: "mixed",
      reason: "multiple_policies",
      policies: [
        {
          id: "goal-historical",
          effectiveAt: "2026-06-15T00:00:00.000Z",
          goals: {
            daily: 240,
            weekly: 1100,
            monthly: 3600,
          },
        },
        goalPolicy,
      ],
    });
    expect(dataset.breakdown[0]?.goalContext).toEqual({
      status: "resolved",
      source: "historical",
      policy: {
        id: "goal-historical",
        effectiveAt: "2026-06-15T00:00:00.000Z",
        goals: {
          daily: 240,
          weekly: 1100,
          monthly: 3600,
        },
      },
    });
    expect(dataset.breakdown[1]?.goalContext).toEqual({
      status: "resolved",
      source: "current",
      policy: goalPolicy,
    });
  });

  it("builds the canonical current-week dataset from workdays and preserves goal context per jornada", async () => {
    persistence.workdayRepository.findWorkdaysBetweenDates.mockResolvedValueOnce([
      {
        id: 1,
        startTime: "2026-07-20T08:00:00.000Z",
        endTime: "2026-07-20T15:00:00.000Z",
        startOdometer: 1000,
        endOdometer: 1060,
        isClosed: true,
        createdAt: "2026-07-20T08:00:00.000Z",
        goalPolicyId: "goal-current",
      },
      {
        id: 2,
        startTime: "2026-07-21T09:00:00.000Z",
        endTime: null,
        startOdometer: 1060,
        endOdometer: null,
        isClosed: false,
        createdAt: "2026-07-21T09:00:00.000Z",
        goalPolicyId: null,
      },
      {
        id: 3,
        startTime: "2026-07-22T07:30:00.000Z",
        endTime: "2026-07-22T12:00:00.000Z",
        startOdometer: 1060,
        endOdometer: 1100,
        isClosed: true,
        createdAt: "2026-07-22T07:30:00.000Z",
        goalPolicyId: "goal-current",
      },
    ]);

    persistence.tripRepository.findTripsForWorkday
      .mockResolvedValueOnce([
        {
          id: 11,
          startTime: "2026-07-20T09:00:00.000Z",
          endTime: "2026-07-20T09:12:00.000Z",
          amount: 15,
          source: TripSource.TAXI,
          payment: PaymentType.CASH,
          chargedAmount: 15,
          cashTip: 0,
          serviceStatus: "completed",
        },
        {
          id: 12,
          startTime: "2026-07-20T10:30:00.000Z",
          endTime: "2026-07-20T10:42:00.000Z",
          amount: 20,
          source: TripSource.UBER,
          payment: PaymentType.CARD,
          chargedAmount: 20,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 21,
          startTime: "2026-07-21T10:00:00.000Z",
          endTime: "2026-07-21T10:18:00.000Z",
          amount: 18,
          source: TripSource.CABIFY,
          payment: PaymentType.APP,
          chargedAmount: 18,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([]);

    const dataset = await HistoricalQueryService.getWeekHistoricalDataset(
      new Date(2026, 6, 21, 12, 0, 0, 0),
    );

    expect(persistence.workdayRepository.findWorkdaysBetweenDates).toHaveBeenCalledWith(
      new Date(2026, 6, 20, 0, 0, 0, 0),
      new Date(2026, 6, 26, 23, 59, 59, 999),
    );
    expect(persistence.tripRepository.findTripsForWorkday).toHaveBeenNthCalledWith(1, 1);
    expect(persistence.tripRepository.findTripsForWorkday).toHaveBeenNthCalledWith(2, 2);
    expect(dataset.period.isCurrent).toBe(true);
    expect(dataset.period.canNavigateNext).toBe(false);
    expect(dataset.period.previousSelection?.periodType).toBe("week");
    expect(dataset.summary.servicesTotal).toBe(3);
    expect(dataset.summary.total).toBe(53);
    expect(dataset.breakdown).toHaveLength(3);
    expect(dataset.breakdown.reduce((accumulator, row) => accumulator + row.summary.total, 0)).toBe(
      dataset.summary.total,
    );
    expect(
      dataset.breakdown.reduce((accumulator, row) => accumulator + row.recordCount, 0),
    ).toBe(dataset.summary.servicesTotal);
    expect(dataset.records.map((record) => record.workdayId)).toEqual([1, 1, 2]);
    expect(dataset.records).toHaveLength(dataset.summary.servicesTotal);
    expect(dataset.breakdown[0]?.goalContext).toEqual({
      status: "resolved",
      source: "historical",
      policy: goalPolicy,
    });
    expect(dataset.breakdown[1]?.goalContext).toEqual({
      status: "resolved",
      source: "current",
      policy: goalPolicy,
    });
    expect(dataset.breakdown[2]?.recordCount).toBe(0);
    expect(dataset.breakdown[2]?.summary.servicesTotal).toBe(0);
    expect(dataset.goalContext).toEqual({
      status: "resolved",
      source: "current",
      policy: goalPolicy,
    });
  });

  it("keeps an historical week free of current goal contamination when no evidence is available", async () => {
    persistence.workdayRepository.findWorkdaysBetweenDates.mockResolvedValueOnce([
      {
        id: 7,
        startTime: "2026-07-08T08:00:00.000Z",
        endTime: "2026-07-08T15:00:00.000Z",
        startOdometer: 900,
        endOdometer: 940,
        isClosed: true,
        createdAt: "2026-07-08T08:00:00.000Z",
        goalPolicyId: null,
      },
    ]);

    persistence.tripRepository.findTripsForWorkday.mockResolvedValueOnce([
      {
        id: 31,
        startTime: "2026-07-08T09:00:00.000Z",
        endTime: "2026-07-08T09:10:00.000Z",
        amount: 12,
        source: TripSource.TAXI,
        payment: PaymentType.CASH,
        chargedAmount: 12,
        cashTip: 0,
        serviceStatus: "completed",
      },
    ]);

    const dataset = await HistoricalQueryService.getWeekHistoricalDataset(
      new Date(2026, 6, 8, 12, 0, 0, 0),
    );

    expect(dataset.period.isCurrent).toBe(false);
    expect(dataset.period.canNavigateNext).toBe(true);
    expect(dataset.goalContext).toEqual({
      status: "unknown",
      reason: "no_evidence",
    });
    expect(dataset.breakdown[0]?.goalContext).toEqual({
      status: "unknown",
      reason: "no_evidence",
    });
    expect(persistence.workdayRepository.findWorkdaysBetweenDates).toHaveBeenCalledWith(
      new Date(2026, 6, 6, 0, 0, 0, 0),
      new Date(2026, 6, 12, 23, 59, 59, 999),
    );
    expect(goalStorage.getCurrentGoalPolicy).not.toHaveBeenCalled();
  });

  it("builds the canonical monthly dataset with official week breakdown and exact totals", async () => {
    persistence.workdayRepository.findWorkdaysBetweenDates.mockResolvedValueOnce([
      {
        id: 10,
        startTime: "2026-07-01T08:00:00.000Z",
        endTime: "2026-07-01T15:00:00.000Z",
        startOdometer: 100,
        endOdometer: 160,
        isClosed: true,
        createdAt: "2026-07-01T08:00:00.000Z",
        goalPolicyId: "goal-current",
      },
      {
        id: 11,
        startTime: "2026-07-07T09:00:00.000Z",
        endTime: "2026-07-07T17:30:00.000Z",
        startOdometer: 160,
        endOdometer: 210,
        isClosed: true,
        createdAt: "2026-07-07T09:00:00.000Z",
        goalPolicyId: "goal-current",
      },
      {
        id: 12,
        startTime: "2026-07-21T07:30:00.000Z",
        endTime: null,
        startOdometer: 210,
        endOdometer: null,
        isClosed: false,
        createdAt: "2026-07-21T07:30:00.000Z",
        goalPolicyId: null,
      },
      {
        id: 13,
        startTime: "2026-07-31T21:30:00.000Z",
        endTime: "2026-08-01T00:45:00.000Z",
        startOdometer: 210,
        endOdometer: 260,
        isClosed: true,
        createdAt: "2026-07-31T22:00:00.000Z",
        goalPolicyId: "goal-current",
      },
    ]);

    persistence.tripRepository.findTripsForWorkday
      .mockResolvedValueOnce([
        {
          id: 101,
          startTime: "2026-07-01T09:00:00.000Z",
          endTime: "2026-07-01T09:12:00.000Z",
          amount: 15,
          source: TripSource.TAXI,
          payment: PaymentType.CASH,
          chargedAmount: 15,
          cashTip: 0,
          serviceStatus: "completed",
        },
        {
          id: 102,
          startTime: "2026-07-01T10:00:00.000Z",
          endTime: "2026-07-01T10:20:00.000Z",
          amount: 20,
          source: TripSource.UBER,
          payment: PaymentType.CARD,
          chargedAmount: 20,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 103,
          startTime: "2026-07-07T10:00:00.000Z",
          endTime: "2026-07-07T10:10:00.000Z",
          amount: 18,
          source: TripSource.CABIFY,
          payment: PaymentType.APP,
          chargedAmount: 18,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 104,
          startTime: "2026-07-21T08:00:00.000Z",
          endTime: "2026-07-21T08:15:00.000Z",
          amount: 12,
          source: TripSource.TAXI,
          payment: PaymentType.CASH,
          chargedAmount: 12,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 105,
          startTime: "2026-07-31T21:45:00.000Z",
          endTime: "2026-07-31T22:00:00.000Z",
          amount: 14,
          source: TripSource.TAXI,
          payment: PaymentType.CASH,
          chargedAmount: 14,
          cashTip: 0,
          serviceStatus: "completed",
        },
        {
          id: 106,
          startTime: "2026-07-31T22:30:00.000Z",
          endTime: "2026-08-01T00:05:00.000Z",
          amount: 16,
          source: TripSource.UBER,
          payment: PaymentType.CARD,
          chargedAmount: 16,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ]);

    const dataset = await HistoricalQueryService.getMonthHistoricalDataset(
      new Date(2026, 6, 21, 12, 0, 0, 0),
    );

    expect(dataset.period.periodType).toBe("month");
    expect(dataset.period.isCurrent).toBe(true);
    expect(dataset.period.canNavigateNext).toBe(false);
    expect(dataset.period.previousSelection?.periodType).toBe("month");
    expect(dataset.period.nextSelection).toBeNull();
    expect(dataset.periodBreakdown).toHaveLength(5);
    expect(dataset.periodBreakdown?.[0]).toMatchObject({
      periodType: "week",
      startDate: new Date(2026, 6, 1, 0, 0, 0, 0),
      endDate: new Date(2026, 6, 5, 23, 59, 59, 999),
      workdayCount: 1,
      recordCount: 2,
    });
    expect(dataset.periodBreakdown?.[4]).toMatchObject({
      periodType: "week",
      startDate: new Date(2026, 6, 27, 0, 0, 0, 0),
      endDate: new Date(2026, 6, 31, 23, 59, 59, 999),
      workdayCount: 1,
      recordCount: 2,
    });
    expect(
      dataset.periodBreakdown?.reduce((accumulator, row) => accumulator + row.summary.total, 0),
    ).toBe(dataset.summary.total);
    expect(
      dataset.periodBreakdown?.reduce(
        (accumulator, row) => accumulator + row.summary.servicesTotal,
        0,
      ),
    ).toBe(dataset.summary.servicesTotal);
    expect(
      dataset.periodBreakdown?.reduce((accumulator, row) => accumulator + row.workdayCount, 0),
    ).toBe(dataset.breakdown.length);
    expect(dataset.records.map((record) => record.workdayId)).toEqual([10, 10, 11, 12, 13, 13]);
    expect(dataset.records).toHaveLength(dataset.summary.servicesTotal);
    expect(dataset.goalContext).toEqual({
      status: "resolved",
      source: "current",
      policy: goalPolicy,
    });
    expect(dataset.periodBreakdown?.[3]?.goalContext).toEqual({
      status: "resolved",
      source: "current",
      policy: goalPolicy,
    });
  });

  it("builds the canonical fortnight dataset with exact half-month boundaries", async () => {
    persistence.workdayRepository.findWorkdaysBetweenDates.mockResolvedValueOnce([
      {
        id: 41,
        startTime: "2026-07-16T08:00:00.000Z",
        endTime: "2026-07-16T15:00:00.000Z",
        startOdometer: 300,
        endOdometer: 340,
        isClosed: true,
        createdAt: "2026-07-16T08:00:00.000Z",
        goalPolicyId: "goal-current",
      },
      {
        id: 42,
        startTime: "2026-07-29T09:00:00.000Z",
        endTime: "2026-07-29T15:00:00.000Z",
        startOdometer: 340,
        endOdometer: 380,
        isClosed: true,
        createdAt: "2026-07-29T09:00:00.000Z",
        goalPolicyId: "goal-current",
      },
    ]);

    persistence.tripRepository.findTripsForWorkday
      .mockResolvedValueOnce([
        {
          id: 401,
          startTime: "2026-07-16T09:00:00.000Z",
          endTime: "2026-07-16T09:10:00.000Z",
          amount: 10,
          source: TripSource.TAXI,
          payment: PaymentType.CASH,
          chargedAmount: 10,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 402,
          startTime: "2026-07-29T10:00:00.000Z",
          endTime: "2026-07-29T10:15:00.000Z",
          amount: 12,
          source: TripSource.UBER,
          payment: PaymentType.CARD,
          chargedAmount: 12,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ]);

    const dataset = await HistoricalQueryService.getHistoricalDataset({
      periodType: "fortnight",
      anchorDate: new Date(2026, 6, 20, 12, 0, 0, 0),
    });

    expect(dataset.period.periodType).toBe("fortnight");
    expect(dataset.period.startDate).toEqual(new Date(2026, 6, 16, 0, 0, 0, 0));
    expect(dataset.period.endDate).toEqual(new Date(2026, 6, 31, 23, 59, 59, 999));
    expect(dataset.period.label).toBe("Quincena actual · 16 jul - 31 jul 2026");
    expect(dataset.period.canNavigatePrevious).toBe(true);
    expect(dataset.period.canNavigateNext).toBe(false);
    expect(dataset.period.previousSelection?.periodType).toBe("fortnight");
    expect(dataset.period.nextSelection).toBeNull();
    expect(dataset.summary.servicesTotal).toBe(2);
    expect(dataset.summary.total).toBe(22);
    expect(dataset.periodBreakdown).toEqual([]);
    expect(dataset.breakdown).toHaveLength(2);
    expect(dataset.records.map((record) => record.workdayId)).toEqual([41, 42]);
  });

  it("builds the canonical yearly dataset with month breakdown and exact totals", async () => {
    persistence.workdayRepository.findWorkdaysBetweenDates.mockResolvedValueOnce([
      {
        id: 51,
        startTime: "2026-01-10T08:00:00.000Z",
        endTime: "2026-01-10T15:00:00.000Z",
        startOdometer: 500,
        endOdometer: 540,
        isClosed: true,
        createdAt: "2026-01-10T08:00:00.000Z",
        goalPolicyId: "goal-current",
      },
      {
        id: 52,
        startTime: "2026-07-04T09:00:00.000Z",
        endTime: "2026-07-04T17:00:00.000Z",
        startOdometer: 540,
        endOdometer: 600,
        isClosed: true,
        createdAt: "2026-07-04T09:00:00.000Z",
        goalPolicyId: "goal-current",
      },
      {
        id: 53,
        startTime: "2026-12-31T22:00:00.000Z",
        endTime: "2027-01-01T01:00:00.000Z",
        startOdometer: 600,
        endOdometer: 650,
        isClosed: true,
        createdAt: "2026-12-31T22:00:00.000Z",
        goalPolicyId: "goal-current",
      },
    ]);

    persistence.tripRepository.findTripsForWorkday
      .mockResolvedValueOnce([
        {
          id: 501,
          startTime: "2026-01-10T09:00:00.000Z",
          endTime: "2026-01-10T09:10:00.000Z",
          amount: 11,
          source: TripSource.TAXI,
          payment: PaymentType.CASH,
          chargedAmount: 11,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 502,
          startTime: "2026-07-04T10:00:00.000Z",
          endTime: "2026-07-04T10:20:00.000Z",
          amount: 13,
          source: TripSource.UBER,
          payment: PaymentType.CARD,
          chargedAmount: 13,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 503,
          startTime: "2026-12-31T22:30:00.000Z",
          endTime: "2026-12-31T23:00:00.000Z",
          amount: 17,
          source: TripSource.CABIFY,
          payment: PaymentType.APP,
          chargedAmount: 17,
          cashTip: 0,
          serviceStatus: "completed",
        },
      ]);

    const dataset = await HistoricalQueryService.getHistoricalDataset({
      periodType: "year",
      anchorDate: new Date(2026, 6, 21, 12, 0, 0, 0),
    });

    expect(dataset.period.periodType).toBe("year");
    expect(dataset.period.startDate).toEqual(new Date(2026, 0, 1, 0, 0, 0, 0));
    expect(dataset.period.endDate).toEqual(new Date(2026, 11, 31, 23, 59, 59, 999));
    expect(dataset.period.label).toBe("Año actual · 2026");
    expect(dataset.period.canNavigatePrevious).toBe(true);
    expect(dataset.period.canNavigateNext).toBe(false);
    expect(dataset.periodBreakdown).toHaveLength(12);
    expect(dataset.periodBreakdown?.[0]).toMatchObject({
      periodType: "month",
      startDate: new Date(2026, 0, 1, 0, 0, 0, 0),
      endDate: new Date(2026, 0, 31, 23, 59, 59, 999),
      workdayCount: 1,
      recordCount: 1,
    });
    expect(dataset.periodBreakdown?.[6]).toMatchObject({
      periodType: "month",
      startDate: new Date(2026, 6, 1, 0, 0, 0, 0),
      endDate: new Date(2026, 6, 31, 23, 59, 59, 999),
      workdayCount: 1,
      recordCount: 1,
    });
    expect(dataset.periodBreakdown?.[11]).toMatchObject({
      periodType: "month",
      startDate: new Date(2026, 11, 1, 0, 0, 0, 0),
      endDate: new Date(2026, 11, 31, 23, 59, 59, 999),
      workdayCount: 1,
      recordCount: 1,
    });
    expect(
      dataset.periodBreakdown?.reduce((accumulator, row) => accumulator + row.summary.total, 0),
    ).toBe(dataset.summary.total);
    expect(
      dataset.periodBreakdown?.reduce(
        (accumulator, row) => accumulator + row.summary.servicesTotal,
        0,
      ),
    ).toBe(dataset.summary.servicesTotal);
    expect(dataset.records).toHaveLength(3);
    expect(dataset.records.map((record) => record.workdayId)).toEqual([51, 52, 53]);
  });
});
