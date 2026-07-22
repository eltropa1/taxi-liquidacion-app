import { getApplicationRuntime } from "./applicationRuntime";
import type { GoalPolicy, GoalsState } from "../ports/runtime";

export class GoalService {
  static async getGoals(): Promise<GoalsState> {
    return getApplicationRuntime().goalStorage.getGoals();
  }

  static async getCurrentGoalPolicy(): Promise<GoalPolicy | null> {
    return getApplicationRuntime().goalStorage.getCurrentGoalPolicy();
  }

  static async getGoalsAt(reference: Date): Promise<GoalsState | null> {
    return getApplicationRuntime().goalStorage.getGoalsAt(reference);
  }

  static async getGoalHistory(): Promise<readonly GoalPolicy[]> {
    return getApplicationRuntime().goalStorage.getGoalHistory();
  }

  static async getGoalPolicyById(id: string): Promise<GoalPolicy | null> {
    return getApplicationRuntime().goalStorage.getGoalPolicyById(id);
  }

  static async saveGoals(goals: GoalsState): Promise<void> {
    await getApplicationRuntime().goalStorage.saveGoals(goals);
  }
}
