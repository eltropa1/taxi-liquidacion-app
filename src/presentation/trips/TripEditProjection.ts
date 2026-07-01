import { NEIGHBORHOODS_CATALOG } from "../../infrastructure/geocoding/catalog/neighborhoods.catalog";

export type TripEditNeighborhoodSnapshot = Readonly<{
  neighborhood?: Readonly<{
    id: string;
    name: string;
  }> | null;
}>;

export function resolveEffectiveNeighborhoodName(
  manualId: string | null,
  geoId: string | null,
) {
  const id = manualId ?? geoId;
  if (!id) return "—";

  const found = NEIGHBORHOODS_CATALOG.find((n) => n.id === id);
  return found ? found.name : "—";
}

export function resolveTripEditClock(value: string) {
  const date = new Date(value);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function resolveTripEditSnapshotZones(
  snapshots: readonly {
    kind: "START" | "END";
    snapshot: TripEditNeighborhoodSnapshot;
  }[],
) {
  const startSnapshot = snapshots.find((s) => s.kind === "START");
  const endSnapshot = snapshots.find((s) => s.kind === "END");

  return {
    geoPickupZone: startSnapshot?.snapshot?.neighborhood?.id ?? null,
    geoDropoffZone: endSnapshot?.snapshot?.neighborhood?.id ?? null,
  };
}
