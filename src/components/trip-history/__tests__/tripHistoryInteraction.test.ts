import { PaymentType, TripSource } from "../../../constants/enums";
import { toTripVisualProjection } from "../../../presentation";
import { getTripHistoryPressIntent } from "../tripHistoryInteraction";

const closedTrip = {
  id: 1,
  startTime: "2026-07-01T08:00:00.000Z",
  endTime: "2026-07-01T08:15:00.000Z",
  amount: 12,
  source: TripSource.TAXI,
  payment: PaymentType.CASH,
};

describe("getTripHistoryPressIntent", () => {
  it("starts completion for a pending service", () => {
    const trip = toTripVisualProjection({
      ...closedTrip,
      serviceStatus: "incomplete",
      amount: null,
      payment: null,
    });

    expect(getTripHistoryPressIntent(trip)).toBe("completePendingService");
  });

  it("keeps editing for a registered service", () => {
    const trip = toTripVisualProjection({
      ...closedTrip,
      serviceStatus: "completed",
    });

    expect(getTripHistoryPressIntent(trip)).toBe("editRegisteredService");
  });

  it("does not route pending and registered services to the same intent", () => {
    const pending = toTripVisualProjection({
      ...closedTrip,
      serviceStatus: "incomplete",
      amount: null,
      payment: null,
    });
    const registered = toTripVisualProjection({
      ...closedTrip,
      serviceStatus: "completed",
    });

    expect(getTripHistoryPressIntent(pending)).not.toBe(
      getTripHistoryPressIntent(registered),
    );
  });

  it("ignores open trips", () => {
    const trip = toTripVisualProjection({
      ...closedTrip,
      endTime: null,
      serviceStatus: null,
    });

    expect(getTripHistoryPressIntent(trip)).toBe("none");
  });
});
