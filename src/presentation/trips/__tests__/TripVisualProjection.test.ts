import { PaymentType, TripSource } from "../../../constants/enums";
import { toTripVisualProjection } from "../toTripVisualProjection";

const baseTrip = {
  id: 1,
  startTime: "2026-07-01T08:00:00.000Z",
  endTime: "2026-07-01T08:15:00.000Z",
  source: TripSource.TAXI,
  payment: PaymentType.CASH,
};

describe("toTripVisualProjection", () => {
  it("projects incomplete services as pending from service status", () => {
    const projection = toTripVisualProjection({
      ...baseTrip,
      serviceStatus: "incomplete",
      amount: 12,
    });

    expect(projection.isPendingCompletion).toBe(true);
  });

  it("keeps incomplete services pending even when the amount is zero", () => {
    const projection = toTripVisualProjection({
      ...baseTrip,
      serviceStatus: "incomplete",
      amount: 0,
    });

    expect(projection.isPendingCompletion).toBe(true);
  });

  it("projects completed services as not pending from service status", () => {
    const projection = toTripVisualProjection({
      ...baseTrip,
      serviceStatus: "completed",
      amount: null,
    });

    expect(projection.isPendingCompletion).toBe(false);
  });

  it("does not mark completed zero or negative amounts as pending", () => {
    expect(
      toTripVisualProjection({
        ...baseTrip,
        serviceStatus: "completed",
        amount: 0,
      }).isPendingCompletion,
    ).toBe(false);

    expect(
      toTripVisualProjection({
        ...baseTrip,
        serviceStatus: "completed",
        amount: -33,
      }).isPendingCompletion,
    ).toBe(false);
  });

  it("keeps a legacy fallback only when service status is unavailable", () => {
    const projection = toTripVisualProjection({
      ...baseTrip,
      serviceStatus: null,
      amount: null,
      payment: null,
    });

    expect(projection.isPendingCompletion).toBe(true);
  });
});
