import { getApplicationRuntime } from "./applicationRuntime";
import type { GoalsState } from "../ports/runtime";

export class GoalService {
  static async getGoals(): Promise<GoalsState> {
    return getApplicationRuntime().goalStorage.getGoals();
  }

  static async saveGoals(goals: GoalsState): Promise<void> {
    await getApplicationRuntime().goalStorage.saveGoals(goals);
  }
}
