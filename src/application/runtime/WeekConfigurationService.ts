import { getApplicationRuntime } from "./applicationRuntime";
import type { WeekConfigurationState } from "../ports/runtime";
import type { WeekStartDay } from "../../domain/date-time";

export class WeekConfigurationService {
  static async getWeekConfiguration(): Promise<WeekConfigurationState> {
    return getApplicationRuntime().weekConfigurationStorage.getWeekConfiguration();
  }

  static async saveWeekConfiguration(
    configuration: WeekConfigurationState,
  ): Promise<void> {
    await getApplicationRuntime().weekConfigurationStorage.saveWeekConfiguration(
      configuration,
    );
  }

  static async getWeekStartDay(): Promise<WeekStartDay> {
    const configuration = await this.getWeekConfiguration();
    return configuration.weekStartDay;
  }
}
