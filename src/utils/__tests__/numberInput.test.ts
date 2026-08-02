import { parseMoneyInput, parseOptionalMoneyInput } from "../numberInput";

describe("numberInput", () => {
  it.each([
    ["30,25", 30.25],
    ["30.25", 30.25],
    ["30,25 €", 30.25],
    ["30.25€", 30.25],
    ["1 234,56 €", 1234.56],
    ["1.234,56€", 1234.56],
    ["-12,5 €", -12.5],
  ])("parses %s as %s", (input, expected) => {
    expect(parseMoneyInput(input)).toBe(expected);
  });

  it.each(["", "   ", "30,25abc", "€"])("rejects invalid input %s", (input) => {
    expect(parseMoneyInput(input)).toBeNull();
  });

  it("returns undefined for blank optional money input", () => {
    expect(parseOptionalMoneyInput("   ")).toBeUndefined();
  });
});
