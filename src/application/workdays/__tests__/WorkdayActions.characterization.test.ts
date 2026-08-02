import {
  configureApplicationPersistence,
  resetApplicationPersistence,
} from "../../ports/persistence";
import {
  configureApplicationRuntime,
  resetApplicationRuntime,
} from "../../runtime";
import { CloseWorkday } from "../CloseWorkday";
import { OpenWorkday } from "../OpenWorkday";

describe("Workday actions characterization", () => {
  const persistence = {
    tripRepository: {} as any,
    workdayRepository: {
      getOpenWorkday: jest.fn(),
      openWorkdayIfNeeded: jest.fn(),
      getMostRecentWorkday: jest.fn(),
      openWorkday: jest.fn(),
      closeCurrentWorkday: jest.fn(),
      updateWorkdayOdometers: jest.fn(),
      setEndOdometerIfMissing: jest.fn(),
      getWorkdayForDate: jest.fn(),
      getWorkdayInfoForDate: jest.fn(),
      assignTripToCurrentWorkday: jest.fn(),
    },
    tripGeoSnapshotRepository: {} as any,
  };

  const runtime = {
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
    tripCsvExporter: {} as any,
  };

  beforeEach(() => {
    configureApplicationPersistence(persistence as any);
    configureApplicationRuntime(runtime as any);
  });

  afterEach(() => {
    resetApplicationPersistence();
    resetApplicationRuntime();
    jest.clearAllMocks();
  });

  it("refuses to open a new workday while the previous one is still open", async () => {
    persistence.workdayRepository.getMostRecentWorkday.mockResolvedValue({
      id: 12,
      startTime: "2026-07-01T07:00:00.000Z",
      endTime: null,
      startOdometer: 1000,
      endOdometer: null,
      isClosed: false,
      createdAt: "2026-07-01T07:00:00.000Z",
    });

    await expect(OpenWorkday.execute(1234)).rejects.toThrow(
      /ya tienes una jornada abierta/i,
    );

    expect(persistence.workdayRepository.setEndOdometerIfMissing).not.toHaveBeenCalled();
    expect(persistence.workdayRepository.openWorkday).not.toHaveBeenCalled();
  });

  it("does not backfill a previous workday that already has an odometer", async () => {
    persistence.workdayRepository.getMostRecentWorkday.mockResolvedValue({
      id: 12,
      startTime: "2026-07-01T07:00:00.000Z",
      endTime: "2026-07-01T08:30:00.000Z",
      startOdometer: 1000,
      endOdometer: 1100,
      isClosed: true,
      createdAt: "2026-07-01T07:00:00.000Z",
    });

    await OpenWorkday.execute(1234);

    expect(persistence.workdayRepository.setEndOdometerIfMissing).not.toHaveBeenCalled();
    expect(persistence.workdayRepository.openWorkday).toHaveBeenCalledWith(1234);
  });

  it("closes the current workday with the optional odometer", async () => {
    runtime.goalStorage.getCurrentGoalPolicy.mockResolvedValueOnce({
      id: "goal-2",
      effectiveAt: "2026-07-20T10:00:00.000Z",
      goals: { daily: 350, weekly: 1300, monthly: 4200 },
    });

    await CloseWorkday.execute(1300);

    expect(persistence.workdayRepository.closeCurrentWorkday).toHaveBeenCalledTimes(
      1,
    );
    expect(persistence.workdayRepository.closeCurrentWorkday).toHaveBeenCalledWith(
      1300,
      "goal-2",
    );
  });
});
