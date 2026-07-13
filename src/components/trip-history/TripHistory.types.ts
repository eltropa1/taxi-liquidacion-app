import type { TripVisualProjection } from "../../presentation";

export type TripHistoryProps = {
  readonly trips: readonly TripVisualProjection[];
  readonly onRegisteredTripPress?: (tripId: number) => void;
  readonly onPendingTripPress?: (trip: TripVisualProjection) => void;
};
