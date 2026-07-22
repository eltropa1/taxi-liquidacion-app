import {
  configureApplicationRuntime,
  resetApplicationRuntime,
} from "../../application/runtime/applicationRuntime";
import { loadGoalsScreenData, saveGoalsScreenData } from "../goalsScreenLoaders";

describe("goalsScreenLoaders", () => {
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

  it("loads the current policy and returns history sorted from newest to oldest", async () => {
    goalStorage.getCurrentGoalPolicy.mockResolvedValueOnce({
      id: "goal-2",
      effectiveAt: "2026-07-22T08:00:00.000Z",
      goals: { daily: 150, weekly: 1000, monthly: 4000 },
    });
    goalStorage.getGoalHistory.mockResolvedValueOnce([
      {
        id: "goal-1",
        effectiveAt: "2026-07-01T08:00:00.000Z",
        goals: { daily: 140, weekly: 900, monthly: 3500 },
      },
      {
        id: "goal-2",
        effectiveAt: "2026-07-22T08:00:00.000Z",
        goals: { daily: 150, weekly: 1000, monthly: 4000 },
      },
    ]);

    await expect(loadGoalsScreenData()).resolves.toEqual({
      currentPolicy: {
        id: "goal-2",
        effectiveAt: "2026-07-22T08:00:00.000Z",
        goals: { daily: 150, weekly: 1000, monthly: 4000 },
      },
      goalHistory: [
        {
          id: "goal-2",
          effectiveAt: "2026-07-22T08:00:00.000Z",
          goals: { daily: 150, weekly: 1000, monthly: 4000 },
        },
        {
          id: "goal-1",
          effectiveAt: "2026-07-01T08:00:00.000Z",
          goals: { daily: 140, weekly: 900, monthly: 3500 },
        },
      ],
    });
  });

  it("saves a new version and reloads the current policy snapshot", async () => {
    goalStorage.getCurrentGoalPolicy.mockResolvedValueOnce({
      id: "goal-3",
      effectiveAt: "2026-07-23T08:00:00.000Z",
      goals: { daily: 160, weekly: 1100, monthly: 4200 },
    });
    goalStorage.getGoalHistory.mockResolvedValueOnce([
      {
        id: "goal-3",
        effectiveAt: "2026-07-23T08:00:00.000Z",
        goals: { daily: 160, weekly: 1100, monthly: 4200 },
      },
    ]);

    await expect(
      saveGoalsScreenData({ daily: 160, weekly: 1100, monthly: 4200 }),
    ).resolves.toEqual({
      currentPolicy: {
        id: "goal-3",
        effectiveAt: "2026-07-23T08:00:00.000Z",
        goals: { daily: 160, weekly: 1100, monthly: 4200 },
      },
      goalHistory: [
        {
          id: "goal-3",
          effectiveAt: "2026-07-23T08:00:00.000Z",
          goals: { daily: 160, weekly: 1100, monthly: 4200 },
        },
      ],
    });

    expect(goalStorage.saveGoals).toHaveBeenCalledWith({
      daily: 160,
      weekly: 1100,
      monthly: 4200,
    });
  });
});
