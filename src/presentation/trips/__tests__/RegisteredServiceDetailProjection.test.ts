import { PaymentType, TripSource } from "../../../constants/enums";
import {
  buildRegisteredServiceDetailProjection,
  createRegisteredServiceCorrectionForm,
  formatPaymentTypeLabel,
  formatTripSourceLabel,
  isRegisteredServiceCorrectionFormDirty,
  prepareRegisteredServiceCorrection,
} from "../RegisteredServiceDetailProjection";

const completedTrip = {
  id: 12,
  startTime: new Date(2026, 6, 1, 9, 0, 0, 0).toISOString(),
  endTime: new Date(2026, 6, 1, 9, 20, 0, 0).toISOString(),
  serviceStatus: "completed" as const,
  amount: 10,
  payment: PaymentType.CASH,
  source: TripSource.CUSTOM,
  customSource: "Radio Taxi",
  chargedAmount: null,
  cashTip: 2,
  manualPickupZone: "016",
  manualDropoffZone: null,
  workdayId: 7,
  closedWorkdayEditedAt: null,
};

describe("RegisteredServiceDetailProjection", () => {
  it("prefers the special zone name over the neighborhood when both are detected", () => {
    const projection = buildRegisteredServiceDetailProjection({
      trip: completedTrip,
      snapshots: [
        {
          tripId: completedTrip.id,
          kind: "START",
          createdAt: new Date(2026, 6, 1, 9, 0, 0, 0).toISOString(),
          snapshot: {
            resolvedAt: new Date(2026, 6, 1, 9, 0, 0, 0).toISOString(),
            latitude: 40.4918,
            longitude: -3.5936,
            neighborhood: { id: "212", name: "Aeropuerto" },
            district: { id: "21", name: "Barajas" },
            specialZone: {
              id: "MAD_AIRPORT_T4",
              name: "Aeropuerto T4 / T4S",
              type: "SPECIAL_ZONE",
            },
          },
        },
        {
          tripId: completedTrip.id,
          kind: "END",
          createdAt: new Date(2026, 6, 1, 9, 20, 0, 0).toISOString(),
          snapshot: {
            resolvedAt: new Date(2026, 6, 1, 9, 20, 0, 0).toISOString(),
            latitude: 40.42,
            longitude: -3.7,
            neighborhood: { id: "016", name: "Sol" },
          },
        },
      ],
    });

    expect(projection.geoPickupZoneLabel).toBe("Aeropuerto T4 / T4S");
    expect(projection.geoDropoffZoneLabel).toBe("Sol");
  });

  it("projects product labels instead of raw enum values", () => {
    const projection = buildRegisteredServiceDetailProjection({
      trip: {
        ...completedTrip,
        payment: PaymentType.APP,
        source: TripSource.FREE_NOW,
        customSource: null,
      },
      snapshots: [],
    });

    expect(projection.paymentLabel).toBe("App");
    expect(projection.sourceLabel).toBe("Free Now");
    expect(formatPaymentTypeLabel(PaymentType.CARD)).toBe("Tarjeta");
    expect(formatTripSourceLabel(TripSource.CUSTOM)).toBe("Otra");
  });

  it("initializes cash total from amount plus cashTip and preserves custom source", () => {
    expect(createRegisteredServiceCorrectionForm(completedTrip)).toEqual(
      expect.objectContaining({
        amountInput: "10",
        payment: PaymentType.CASH,
        cashTotalReceivedInput: "12",
        customSourceInput: "Radio Taxi",
      }),
    );
  });

  it("derives cashTip from total cash received", () => {
    const form = {
      ...createRegisteredServiceCorrectionForm(completedTrip),
      cashTotalReceivedInput: "13,50",
    };

    const prepared = prepareRegisteredServiceCorrection(completedTrip, form);
    expect(prepared.ok).toBe(true);
    if (prepared.ok) {
      expect(prepared.command.cashTip).toBe(3.5);
      expect(prepared.command.chargedAmount).toBeNull();
      expect(prepared.dirty).toBe(true);
    }
  });

  it("accepts cash totals with currency symbols and decimal separators", () => {
    const form = {
      ...createRegisteredServiceCorrectionForm(completedTrip),
      cashTotalReceivedInput: "30.25 €",
    };

    const prepared = prepareRegisteredServiceCorrection(completedTrip, form);
    expect(prepared.ok).toBe(true);
    if (prepared.ok) {
      expect(prepared.command.cashTip).toBe(20.25);
    }
  });

  it("normalizes incompatible payment fields and keeps card chargedAmount only for card", () => {
    const form = {
      ...createRegisteredServiceCorrectionForm(completedTrip),
      payment: PaymentType.CARD,
      chargedAmountInput: "10",
      cashTotalReceivedInput: "99",
    };

    const prepared = prepareRegisteredServiceCorrection(completedTrip, form);
    expect(prepared.ok).toBe(true);
    if (prepared.ok) {
      expect(prepared.command.chargedAmount).toBe(10);
      expect(prepared.command.cashTip).toBeNull();
    }
  });

  it("treats equivalent numeric strings as unchanged", () => {
    const form = {
      ...createRegisteredServiceCorrectionForm(completedTrip),
      amountInput: "10,00",
      cashTotalReceivedInput: "12.00",
      customSourceInput: "  Radio Taxi  ",
    };

    const prepared = prepareRegisteredServiceCorrection(completedTrip, form);
    expect(prepared.ok).toBe(true);
    if (prepared.ok) {
      expect(prepared.dirty).toBe(false);
    }
  });

  it("keeps dirty tracking active even when a changed form is invalid", () => {
    const form = {
      ...createRegisteredServiceCorrectionForm(completedTrip),
      amountInput: "",
    };

    expect(isRegisteredServiceCorrectionFormDirty(completedTrip, form)).toBe(
      true,
    );
  });

  it("does not mark semantically equivalent numeric form values as dirty", () => {
    const form = {
      ...createRegisteredServiceCorrectionForm(completedTrip),
      amountInput: "10.00",
      cashTotalReceivedInput: "12,00",
      customSourceInput: "  Radio Taxi  ",
    };

    expect(isRegisteredServiceCorrectionFormDirty(completedTrip, form)).toBe(
      false,
    );
  });

  it("rejects empty amount and invalid numbers", () => {
    expect(
      prepareRegisteredServiceCorrection(completedTrip, {
        ...createRegisteredServiceCorrectionForm(completedTrip),
        amountInput: "",
      }),
    ).toEqual(
      expect.objectContaining({
        ok: false,
        errors: expect.objectContaining({ amount: expect.any(String) }),
      }),
    );

    expect(
      prepareRegisteredServiceCorrection(completedTrip, {
        ...createRegisteredServiceCorrectionForm(completedTrip),
        amountInput: "Infinity",
      }),
    ).toEqual(
      expect.objectContaining({
        ok: false,
        errors: expect.objectContaining({ amount: expect.any(String) }),
      }),
    );
  });

  it("treats an end time earlier than the start time as crossing midnight", () => {
    const prepared = prepareRegisteredServiceCorrection(completedTrip, {
      ...createRegisteredServiceCorrectionForm(completedTrip),
      startTimeInput: "23:54",
      endTimeInput: "00:10",
    });

    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;

    expect(prepared.command.startTime.toISOString()).toBe(
      new Date(2026, 6, 1, 23, 54, 0, 0).toISOString(),
    );
    expect(prepared.command.endTime.toISOString()).toBe(
      new Date(2026, 6, 2, 0, 10, 0, 0).toISOString(),
    );
  });

  it("keeps the overnight correction marked as unchanged when it matches the stored trip", () => {
    const overnightTrip = {
      ...completedTrip,
      startTime: new Date(2026, 6, 1, 23, 54, 0, 0).toISOString(),
      endTime: new Date(2026, 6, 2, 0, 10, 0, 0).toISOString(),
    };

    const form = createRegisteredServiceCorrectionForm(overnightTrip);
    expect(isRegisteredServiceCorrectionFormDirty(overnightTrip, form)).toBe(
      false,
    );

    const prepared = prepareRegisteredServiceCorrection(overnightTrip, form);
    expect(prepared.ok).toBe(true);
    if (prepared.ok) {
      expect(prepared.dirty).toBe(false);
    }
  });

  it("accepts zero and negative service amounts", () => {
    for (const [amountInput, expected] of [
      ["0", 0],
      ["0,00", 0],
      ["-33", -33],
      ["-33,00", -33],
    ] as const) {
      const prepared = prepareRegisteredServiceCorrection(completedTrip, {
        ...createRegisteredServiceCorrectionForm(completedTrip),
        amountInput,
        cashTotalReceivedInput: "",
      });

      expect(prepared.ok).toBe(true);
      if (prepared.ok) {
        expect(prepared.command.amount).toBe(expected);
      }
    }
  });
});
