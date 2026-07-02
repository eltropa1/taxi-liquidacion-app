import { configureApplicationPersistence, resetApplicationPersistence } from "../../ports/persistence";
import { configureApplicationRuntime, resetApplicationRuntime } from "../applicationRuntime";
import { SummaryService } from "../SummaryService";

describe("SummaryService", () => {
  const persistence = {
    tripRepository: {
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

    expect(startDate).toEqual(new Date(2025, 11, 31, 0, 0, 0, 0));
    expect(endDate).toEqual(new Date(2026, 0, 6, 23, 59, 59, 999));
  });
});

