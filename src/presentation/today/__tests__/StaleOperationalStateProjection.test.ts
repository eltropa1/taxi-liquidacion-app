import { resolveStaleOperationalState } from "../StaleOperationalStateProjection";

describe("resolveStaleOperationalState", () => {
  const now = new Date(2026, 6, 2, 9, 0, 0, 0);

  it("flags a trip started on a previous calendar day as stale", () => {
    const result = resolveStaleOperationalState({
      activeTrip: { id: 5, startTime: new Date(2026, 6, 1, 23, 50, 0, 0).toISOString() },
      activeWorkday: null,
      now,
    });

    expect(result.staleTrip).toEqual({
      id: 5,
      startTime: new Date(2026, 6, 1, 23, 50, 0, 0).toISOString(),
    });
    expect(result.staleWorkday).toBeNull();
  });

  it("does not flag a trip started earlier today", () => {
    const result = resolveStaleOperationalState({
      activeTrip: { id: 5, startTime: new Date(2026, 6, 2, 7, 0, 0, 0).toISOString() },
      activeWorkday: null,
      now,
    });

    expect(result.staleTrip).toBeNull();
  });

  it("flags a workday opened on a previous calendar day as stale", () => {
    const result = resolveStaleOperationalState({
      activeTrip: null,
      activeWorkday: {
        id: 9,
        startTime: new Date(2026, 5, 30, 6, 0, 0, 0).toISOString(),
      },
      now,
    });

    expect(result.staleWorkday).toEqual({
      id: 9,
      startTime: new Date(2026, 5, 30, 6, 0, 0, 0).toISOString(),
    });
    expect(result.staleTrip).toBeNull();
  });

  it("returns nulls when there is nothing active", () => {
    const result = resolveStaleOperationalState({
      activeTrip: null,
      activeWorkday: null,
      now,
    });

    expect(result).toEqual({ staleTrip: null, staleWorkday: null });
  });
});
