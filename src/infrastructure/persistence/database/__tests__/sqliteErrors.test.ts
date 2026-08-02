import { isUniqueConstraintViolation } from "../sqliteErrors";

describe("isUniqueConstraintViolation", () => {
  it("detects a SQLite unique constraint error", () => {
    expect(
      isUniqueConstraintViolation(
        new Error("UNIQUE constraint failed: index 'idx_workdays_single_open'"),
      ),
    ).toBe(true);
  });

  it("does not flag unrelated errors", () => {
    expect(isUniqueConstraintViolation(new Error("disk I/O error"))).toBe(false);
    expect(isUniqueConstraintViolation("not an error")).toBe(false);
    expect(isUniqueConstraintViolation(null)).toBe(false);
  });
});
