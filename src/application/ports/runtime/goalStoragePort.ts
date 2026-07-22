export type GoalsState = Readonly<{
  daily: number;
  weekly: number;
  monthly: number;
}>;

export type GoalPolicy = Readonly<{
  id: string;
  effectiveAt: string;
  goals: GoalsState;
}>;

export interface GoalStoragePort {
  getGoals(): Promise<GoalsState>;
  getCurrentGoalPolicy(): Promise<GoalPolicy | null>;
  getGoalsAt(reference: Date): Promise<GoalsState | null>;
  getGoalHistory(): Promise<readonly GoalPolicy[]>;
  getGoalPolicyById(id: string): Promise<GoalPolicy | null>;
  saveGoals(goals: GoalsState): Promise<void>;
}
