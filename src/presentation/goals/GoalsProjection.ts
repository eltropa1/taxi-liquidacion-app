export type GoalsDraft = Readonly<{
  daily: string;
  weekly: string;
  monthly: string;
}>;

export function formatGoalValue(value: number | null | undefined) {
  if (!value) return "";
  return String(value);
}

export function parseGoalValue(value: string) {
  return Number(value.replace(",", ".")) || 0;
}
