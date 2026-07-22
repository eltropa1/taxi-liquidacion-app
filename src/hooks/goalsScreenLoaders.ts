import { GoalService } from "../application/runtime";
import type { GoalPolicy, GoalsState } from "../application/ports/runtime";
import { sortGoalPoliciesDescending } from "../presentation/goals/GoalsScreenProjection";

export type GoalsScreenData = Readonly<{
  currentPolicy: GoalPolicy | null;
  goalHistory: readonly GoalPolicy[];
}>;

export async function loadGoalsScreenData(): Promise<GoalsScreenData> {
  const [currentPolicy, goalHistory] = await Promise.all([
    GoalService.getCurrentGoalPolicy(),
    GoalService.getGoalHistory(),
  ]);

  return {
    currentPolicy,
    goalHistory: sortGoalPoliciesDescending(goalHistory),
  };
}

export async function saveGoalsScreenData(goals: GoalsState): Promise<GoalsScreenData> {
  await GoalService.saveGoals(goals);
  return loadGoalsScreenData();
}
