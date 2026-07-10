import { TripServiceClassification, TripEconomics } from "../canonical";
import { Trip } from "../canonical";

describe("Trip and Service separation", () => {
  it("represents a closed trip with incomplete service information", () => {
    const trip = Trip.registerCompleted({
      id: "1",
      startedAt: new Date("2026-07-01T10:00:00.000Z"),
      endedAt: new Date("2026-07-01T10:10:00.000Z"),
      classification: TripServiceClassification.create({
        platformId: "taxi",
        serviceLabel: "Taxi",
      }),
    });

    expect(trip.status).toBe("closedPendingInformation");
    expect(trip.service?.status).toBe("incomplete");
    expect(trip.economics).toBeNull();
  });

  it("represents a completed trip with completed service information", () => {
    const trip = Trip.registerCompleted({
      id: "2",
      startedAt: new Date("2026-07-01T10:00:00.000Z"),
      endedAt: new Date("2026-07-01T10:10:00.000Z"),
      classification: TripServiceClassification.create({
        platformId: "uber",
        serviceLabel: "Uber",
      }),
      economics: TripEconomics.create({
        fareAmount: 12.5,
        paymentMethodId: "cash",
        collectedAmount: 13,
      }),
    });

    expect(trip.status).toBe("completed");
    expect(trip.service?.status).toBe("completed");
    expect(trip.economics?.fareAmount).toBe(12.5);
  });
});
