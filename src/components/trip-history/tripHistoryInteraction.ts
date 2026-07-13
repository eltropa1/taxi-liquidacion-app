import type { TripVisualProjection } from "../../presentation";

export type TripHistoryPressIntent =
  | "none"
  | "completePendingService"
  | "editRegisteredService";

export function getTripHistoryPressIntent(
  trip: TripVisualProjection,
): TripHistoryPressIntent {
  if (!trip.schedule.endTime) return "none";
  return trip.isPendingCompletion
    ? "completePendingService"
    : "editRegisteredService";
}
