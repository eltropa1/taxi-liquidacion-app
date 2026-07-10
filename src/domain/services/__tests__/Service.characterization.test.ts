import { TripEconomics, TripServiceClassification } from "../../trips/canonical";
import { Service } from "../canonical";

describe("Service characterization", () => {
  it("creates an incomplete service without economics", () => {
    const service = Service.createIncomplete({
      classification: TripServiceClassification.create({
        platformId: "taxi",
        serviceLabel: "Taxi",
      }),
    });

    expect(service.status).toBe("incomplete");
    expect(service.isIncomplete()).toBe(true);
    expect(service.classification?.platformId).toBe("taxi");
    expect(service.economics).toBeNull();
  });

  it("completes an incomplete service with economics", () => {
    const service = Service.createIncomplete({
      classification: TripServiceClassification.create({
        platformId: "uber",
        serviceLabel: "Uber",
      }),
    }).completeInformation({
      economics: TripEconomics.create({
        fareAmount: 12.5,
        paymentMethodId: "cash",
        collectedAmount: 14,
      }),
    });

    expect(service.status).toBe("completed");
    expect(service.isCompleted()).toBe(true);
    expect(service.economics?.fareAmount).toBe(12.5);
    expect(service.economics?.paymentMethodId).toBe("cash");
  });
});
