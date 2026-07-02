jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AsyncStorageWeekConfigurationStorage } from "../AsyncStorageWeekConfigurationStorage";

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("AsyncStorageWeekConfigurationStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns Monday by default when nothing is stored", async () => {
    mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

    const storage = new AsyncStorageWeekConfigurationStorage();
    const configuration = await storage.getWeekConfiguration();

    expect(configuration.weekStartDay).toBe("monday");
  });

  it("persists the selected week start day", async () => {
    const storage = new AsyncStorageWeekConfigurationStorage();

    await storage.saveWeekConfiguration({ weekStartDay: "saturday" });

    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      "taxi_week_configuration",
      JSON.stringify({ weekStartDay: "saturday" }),
    );
  });
});

