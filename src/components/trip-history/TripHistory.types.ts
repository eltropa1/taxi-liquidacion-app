import type { TripVisualProjection } from "../../presentation";

export type TripHistoryProps = {
  readonly trips: readonly TripVisualProjection[];
  readonly onTripPress?: (tripId: number) => void;
};
