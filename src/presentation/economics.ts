import type { TripVisualProjection } from "./trips";

export type EconomicDrilldownGroup = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  count: number;
  amount: number;
  trips: readonly TripVisualProjection[];
}>;

export function groupTripsByKey(
  trips: readonly TripVisualProjection[],
  getKey: (trip: TripVisualProjection) => string,
  getTitle: (key: string, trips: readonly TripVisualProjection[]) => string,
  getSubtitle: (trips: readonly TripVisualProjection[]) => string,
): EconomicDrilldownGroup[] {
  const map = new Map<string, TripVisualProjection[]>();

  for (const trip of trips) {
    const key = getKey(trip);
    const bucket = map.get(key);

    if (bucket) {
      bucket.push(trip);
    } else {
      map.set(key, [trip]);
    }
  }

  return [...map.entries()].map(([key, groupedTrips]) => ({
    id: key,
    title: getTitle(key, groupedTrips),
    subtitle: getSubtitle(groupedTrips),
    count: groupedTrips.length,
    amount: groupedTrips.reduce((accumulator, trip) => accumulator + (trip.amount.value ?? 0), 0),
    trips: groupedTrips,
  }));
}

export function sortGroupsByOrder(
  groups: readonly EconomicDrilldownGroup[],
  order: readonly string[],
): EconomicDrilldownGroup[] {
  const orderMap = new Map(order.map((value, index) => [value, index]));

  return [...groups].sort((left, right) => {
    const leftIndex = orderMap.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderMap.get(right.id) ?? Number.MAX_SAFE_INTEGER;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.title.localeCompare(right.title, "es");
  });
}
