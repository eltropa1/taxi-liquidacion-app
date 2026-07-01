import {
  configureApplicationPersistence,
  resetApplicationPersistence,
} from "../../ports/persistence";
import { CloseWorkday } from "../CloseWorkday";
import { OpenWorkday } from "../OpenWorkday";

describe("Workday actions characterization", () => {
  const persistence = {
    tripRepository: {} as any,
    workdayRepository: {
      getOpenWorkday: jest.fn(),
      openWorkdayIfNeeded: jest.fn(),
      openWorkday: jest.fn(),
      closeCurrentWorkday: jest.fn(),
      getWorkdayForDate: jest.fn(),
      getWorkdayInfoForDate: jest.fn(),
      assignTripToCurrentWorkday: jest.fn(),
    },
    tripGeoSnapshotRepository: {} as any,
  };

  beforeEach(() => {
    configureApplicationPersistence(persistence as any);
  });

  afterEach(() => {
    resetApplicationPersistence();
    jest.clearAllMocks();
  });

  it("opens a workday by delegating to the official repository port", async () => {
    await OpenWorkday.execute();

    expect(persistence.workdayRepository.openWorkday).toHaveBeenCalledTimes(1);
  });

  it("closes every open workday in the current runtime state", async () => {
    await CloseWorkday.execute();

    expect(persistence.workdayRepository.closeCurrentWorkday).toHaveBeenCalledTimes(
      1,
    );
  });
});
