import { NEIGHBORHOODS_CATALOG } from "../../infrastructure/geocoding/catalog/neighborhoods.catalog";
import { SPECIAL_ZONES_CATALOG } from "../../infrastructure/geocoding/catalog/specialZones.catalog";

export type TripEditNeighborhoodSnapshot = Readonly<{
  neighborhood?: Readonly<{
    id: string;
    name: string;
  }> | null;
}>;

export type TripEditGeoSnapshot = Readonly<{
  neighborhood?: Readonly<{ id: string; name: string }> | null;
  district?: Readonly<{ id: string; name: string }> | null;
  specialZone?: Readonly<{ id: string; name: string }> | null;
}>;

/**
 * Etiqueta a mostrar para una ubicación GEO detectada.
 *
 * La zona especial (aeropuerto, estación...) es más útil para el
 * taxista que el barrio que la contiene, así que tiene prioridad.
 */
export function resolveGeoZoneLabel(
  snapshot: TripEditGeoSnapshot | null | undefined,
): string {
  if (!snapshot) return "—";
  return (
    snapshot.specialZone?.name ??
    snapshot.neighborhood?.name ??
    snapshot.district?.name ??
    "—"
  );
}

/**
 * Nombre efectivo de una zona manual (barrio o zona especial) o, en su
 * defecto, de la zona GEO detectada automáticamente. La corrección
 * manual permite elegir tanto un barrio como una zona especial (p. ej.
 * "Aeropuerto T4 / T4S"), así que se busca en ambos catálogos.
 */
export function resolveEffectiveNeighborhoodName(
  manualId: string | null,
  geoId: string | null,
) {
  const id = manualId ?? geoId;
  if (!id) return "—";

  const neighborhood = NEIGHBORHOODS_CATALOG.find((n) => n.id === id);
  if (neighborhood) return neighborhood.name;

  const specialZone = SPECIAL_ZONES_CATALOG.find((z) => z.id === id);
  return specialZone ? specialZone.name : "—";
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
