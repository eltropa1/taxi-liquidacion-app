import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  WeekConfigurationState,
  WeekConfigurationStoragePort,
} from "../../application/ports/runtime";
import { isWeekStartDay, type WeekStartDay } from "../../domain/date-time";

const STORAGE_KEY = "taxi_week_configuration";

const DEFAULT_CONFIGURATION: WeekConfigurationState = Object.freeze({
  weekStartDay: "monday",
});

function normalizeWeekStartDay(value: unknown): WeekStartDay {
  if (typeof value === "string" && isWeekStartDay(value)) {
    return value;
  }

  return DEFAULT_CONFIGURATION.weekStartDay;
}

export class AsyncStorageWeekConfigurationStorage
  implements WeekConfigurationStoragePort
{
  async getWeekConfiguration(): Promise<WeekConfigurationState> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_CONFIGURATION;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<WeekConfigurationState>;
      return {
        weekStartDay: normalizeWeekStartDay(parsed.weekStartDay),
      };
    } catch {
      return DEFAULT_CONFIGURATION;
    }
  }

  async saveWeekConfiguration(
    configuration: WeekConfigurationState,
  ): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configuration));
  }
}

