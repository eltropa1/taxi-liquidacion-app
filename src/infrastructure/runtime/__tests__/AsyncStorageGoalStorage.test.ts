import AsyncStorage from "@react-native-async-storage/async-storage";
import { AsyncStorageGoalStorage } from "../AsyncStorageGoalStorage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("AsyncStorageGoalStorage", () => {
  const clock = {
    now: jest.fn(() => new Date()),
  };

  let storedValue: string | null;

  function seedStorage(value: string | null) {
    storedValue = value;
    mockedAsyncStorage.getItem.mockImplementation(async () => storedValue);
    mockedAsyncStorage.setItem.mockImplementation(async (_key, nextValue) => {
      storedValue = nextValue;
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    seedStorage(null);
    clock.now.mockReset();
  });

  it("returns default goals and unknown historical data when empty", async () => {
    const storage = new AsyncStorageGoalStorage(clock);

    await expect(storage.getGoals()).resolves.toEqual({
      daily: 0,
      weekly: 0,
      monthly: 0,
    });
    await expect(
      storage.getGoalsAt(new Date("2026-07-21T10:00:00.000Z")),
    ).resolves.toBeNull();
    await expect(storage.getCurrentGoalPolicy()).resolves.toBeNull();
    await expect(storage.getGoalHistory()).resolves.toEqual([]);
    await expect(storage.getGoalPolicyById("goal-1")).resolves.toBeNull();
    expect(mockedAsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("keeps a legacy snapshot as the first known policy without inventing earlier history", async () => {
    const migrationMoment = new Date("2026-07-21T10:00:00.000Z");
    clock.now.mockReturnValue(migrationMoment);
    seedStorage(JSON.stringify({ daily: 250, weekly: 500, monthly: 900 }));

    const storage = new AsyncStorageGoalStorage(clock);

    await expect(storage.getGoals()).resolves.toEqual({
      daily: 250,
      weekly: 500,
      monthly: 900,
    });
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      "taxi_goals",
      JSON.stringify({
        schemaVersion: 2,
        nextPolicySequence: 2,
        policies: [
          {
            id: "goal-1",
            effectiveAt: migrationMoment.toISOString(),
            goals: { daily: 250, weekly: 500, monthly: 900 },
          },
        ],
      }),
    );

    await expect(
      storage.getGoalsAt(new Date("2026-07-21T09:59:59.999Z")),
    ).resolves.toBeNull();
    await expect(
      storage.getGoalsAt(new Date("2026-07-21T10:00:00.000Z")),
    ).resolves.toEqual({
      daily: 250,
      weekly: 500,
      monthly: 900,
    });
    await expect(storage.getCurrentGoalPolicy()).resolves.toEqual({
      id: "goal-1",
      effectiveAt: migrationMoment.toISOString(),
      goals: { daily: 250, weekly: 500, monthly: 900 },
    });
    await expect(storage.getGoalPolicyById("goal-1")).resolves.toEqual({
      id: "goal-1",
      effectiveAt: migrationMoment.toISOString(),
      goals: { daily: 250, weekly: 500, monthly: 900 },
    });
  });

  it("appends goal policies and resolves the correct policy for each historical reference", async () => {
    const timeline = [
      new Date("2026-04-01T08:00:00.000Z"),
      new Date("2026-04-15T08:00:00.000Z"),
      new Date("2026-07-01T08:00:00.000Z"),
    ];

    clock.now.mockReturnValueOnce(timeline[0]);
    seedStorage(null);

    const storage = new AsyncStorageGoalStorage(clock);

    await storage.saveGoals({ daily: 250, weekly: 1200, monthly: 4000 });
    clock.now.mockReturnValueOnce(timeline[1]);
    await storage.saveGoals({ daily: 300, weekly: 1300, monthly: 4200 });
    clock.now.mockReturnValueOnce(timeline[2]);
    await storage.saveGoals({ daily: 325, weekly: 1400, monthly: 4400 });

    await expect(storage.getGoals()).resolves.toEqual({
      daily: 325,
      weekly: 1400,
      monthly: 4400,
    });

    await expect(
      storage.getGoalsAt(new Date("2026-04-10T12:00:00.000Z")),
    ).resolves.toEqual({
      daily: 250,
      weekly: 1200,
      monthly: 4000,
    });
    await expect(
      storage.getGoalsAt(new Date("2026-04-15T08:00:00.000Z")),
    ).resolves.toEqual({
      daily: 300,
      weekly: 1300,
      monthly: 4200,
    });
    await expect(
      storage.getGoalsAt(new Date("2026-07-15T08:00:00.000Z")),
    ).resolves.toEqual({
      daily: 325,
      weekly: 1400,
      monthly: 4400,
    });

    await expect(storage.getGoalHistory()).resolves.toEqual([
      {
        id: "goal-1",
        effectiveAt: timeline[0].toISOString(),
        goals: { daily: 250, weekly: 1200, monthly: 4000 },
      },
      {
        id: "goal-2",
        effectiveAt: timeline[1].toISOString(),
        goals: { daily: 300, weekly: 1300, monthly: 4200 },
      },
      {
        id: "goal-3",
        effectiveAt: timeline[2].toISOString(),
        goals: { daily: 325, weekly: 1400, monthly: 4400 },
      },
    ]);
    await expect(storage.getCurrentGoalPolicy()).resolves.toEqual({
      id: "goal-3",
      effectiveAt: timeline[2].toISOString(),
      goals: { daily: 325, weekly: 1400, monthly: 4400 },
    });
    await expect(storage.getGoalPolicyById("goal-2")).resolves.toEqual({
      id: "goal-2",
      effectiveAt: timeline[1].toISOString(),
      goals: { daily: 300, weekly: 1300, monthly: 4200 },
    });
  });

  it("migrates only once and reuses the versioned envelope on subsequent reads", async () => {
    const migrationMoment = new Date("2026-07-21T10:00:00.000Z");
    clock.now.mockReturnValue(migrationMoment);
    seedStorage(JSON.stringify({ daily: 180, weekly: 900, monthly: 3000 }));

    const storage = new AsyncStorageGoalStorage(clock);

    await storage.getGoals();
    await storage.getGoals();

    expect(mockedAsyncStorage.setItem).toHaveBeenCalledTimes(1);
    expect(storedValue).toBe(
      JSON.stringify({
        schemaVersion: 2,
        nextPolicySequence: 2,
        policies: [
          {
            id: "goal-1",
            effectiveAt: migrationMoment.toISOString(),
            goals: { daily: 180, weekly: 900, monthly: 3000 },
          },
        ],
      }),
    );
  });
});
