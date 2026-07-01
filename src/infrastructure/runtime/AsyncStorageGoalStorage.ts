import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GoalStoragePort, GoalsState } from "../../application/ports/runtime";

const STORAGE_KEY = "taxi_goals";

export class AsyncStorageGoalStorage implements GoalStoragePort {
  async getGoals(): Promise<GoalsState> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { daily: 0, weekly: 0, monthly: 0 };
    }

    return JSON.parse(raw) as GoalsState;
  }

  async saveGoals(goals: GoalsState): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }
}
