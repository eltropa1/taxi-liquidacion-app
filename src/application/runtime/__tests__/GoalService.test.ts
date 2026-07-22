import {
  configureApplicationRuntime,
  resetApplicationRuntime,
} from "../applicationRuntime";
import { GoalService } from "../GoalService";

describe("GoalService", () => {
  const goalStorage = {
    getGoals: jest.fn(),
    getCurrentGoalPolicy: jest.fn(),
    getGoalsAt: jest.fn(),
    getGoalHistory: jest.fn(),
    getGoalPolicyById: jest.fn(),
    saveGoals: jest.fn(),
  };

  beforeEach(() => {
    configureApplicationRuntime({
      goalStorage,
      weekConfigurationStorage: {
        getWeekConfiguration: jest.fn(),
        saveWeekConfiguration: jest.fn(),
      },
      geoLocation: {} as any,
      geoAdministrativeResolver: {} as any,
      tripCsvExporter: {} as any,
    });
  });

  afterEach(() => {
    resetApplicationRuntime();
    jest.clearAllMocks();
  });

  it("forwards historical lookups to the configured storage", async () => {
    const reference = new Date("2026-04-15T08:00:00.000Z");
    goalStorage.getGoalsAt.mockResolvedValueOnce({
      daily: 250,
      weekly: 1200,
      monthly: 4000,
    });

    await expect(GoalService.getGoalsAt(reference)).resolves.toEqual({
      daily: 250,
      weekly: 1200,
      monthly: 4000,
    });

    expect(goalStorage.getGoalsAt).toHaveBeenCalledWith(reference);
  });

  it("forwards the current goal policy to the configured storage", async () => {
    goalStorage.getCurrentGoalPolicy.mockResolvedValueOnce({
      id: "goal-3",
      effectiveAt: "2026-07-21T10:00:00.000Z",
      goals: { daily: 325, weekly: 1400, monthly: 4400 },
    });

    await expect(GoalService.getCurrentGoalPolicy()).resolves.toEqual({
      id: "goal-3",
      effectiveAt: "2026-07-21T10:00:00.000Z",
      goals: { daily: 325, weekly: 1400, monthly: 4400 },
    });

    expect(goalStorage.getCurrentGoalPolicy).toHaveBeenCalledTimes(1);
  });

  it("forwards the goal history log to the configured storage", async () => {
    goalStorage.getGoalHistory.mockResolvedValueOnce([
      {
        id: "goal-1",
        effectiveAt: "2026-04-01T08:00:00.000Z",
        goals: { daily: 250, weekly: 1200, monthly: 4000 },
      },
    ]);

    await expect(GoalService.getGoalHistory()).resolves.toEqual([
      {
        id: "goal-1",
        effectiveAt: "2026-04-01T08:00:00.000Z",
        goals: { daily: 250, weekly: 1200, monthly: 4000 },
      },
    ]);

    expect(goalStorage.getGoalHistory).toHaveBeenCalledTimes(1);
  });

  it("forwards lookup by policy id to the configured storage", async () => {
    goalStorage.getGoalPolicyById.mockResolvedValueOnce({
      id: "goal-2",
      effectiveAt: "2026-04-15T08:00:00.000Z",
      goals: { daily: 300, weekly: 1300, monthly: 4200 },
    });

    await expect(GoalService.getGoalPolicyById("goal-2")).resolves.toEqual({
      id: "goal-2",
      effectiveAt: "2026-04-15T08:00:00.000Z",
      goals: { daily: 300, weekly: 1300, monthly: 4200 },
    });

    expect(goalStorage.getGoalPolicyById).toHaveBeenCalledWith("goal-2");
  });
});
