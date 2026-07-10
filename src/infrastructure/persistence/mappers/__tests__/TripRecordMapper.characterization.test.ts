import { PaymentType, TripSource } from "../../../../constants/enums";
import { Trip, TripEconomics, TripServiceClassification } from "../../../../domain/trips/canonical";
import { TripRecordMapper } from "../TripRecordMapper";

describe("TripRecordMapper", () => {
  it("reconstructs an incomplete service from a legacy trip row", () => {
    const trip = TripRecordMapper.toCanonicalTrip({
      id: 1,
      startTime: "2026-07-01T10:00:00.000Z",
      endTime: "2026-07-01T10:12:00.000Z",
      serviceStatus: "incomplete",
      amount: null,
      payment: null,
      source: TripSource.TAXI,
      customSource: null,
      chargedAmount: null,
      cashTip: null,
      manualPickupZone: null,
      manualDropoffZone: null,
      workdayId: 7,
    });

    expect(trip.status).toBe("closedPendingInformation");
    expect(trip.service?.status).toBe("incomplete");
  });

  it("serializes completed and incomplete service states", () => {
    const completedTrip = Trip.registerCompleted({
      id: "1",
      startedAt: new Date("2026-07-01T10:00:00.000Z"),
      endedAt: new Date("2026-07-01T10:12:00.000Z"),
      classification: TripServiceClassification.create({
        platformId: TripSource.UBER,
        serviceLabel: "Uber",
      }),
      economics: TripEconomics.create({
        fareAmount: 18,
        paymentMethodId: "card",
        collectedAmount: 18,
      }),
    });

    const incompleteTrip = Trip.registerCompleted({
      id: "2",
      startedAt: new Date("2026-07-01T10:00:00.000Z"),
      endedAt: new Date("2026-07-01T10:12:00.000Z"),
      classification: TripServiceClassification.create({
        platformId: TripSource.TAXI,
        serviceLabel: "Taxi",
      }),
    });

    expect(TripRecordMapper.toPersistenceRecord(completedTrip)).toEqual(
      expect.objectContaining({
        serviceStatus: "completed",
        payment: PaymentType.CARD,
      }),
    );

    expect(TripRecordMapper.toPersistenceRecord(incompleteTrip)).toEqual(
      expect.objectContaining({
        serviceStatus: "incomplete",
        amount: null,
        payment: null,
      }),
    );
  });
});
