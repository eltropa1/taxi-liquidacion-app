import { createAppRuntime } from "../createAppRuntime";
import { initializePersistence } from "../../persistence/initializePersistence";
import { TripSource } from "../../../constants/enums";

jest.mock("../../persistence/initializePersistence", () => ({
  initializePersistence: jest.fn(),
}));

jest.mock("../../../infrastructure/runtime", () => ({
  AsyncStorageGoalStorage: class {
    getGoals = jest.fn();
    saveGoals = jest.fn();
  },
  AsyncStorageWeekConfigurationStorage: class {
    getWeekConfiguration = jest.fn();
    saveWeekConfiguration = jest.fn();
  },
  ExpoGeoLocationPort: class {
    getCurrentLocation = jest.fn();
  },
  ExpoTripCsvExporter: class {
    exportCsv = jest.fn();
  },
  GeoAdministrativeResolverAdapter: class {
    resolve = jest.fn();
  },
}));

const mockedInitializePersistence =
  initializePersistence as jest.MockedFunction<typeof initializePersistence>;

describe("createAppRuntime", () => {
  it("initializes persistence once and exposes the composed repositories", async () => {
    const db = {
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 27 }),
      getFirstAsync: jest.fn().mockResolvedValue(null),
      getAllAsync: jest.fn().mockResolvedValue([]),
      execAsync: jest.fn().mockResolvedValue(undefined),
    };

    mockedInitializePersistence.mockResolvedValue(db as any);

    const runtime = await createAppRuntime();

    expect(mockedInitializePersistence).toHaveBeenCalledTimes(1);
    expect(runtime.initializedAt).toEqual(expect.any(String));
    expect(runtime.persistence.tripRepository).toBeDefined();
    expect(runtime.persistence.workdayRepository).toBeDefined();
    expect(runtime.persistence.tripGeoSnapshotRepository).toBeDefined();

    await runtime.persistence.tripRepository.createStartedTrip({
      startedAt: new Date("2026-07-01T08:00:00.000Z"),
      workdayId: 3,
      source: TripSource.TAXI,
    });

    expect(db.runAsync).toHaveBeenCalledTimes(1);
  });
});
