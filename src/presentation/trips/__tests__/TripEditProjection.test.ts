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

  it("resolves a manual special zone id even though it is not a neighborhood", () => {
    expect(resolveEffectiveNeighborhoodName("MAD_AIRPORT_T4", null)).toBe(
      "Aeropuerto T4 / T4S",
    );
  });

  it("falls back to the geo zone when there is no manual override, across catalogs", () => {
    expect(resolveEffectiveNeighborhoodName(null, "MAD_CHAMARTIN")).toBe(
      "Estación de Chamartín",
    );
    expect(resolveEffectiveNeighborhoodName(null, "unknown-id")).toBe("—");
  });
});
