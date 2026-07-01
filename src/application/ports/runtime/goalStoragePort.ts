export type GoalsState = Readonly<{
  daily: number;
  weekly: number;
  monthly: number;
}>;

export interface GoalStoragePort {
  getGoals(): Promise<GoalsState>;
  saveGoals(goals: GoalsState): Promise<void>;
}
