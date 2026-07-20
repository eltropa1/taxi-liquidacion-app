import {
  configureApplicationPersistence,
  resetApplicationPersistence,
} from "../../ports/persistence";
import {
  configureApplicationRuntime,
  resetApplicationRuntime,
} from "../applicationRuntime";
import { ExportService } from "../ExportService";
import { PaymentType, TripSource } from "../../../constants/enums";

describe("ExportService", () => {
  const persistence = {
    tripRepository: {
      findAllTripsForExport: jest.fn(),
      findTripsForWorkday: jest.fn(),
    },
    workdayRepository: {
      findWorkdayIdsBetweenDates: jest.fn(),
      getOpenWorkday: jest.fn(),
    },
  };

  const exportCsv = jest.fn();

  beforeEach(() => {
    configureApplicationPersistence(persistence as any);
    configureApplicationRuntime({
      goalStorage: {
        getGoals: jest.fn(),
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
    resetApplicationPersistence();
    resetApplicationRuntime();
    jest.clearAllMocks();
  });

  it("exports only the trips of the requested workday in chronological order", async () => {
    persistence.tripRepository.findTripsForWorkday.mockResolvedValue([
      {
        startTime: "2026-07-20T10:00:00.000Z",
        endTime: "2026-07-20T10:15:00.000Z",
        amount: 12,
        payment: PaymentType.CARD,
        source: TripSource.UBER,
      },
      {
        startTime: "2026-07-20T08:00:00.000Z",
        endTime: "2026-07-20T08:12:00.000Z",
        amount: 10,
        payment: PaymentType.CASH,
        source: TripSource.TAXI,
      },
    ]);

    await ExportService.exportWorkdayTripsToCSV(9);

    expect(persistence.tripRepository.findTripsForWorkday).toHaveBeenCalledWith(9);
    expect(persistence.tripRepository.findAllTripsForExport).not.toHaveBeenCalled();
    expect(exportCsv).toHaveBeenCalledTimes(1);
    const csv = exportCsv.mock.calls[0][0] as string;
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("fecha_inicio,hora_inicio,hora_fin,importe,pago,tipo");
    expect(lines[1]).toContain("TAXI");
    expect(lines[2]).toContain("UBER");
  });
});
