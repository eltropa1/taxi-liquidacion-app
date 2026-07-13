import {
  resolveEffectiveNeighborhoodName,
  resolveTripEditClock,
  resolveTripEditSnapshotZones,
} from "../TripEditProjection";

describe("TripEditProjection", () => {
  it("resolves neighborhood names and clocks for the edit screen", () => {
    expect(resolveEffectiveNeighborhoodName("016", null)).toBe("Sol");
    const localTripTime = new Date(2026, 6, 1, 9, 5, 0, 0).toISOString();
    expect(resolveTripEditClock(localTripTime)).toBe("09:05");
    expect(
      resolveTripEditSnapshotZones([
        {
          kind: "START",
          snapshot: { neighborhood: { id: "016", name: "Sol" } },
        },
        {
          kind: "END",
          snapshot: { neighborhood: { id: "014", name: "Embajadores" } },
        },
      ]),
    ).toEqual({
      geoPickupZone: "016",
      geoDropoffZone: "014",
    });
  });
});
