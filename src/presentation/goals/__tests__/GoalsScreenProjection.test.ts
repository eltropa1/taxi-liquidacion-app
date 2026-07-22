import {
  formatGoalFieldValue,
  formatGoalPolicyDate,
  formatGoalPolicySummary,
  sortGoalPoliciesDescending,
} from "../GoalsScreenProjection";

describe("GoalsScreenProjection", () => {
  it("formats policies and keeps the newest version first", () => {
    const sorted = sortGoalPoliciesDescending([
      {
        id: "goal-1",
        effectiveAt: "2026-07-01T08:00:00.000Z",
        goals: { daily: 140, weekly: 900, monthly: 3500 },
      },
      {
        id: "goal-2",
        effectiveAt: "2026-07-22T08:00:00.000Z",
        goals: { daily: 150, weekly: 1000, monthly: 4000 },
      },
    ]);

    expect(sorted.map((policy) => policy.id)).toEqual(["goal-2", "goal-1"]);
    expect(formatGoalPolicyDate("2026-07-22T08:00:00.000Z")).toBe("22 jul 2026");
    expect(
      formatGoalPolicySummary({
        daily: 150,
        weekly: 1000,
        monthly: 4000,
      }),
    ).toBe("150 € día · 1.000 € semana · 4.000 € mes");
    expect(formatGoalFieldValue(0)).toBe("0");
    expect(formatGoalFieldValue(undefined)).toBe("");
  });
});
