import type { GoalPolicy, GoalsState } from "../../application/ports/runtime";

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatGoalMoney(value: number) {
  const absoluteValue = Math.abs(value);
  const rawValue = Number.isInteger(absoluteValue)
    ? String(absoluteValue)
    : absoluteValue.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  const [integerPart, fractionalPart] = rawValue.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const signedPrefix = value < 0 ? "-" : "";

  return fractionalPart
    ? `${signedPrefix}${groupedInteger},${fractionalPart} €`
    : `${signedPrefix}${groupedInteger} €`;
}

export function formatGoalPolicyDate(effectiveAt: string) {
  return capitalize(
    new Date(effectiveAt).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  );
}

export function formatGoalPolicySummary(goals: GoalsState) {
  return `${formatGoalMoney(goals.daily)} día · ${formatGoalMoney(
    goals.weekly,
  )} semana · ${formatGoalMoney(goals.monthly)} mes`;
}

export function sortGoalPoliciesDescending(
  policies: readonly GoalPolicy[],
): GoalPolicy[] {
  return [...policies].sort((left, right) => {
    const leftTime = Date.parse(left.effectiveAt);
    const rightTime = Date.parse(right.effectiveAt);

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return right.id.localeCompare(left.id);
  });
}

export function formatGoalFieldValue(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
