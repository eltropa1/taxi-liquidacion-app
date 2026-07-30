import { PaymentType, TripSource } from "../../../constants/enums";
import { buildHistoryScreenProjection } from "../HistoryScreenProjection";

describe("buildHistoryScreenProjection", () => {
  it("formats the weekly dataset with summary rows, goal context and jornada breakdown", () => {
    const projection = buildHistoryScreenProjection({
      period: {
        periodType: "week",
        startDate: new Date(2026, 6, 20, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 26, 23, 59, 59, 999),
        label: "Semana actual · 20 jul - 26 jul",
        isCurrent: true,
        isEmpty: false,
        canNavigatePrevious: true,
        canNavigateNext: false,
        previousSelection: {
          periodType: "week",
          anchorDate: new Date(2026, 6, 13, 0, 0, 0, 0),
        },
        nextSelection: null,
      },
      summary: {
        servicesTotal: 3,
        servicesTaxi: 1,
        servicesUber: 1,
        servicesCabify: 1,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 53,
        taxi: 15,
        uber: 20,
        cabify: 18,
        freeNow: 0,
        efectivo: 15,
        tarjeta: 20,
        app: 18,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
      breakdown: [
        {
          workday: {
            id: 1,
            startTime: "2026-07-20T08:00:00.000Z",
            endTime: "2026-07-20T15:00:00.000Z",
            isClosed: true,
            goalPolicyId: "goal-1",
            startOdometer: null,
            endOdometer: null,
          },
          recordCount: 2,
          summary: {
            servicesTotal: 2,
            servicesTaxi: 1,
            servicesUber: 1,
            servicesCabify: 0,
            servicesFreeNow: 0,
            servicesOther: 0,
            total: 35,
            taxi: 15,
            uber: 20,
            cabify: 0,
            freeNow: 0,
            efectivo: 15,
            tarjeta: 20,
            app: 0,
            propinaTarjeta: 0,
            propinaEfectivo: 0,
          },
          goalContext: {
            status: "resolved",
            source: "historical",
            policy: {
              id: "goal-1",
              effectiveAt: "2026-07-01T00:00:00.000Z",
              goals: { daily: 240, weekly: 1150, monthly: 3900 },
            },
          },
        },
        {
          workday: {
            id: 2,
            startTime: "2026-07-21T09:00:00.000Z",
            endTime: null,
            isClosed: false,
            goalPolicyId: null,
            startOdometer: null,
            endOdometer: null,
          },
          recordCount: 1,
          summary: {
            servicesTotal: 1,
            servicesTaxi: 0,
            servicesUber: 0,
            servicesCabify: 1,
            servicesFreeNow: 0,
            servicesOther: 0,
            total: 18,
            taxi: 0,
            uber: 0,
            cabify: 18,
            freeNow: 0,
            efectivo: 0,
            tarjeta: 0,
            app: 18,
            propinaTarjeta: 0,
            propinaEfectivo: 0,
          },
          goalContext: {
            status: "resolved",
            source: "current",
            policy: {
              id: "goal-current",
              effectiveAt: "2026-07-20T00:00:00.000Z",
              goals: { daily: 250, weekly: 1200, monthly: 4000 },
            },
          },
        },
      ],
      workdays: [
        {
          id: 1,
          startTime: "2026-07-20T08:00:00.000Z",
          endTime: "2026-07-20T15:00:00.000Z",
          isClosed: true,
          goalPolicyId: "goal-1",
          startOdometer: 100,
          endOdometer: 140,
        },
        {
          id: 2,
          startTime: "2026-07-21T09:00:00.000Z",
          endTime: null,
          isClosed: false,
          goalPolicyId: null,
          startOdometer: null,
          endOdometer: null,
        },
      ],
      records: [
        {
          workdayId: 1,
          trip: {
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
        },
      ],
      goalContext: {
        status: "resolved",
        source: "current",
        policy: {
          id: "goal-current",
          effectiveAt: "2026-07-20T00:00:00.000Z",
          goals: { daily: 250, weekly: 1200, monthly: 4000 },
        },
      },
    });

    expect(projection.titleLabel).toBe("Historial");
    expect(projection.periodStatusLabel).toBe("Semana actual");
    expect(projection.summaryRows.map((row) => row.id)).toEqual([
      "income",
      "services",
      "workdays",
      "kilometers",
    ]);
    expect(projection.summaryRows.find((row) => row.id === "kilometers")).toEqual({
      id: "kilometers",
      label: "Kilómetros",
      value: "40 km",
    });
    expect(projection.goalContextLabel).toBe("Meta actual");
    expect(projection.goalRows).toEqual([
      { label: "Diaria", value: "250,00 €" },
      { label: "Semanal", value: "1200,00 €" },
      { label: "Mensual", value: "4000,00 €" },
    ]);
    expect(projection.workdayRows).toHaveLength(2);
    expect(projection.workdayRows[0]).toMatchObject({
      id: 1,
      dateLabel: "Lun, 20 jul",
      timeRangeLabel: "10:00 - 17:00",
      statusLabel: "CERRADA",
      servicesLabel: "2 servicios",
      amountLabel: "35,00 €",
      goalContextLabel: "Meta histórica",
    });
    expect(projection.workdayRows[1]).toMatchObject({
      id: 2,
      statusLabel: "ABIERTA",
      goalContextLabel: "Meta actual",
    });
  });

  it("formats the economic consolidado with platform and payment groups matching Summary semantics", () => {
    const projection = buildHistoryScreenProjection({
      period: {
        periodType: "week",
        startDate: new Date(2026, 6, 20, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 26, 23, 59, 59, 999),
        label: "Semana actual · 20 jul - 26 jul",
        isCurrent: true,
        isEmpty: false,
        canNavigatePrevious: true,
        canNavigateNext: false,
        previousSelection: {
          periodType: "week",
          anchorDate: new Date(2026, 6, 13, 0, 0, 0, 0),
        },
        nextSelection: null,
      },
      summary: {
        servicesTotal: 3,
        servicesTaxi: 1,
        servicesUber: 1,
        servicesCabify: 1,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 53,
        taxi: 15,
        uber: 20,
        cabify: 18,
        freeNow: 0,
        efectivo: 15,
        tarjeta: 20,
        app: 18,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
      breakdown: [
        {
          workday: {
            id: 1,
            startTime: "2026-07-20T08:00:00.000Z",
            endTime: "2026-07-20T15:00:00.000Z",
            isClosed: true,
            goalPolicyId: "goal-1",
            startOdometer: null,
            endOdometer: null,
          },
          recordCount: 3,
          summary: {
            servicesTotal: 3,
            servicesTaxi: 1,
            servicesUber: 1,
            servicesCabify: 1,
            servicesFreeNow: 0,
            servicesOther: 0,
            total: 53,
            taxi: 15,
            uber: 20,
            cabify: 18,
            freeNow: 0,
            efectivo: 15,
            tarjeta: 20,
            app: 18,
            propinaTarjeta: 0,
            propinaEfectivo: 0,
          },
          goalContext: {
            status: "resolved",
            source: "historical",
            policy: {
              id: "goal-1",
              effectiveAt: "2026-07-01T00:00:00.000Z",
              goals: { daily: 240, weekly: 1150, monthly: 3900 },
            },
          },
        },
      ],
      workdays: [
        {
          id: 1,
          startTime: "2026-07-20T08:00:00.000Z",
          endTime: "2026-07-20T15:00:00.000Z",
          isClosed: true,
          goalPolicyId: "goal-1",
          startOdometer: null,
          endOdometer: null,
        },
      ],
      records: [
        {
          workdayId: 1,
          trip: {
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
        },
        {
          workdayId: 1,
          trip: {
            id: 12,
            startTime: "2026-07-20T10:00:00.000Z",
            endTime: "2026-07-20T10:20:00.000Z",
            amount: 20,
            source: TripSource.UBER,
            payment: PaymentType.CARD,
            chargedAmount: 20,
            cashTip: 0,
            serviceStatus: "completed",
          },
        },
        {
          workdayId: 1,
          trip: {
            id: 13,
            startTime: "2026-07-20T11:00:00.000Z",
            endTime: "2026-07-20T11:15:00.000Z",
            amount: 18,
            source: TripSource.CABIFY,
            payment: PaymentType.APP,
            chargedAmount: 18,
            cashTip: 0,
            serviceStatus: "completed",
          },
        },
      ],
      goalContext: {
        status: "resolved",
        source: "historical",
        policy: {
          id: "goal-1",
          effectiveAt: "2026-07-01T00:00:00.000Z",
          goals: { daily: 240, weekly: 1150, monthly: 3900 },
        },
      },
    });

    expect(projection.tripHistory).toHaveLength(3);
    expect(projection.platformRows.map((row) => row.id)).toEqual([
      "taxi",
      "uber",
      "cabify",
    ]);
    expect(projection.platformRows.map((row) => row.amount)).toEqual([15, 20, 18]);
    expect(projection.paymentRows.map((row) => row.id)).toEqual([
      "cash",
      "card",
      "app",
    ]);
    expect(projection.paymentRows.map((row) => row.amount)).toEqual([15, 20, 18]);
  });

  it("keeps ambiguous goal context explicit and does not invent a fake weekly policy", () => {
    const projection = buildHistoryScreenProjection({
      period: {
        periodType: "week",
        startDate: new Date(2026, 6, 6, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 12, 23, 59, 59, 999),
        label: "Semana histórica · 6 jul - 12 jul",
        isCurrent: false,
        isEmpty: false,
        canNavigatePrevious: true,
        canNavigateNext: true,
        previousSelection: {
          periodType: "week",
          anchorDate: new Date(2026, 5, 29, 0, 0, 0, 0),
        },
        nextSelection: {
          periodType: "week",
          anchorDate: new Date(2026, 6, 13, 0, 0, 0, 0),
        },
      },
      summary: {
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
      },
      breakdown: [
        {
          workday: {
            id: 7,
            startTime: "2026-07-08T08:00:00.000Z",
            endTime: "2026-07-08T15:00:00.000Z",
            isClosed: true,
            goalPolicyId: null,
            startOdometer: null,
            endOdometer: null,
          },
          recordCount: 1,
          summary: {
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
          },
          goalContext: {
            status: "unknown",
            reason: "no_evidence",
          },
        },
      ],
      workdays: [
        {
          id: 7,
          startTime: "2026-07-08T08:00:00.000Z",
          endTime: "2026-07-08T15:00:00.000Z",
          isClosed: true,
          goalPolicyId: null,
          startOdometer: null,
          endOdometer: null,
        },
      ],
      records: [
        {
          workdayId: 7,
          trip: {
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
        },
      ],
      goalContext: {
        status: "mixed",
        reason: "missing_evidence",
        policies: [],
      },
    });

    expect(projection.periodStatusLabel).toBe("Semana histórica");
    expect(projection.goalContextLabel).toBe("Contexto mixto");
    expect(projection.goalRows).toBeNull();
    expect(projection.workdayRows[0]?.goalContextLabel).toBe("Sin contexto histórico");
  });

  it("formats the monthly dataset with official week breakdown rows", () => {
    const projection = buildHistoryScreenProjection({
      period: {
        periodType: "month",
        startDate: new Date(2026, 6, 1, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 31, 23, 59, 59, 999),
        label: "Mes actual · julio 2026",
        isCurrent: true,
        isEmpty: false,
        canNavigatePrevious: true,
        canNavigateNext: false,
        previousSelection: {
          periodType: "month",
          anchorDate: new Date(2026, 5, 1, 12, 0, 0, 0),
        },
        nextSelection: null,
      },
      summary: {
        servicesTotal: 4,
        servicesTaxi: 2,
        servicesUber: 1,
        servicesCabify: 1,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 79,
        taxi: 29,
        uber: 20,
        cabify: 30,
        freeNow: 0,
        efectivo: 29,
        tarjeta: 50,
        app: 0,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
      periodBreakdown: [
        {
          periodType: "week",
          startDate: new Date(2026, 6, 1, 0, 0, 0, 0),
          endDate: new Date(2026, 6, 5, 23, 59, 59, 999),
          selection: {
            periodType: "week",
            anchorDate: new Date(2026, 6, 1, 0, 0, 0, 0),
          },
          workdayCount: 1,
          recordCount: 2,
          summary: {
            servicesTotal: 2,
            servicesTaxi: 1,
            servicesUber: 1,
            servicesCabify: 0,
            servicesFreeNow: 0,
            servicesOther: 0,
            total: 35,
            taxi: 15,
            uber: 20,
            cabify: 0,
            freeNow: 0,
            efectivo: 15,
            tarjeta: 20,
            app: 0,
            propinaTarjeta: 0,
            propinaEfectivo: 0,
          },
          goalContext: {
            status: "resolved",
            source: "historical",
            policy: {
              id: "goal-1",
              effectiveAt: "2026-07-01T00:00:00.000Z",
              goals: { daily: 240, weekly: 1150, monthly: 3900 },
            },
          },
        },
      ],
      breakdown: [],
      workdays: [],
      records: [],
      goalContext: {
        status: "resolved",
        source: "historical",
        policy: {
          id: "goal-1",
          effectiveAt: "2026-07-01T00:00:00.000Z",
          goals: { daily: 240, weekly: 1150, monthly: 3900 },
        },
      },
    } as any);

    expect(projection.periodType).toBe("month");
    expect(projection.periodStatusLabel).toBe("Mes actual");
    expect(projection.periodBreakdownRows).toHaveLength(1);
    expect(projection.periodBreakdownRows[0]).toMatchObject({
      rangeLabel: "Mié, 1 jul - Dom, 5 jul",
      workdaysLabel: "1 jornada",
      servicesLabel: "2 servicios",
      amountLabel: "35,00 €",
      goalContextLabel: "Meta histórica",
    });
  });

  it("keeps custom ranges explicit and does not invent a weekly breakdown", () => {
    const projection = buildHistoryScreenProjection({
      period: {
        periodType: "custom",
        startDate: new Date(2026, 5, 29, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 5, 23, 59, 59, 999),
        label: "Rango personalizado · 29 jun - 5 jul 2026",
        isCurrent: false,
        isEmpty: false,
        canNavigatePrevious: false,
        canNavigateNext: false,
        previousSelection: null,
        nextSelection: null,
      },
      summary: {
        servicesTotal: 3,
        servicesTaxi: 1,
        servicesUber: 1,
        servicesCabify: 1,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 56,
        taxi: 14,
        uber: 20,
        cabify: 22,
        freeNow: 0,
        efectivo: 14,
        tarjeta: 20,
        app: 22,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
      breakdown: [],
      workdays: [],
      records: [],
      goalContext: {
        status: "mixed",
        reason: "multiple_policies",
        policies: [],
      },
    } as any);

    expect(projection.periodType).toBe("custom");
    expect(projection.periodStatusLabel).toBe("Rango personalizado");
    expect(projection.periodBreakdownRows).toHaveLength(0);
    expect(projection.summaryRows.map((row) => row.id)).toEqual(["income", "services", "workdays"]);
    expect(projection.goalContextLabel).toBe("Contexto mixto");
  });

  it("formats fortnight and year datasets with the corresponding status and breakdown labels", () => {
    const fortnightProjection = buildHistoryScreenProjection({
      period: {
        periodType: "fortnight",
        startDate: new Date(2026, 6, 16, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 31, 23, 59, 59, 999),
        label: "Quincena histórica · 16 jul - 31 jul 2026",
        isCurrent: false,
        isEmpty: false,
        canNavigatePrevious: true,
        canNavigateNext: true,
        previousSelection: {
          periodType: "fortnight",
          anchorDate: new Date(2026, 6, 1, 12, 0, 0, 0),
        },
        nextSelection: {
          periodType: "fortnight",
          anchorDate: new Date(2026, 7, 1, 12, 0, 0, 0),
        },
      },
      summary: {
        servicesTotal: 0,
        servicesTaxi: 0,
        servicesUber: 0,
        servicesCabify: 0,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 0,
        taxi: 0,
        uber: 0,
        cabify: 0,
        freeNow: 0,
        efectivo: 0,
        tarjeta: 0,
        app: 0,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
      breakdown: [],
      workdays: [],
      records: [],
      goalContext: {
        status: "unknown",
        reason: "no_evidence",
      },
    } as any);

    const yearProjection = buildHistoryScreenProjection({
      period: {
        periodType: "year",
        startDate: new Date(2026, 0, 1, 0, 0, 0, 0),
        endDate: new Date(2026, 11, 31, 23, 59, 59, 999),
        label: "Año actual · 2026",
        isCurrent: true,
        isEmpty: false,
        canNavigatePrevious: true,
        canNavigateNext: false,
        previousSelection: {
          periodType: "year",
          anchorDate: new Date(2025, 0, 1, 12, 0, 0, 0),
        },
        nextSelection: null,
      },
      summary: {
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
      },
      periodBreakdown: [
        {
          periodType: "month",
          startDate: new Date(2026, 0, 1, 0, 0, 0, 0),
          endDate: new Date(2026, 0, 31, 23, 59, 59, 999),
          selection: {
            periodType: "month",
            anchorDate: new Date(2026, 0, 1, 12, 0, 0, 0),
          },
          workdayCount: 1,
          recordCount: 1,
          summary: {
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
          },
          goalContext: {
            status: "resolved",
            source: "historical",
            policy: {
              id: "goal-1",
              effectiveAt: "2026-01-01T00:00:00.000Z",
              goals: { daily: 220, weekly: 1000, monthly: 3800 },
            },
          },
        },
      ],
      breakdown: [],
      workdays: [],
      records: [],
      goalContext: {
        status: "resolved",
        source: "historical",
        policy: {
          id: "goal-1",
          effectiveAt: "2026-01-01T00:00:00.000Z",
          goals: { daily: 220, weekly: 1000, monthly: 3800 },
        },
      },
    } as any);

    expect(fortnightProjection.periodStatusLabel).toBe("Quincena histórica");
    expect(fortnightProjection.periodBreakdownRows).toEqual([]);
    expect(yearProjection.periodStatusLabel).toBe("Año actual");
    expect(yearProjection.periodBreakdownRows).toHaveLength(1);
    expect(yearProjection.periodBreakdownRows[0]).toMatchObject({
      rangeLabel: "Enero de 2026",
      workdaysLabel: "1 jornada",
      servicesLabel: "1 servicio",
      amountLabel: "12,00 €",
    });
  });
});
