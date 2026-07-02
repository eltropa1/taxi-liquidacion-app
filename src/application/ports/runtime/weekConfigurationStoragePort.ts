import type { WeekStartDay } from "../../../domain/date-time";

export type WeekConfigurationState = Readonly<{
  weekStartDay: WeekStartDay;
}>;

export interface WeekConfigurationStoragePort {
  getWeekConfiguration(): Promise<WeekConfigurationState>;
  saveWeekConfiguration(configuration: WeekConfigurationState): Promise<void>;
}

