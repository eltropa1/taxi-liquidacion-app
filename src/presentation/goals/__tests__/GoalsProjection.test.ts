import { formatGoalValue, parseGoalValue } from "../GoalsProjection";

describe("GoalsProjection", () => {
  it("formats and parses goal inputs", () => {
    expect(formatGoalValue(12)).toBe("12");
    expect(formatGoalValue(0)).toBe("0");
    expect(parseGoalValue("12,5")).toBe(12.5);
    expect(parseGoalValue("")).toBe(0);
  });
});
