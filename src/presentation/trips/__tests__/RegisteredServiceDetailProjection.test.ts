import { PaymentType, TripSource } from "../../../constants/enums";
import {
  createRegisteredServiceCorrectionForm,
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
};

describe("RegisteredServiceDetailProjection", () => {
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

  it("rejects empty amount, invalid numbers and end time before start", () => {
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

    expect(
      prepareRegisteredServiceCorrection(completedTrip, {
        ...createRegisteredServiceCorrectionForm(completedTrip),
        startTimeInput: "10:00",
        endTimeInput: "09:00",
      }),
    ).toEqual(
      expect.objectContaining({
        ok: false,
        errors: expect.objectContaining({ endTime: expect.any(String) }),
      }),
    );
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
