import {
  configureApplicationRuntime,
  resetApplicationRuntime,
} from "../../runtime/applicationRuntime";
import { ExportService } from "../ExportService";
import {
  buildHistoricalExportFileName,
  escapeCsvValue,
  serializeCsvRow,
} from "../historicalExportCsv";

describe("Historical export", () => {
  const exportCsv = jest.fn();

  beforeEach(() => {
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
        getWeekConfiguration: jest.fn(),
        saveWeekConfiguration: jest.fn(),
      },
      geoLocation: {} as any,
      geoAdministrativeResolver: {} as any,
      tripCsvExporter: {
        exportCsv,
      },
    });
  });

  afterEach(() => {
    resetApplicationRuntime();
    jest.clearAllMocks();
  });

  function buildDataset(overrides: Partial<any> = {}) {
    const dataset = {
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
        servicesTotal: 2,
        servicesTaxi: 1,
        servicesUber: 1,
        servicesCabify: 0,
        servicesFreeNow: 0,
        servicesOther: 0,
        total: 34,
        taxi: 14,
        uber: 20,
        cabify: 0,
        freeNow: 0,
        efectivo: 14,
        tarjeta: 20,
        app: 0,
        propinaTarjeta: 0,
        propinaEfectivo: 0,
      },
      periodBreakdown: [],
      breakdown: [],
      workdays: [
        {
          id: 7,
          startTime: new Date(2026, 5, 29, 8, 15, 0, 0).toISOString(),
          endTime: new Date(2026, 5, 29, 16, 30, 0, 0).toISOString(),
          isClosed: true,
          goalPolicyId: "goal-1",
        },
        {
          id: 8,
          startTime: new Date(2026, 6, 2, 9, 0, 0, 0).toISOString(),
          endTime: new Date(2026, 6, 2, 15, 0, 0, 0).toISOString(),
          isClosed: false,
          goalPolicyId: null,
        },
      ],
      records: [
        {
          workdayId: 7,
          trip: {
            id: 101,
            startTime: new Date(2026, 5, 29, 8, 30, 0, 0).toISOString(),
            endTime: new Date(2026, 5, 29, 8, 45, 0, 0).toISOString(),
            amount: 14,
            chargedAmount: 14,
            cashTip: 0,
            source: "TAXI",
            payment: "CASH",
            serviceStatus: "completed",
          },
        },
        {
          workdayId: 8,
          trip: {
            id: 102,
            startTime: new Date(2026, 6, 2, 10, 0, 0, 0).toISOString(),
            endTime: new Date(2026, 6, 2, 10, 20, 0, 0).toISOString(),
            amount: 20,
            chargedAmount: 22,
            cashTip: 2,
            source: "UBER",
            payment: "CARD",
            serviceStatus: "completed",
          },
        },
      ],
      goalContext: {
        status: "mixed",
        reason: "multiple_policies",
        policies: [],
      },
    };

    return {
      ...dataset,
      ...overrides,
    };
  }

  it("exports the canonical historical dataset with a deterministic file name and matching record count", async () => {
    const dataset = buildDataset();

    const result = await ExportService.exportHistoricalDatasetToCSV(dataset as any);

    expect(result).toEqual({
      status: "exported",
      fileName: "GeoTaxi_Historial_2026-06-29_2026-07-05.csv",
      recordCount: 2,
    });
    expect(exportCsv).toHaveBeenCalledTimes(1);

    const [csv, fileName] = exportCsv.mock.calls[0];
    expect(fileName).toBe("GeoTaxi_Historial_2026-06-29_2026-07-05.csv");
    const lines = String(csv).trim().split("\n");
    expect(lines[0]).toBe(
      "trip_id,workday_id,workday_date,workday_start_at,trip_start_at,trip_end_at,amount,charged_amount,cash_tip,payment,source,service_status",
    );
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("101,7,2026-06-29");
    expect(lines[2]).toContain("102,8,2026-07-02");

    const numericTotal = lines.slice(1).reduce((accumulator, line) => {
      const parts = line.split(",");
      return accumulator + Number(parts[6] ?? 0);
    }, 0);

    expect(numericTotal).toBe(dataset.summary.total);
  });

  it("returns an empty result and does not generate a file when the selected period has no services", async () => {
    const dataset = buildDataset({
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
      records: [],
    });

    const result = await ExportService.exportHistoricalDatasetToCSV(dataset as any);

    expect(result).toEqual({
      status: "empty",
      fileName: "GeoTaxi_Historial_2026-06-29_2026-07-05.csv",
      recordCount: 0,
    });
    expect(exportCsv).not.toHaveBeenCalled();
  });

  it("escapes commas, quotes and line breaks in CSV cells", () => {
    expect(escapeCsvValue('hola')).toBe("hola");
    expect(escapeCsvValue('hola, taxi')).toBe('"hola, taxi"');
    expect(escapeCsvValue('dijo "sí"')).toBe('"dijo ""sí"""');
    expect(serializeCsvRow(["uno", "dos, tres", 'cuatro "cinco"', "seis\nsiete"])).toBe(
      'uno,"dos, tres","cuatro ""cinco""","seis\nsiete"\n',
    );
  });

  it("builds the month file name with year and month only", () => {
    const dataset = buildDataset({
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
    });

    expect(buildHistoricalExportFileName(dataset as any)).toBe("GeoTaxi_Historial_2026-07.csv");
  });

  it("builds the fortnight file name with year, month and half-month marker", () => {
    const firstFortnight = buildDataset({
      period: {
        periodType: "fortnight",
        startDate: new Date(2026, 6, 1, 0, 0, 0, 0),
        endDate: new Date(2026, 6, 15, 23, 59, 59, 999),
        label: "Quincena actual · 1 jul - 15 jul 2026",
        isCurrent: true,
        isEmpty: false,
        canNavigatePrevious: true,
        canNavigateNext: false,
        previousSelection: {
          periodType: "fortnight",
          anchorDate: new Date(2026, 5, 16, 12, 0, 0, 0),
        },
        nextSelection: null,
      },
    });

    const secondFortnight = buildDataset({
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
    });

    expect(buildHistoricalExportFileName(firstFortnight as any)).toBe(
      "GeoTaxi_Historial_2026-07_Q1.csv",
    );
    expect(buildHistoricalExportFileName(secondFortnight as any)).toBe(
      "GeoTaxi_Historial_2026-07_Q2.csv",
    );
  });

  it("builds the year file name with the calendar year only", () => {
    const dataset = buildDataset({
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
    });

    expect(buildHistoricalExportFileName(dataset as any)).toBe("GeoTaxi_Historial_2026.csv");
  });
});
