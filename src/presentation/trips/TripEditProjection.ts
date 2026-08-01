import { NEIGHBORHOODS_CATALOG } from "../../infrastructure/geocoding/catalog/neighborhoods.catalog";
import { SPECIAL_ZONES_CATALOG } from "../../infrastructure/geocoding/catalog/specialZones.catalog";
import { MUNICIPALITIES_CATALOG } from "../../infrastructure/geocoding/catalog/municipalities.catalog";

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
  municipality?: Readonly<{ id: string; name: string }> | null;
}>;

/**
 * Etiqueta a mostrar para una ubicación GEO detectada.
 *
 * La zona especial (aeropuerto, estación...) es más útil para el
 * taxista que el barrio que la contiene, así que tiene prioridad. El
 * municipio solo aparece cuando el punto cae fuera de la capital (el
 * motor no resuelve barrio/distrito ahí).
 */
export function resolveGeoZoneLabel(
  snapshot: TripEditGeoSnapshot | null | undefined,
): string {
  if (!snapshot) return "—";
  return (
    snapshot.specialZone?.name ??
    snapshot.neighborhood?.name ??
    snapshot.district?.name ??
    snapshot.municipality?.name ??
    "—"
  );
}

/**
 * Nombre efectivo de una zona manual (barrio, zona especial o
 * municipio) o, en su defecto, de la zona GEO detectada
 * automáticamente. La corrección manual permite elegir cualquiera de
 * los tres, así que se busca en los tres catálogos.
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
  if (specialZone) return specialZone.name;

  const municipality = MUNICIPALITIES_CATALOG.find((m) => m.id === id);
  return municipality ? municipality.name : "—";
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
