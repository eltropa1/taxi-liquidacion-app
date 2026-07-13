import { PaymentType, TripSource } from "../../../constants/enums";
import { prepareTripEditSaveData } from "../tripEditPreparation";
import { prepareTripSaveData } from "../tripSavePreparation";

describe("Trip preparation characterization", () => {
  describe("prepareTripSaveData", () => {
    it("resolves a custom source label only when the custom value is provided", () => {
      expect(
        prepareTripSaveData({
          amountInput: "12.50",
          payment: PaymentType.CASH,
          chargedAmountInput: "",
          cashTipInput: "",
          source: TripSource.CUSTOM,
          customSource: "Mi emisora",
        }),
      ).toEqual(
        expect.objectContaining({
          amount: 12.5,
          finalSource: "Mi emisora",
        }),
      );
    });

    it("returns null when the amount is not a valid number", () => {
      expect(
        prepareTripSaveData({
          amountInput: "abc",
          payment: PaymentType.CASH,
          chargedAmountInput: "",
          cashTipInput: "",
          source: TripSource.TAXI,
          customSource: "",
        }),
      ).toBeNull();
    });

    it("requires an explicitly entered amount for service completion", () => {
      for (const amountInput of ["", "   "]) {
        expect(
          prepareTripSaveData({
            amountInput,
            payment: PaymentType.CASH,
            chargedAmountInput: "",
            cashTipInput: "",
            source: TripSource.TAXI,
            customSource: "",
          }),
        ).toBeNull();
      }
    });

    it("accepts explicit zero and negative service amounts", () => {
      const cases = [
        ["0", 0],
        ["0,00", 0],
        ["-33", -33],
        ["-33,00", -33],
      ] as const;

      for (const [amountInput, expectedAmount] of cases) {
        expect(
          prepareTripSaveData({
            amountInput,
            payment: PaymentType.CASH,
            chargedAmountInput: "",
            cashTipInput: "",
            source: TripSource.TAXI,
            customSource: "",
          }),
        ).toEqual(
          expect.objectContaining({
            amount: expectedAmount,
          }),
        );
      }
    });

    it("rejects non-finite service amounts", () => {
      for (const amountInput of ["Infinity", "-Infinity", "NaN"]) {
        expect(
          prepareTripSaveData({
            amountInput,
            payment: PaymentType.CASH,
            chargedAmountInput: "",
            cashTipInput: "",
            source: TripSource.TAXI,
            customSource: "",
          }),
        ).toBeNull();
      }
    });

    it("computes cash tip as the positive difference between charged and fare amount", () => {
      expect(
        prepareTripSaveData({
          amountInput: "10",
          payment: PaymentType.CASH,
          chargedAmountInput: "",
          cashTipInput: "12",
          source: TripSource.TAXI,
          customSource: "",
        }),
      ).toEqual(
        expect.objectContaining({
          amount: 10,
          cashTip: 2,
        }),
      );
    });
  });

  describe("prepareTripEditSaveData", () => {
    it("accepts valid times and card amounts", () => {
      const result = prepareTripEditSaveData({
        tripStartTime: "2026-07-01T08:00:00.000Z",
        amountInput: "15",
        payment: PaymentType.CARD,
        chargedAmountInput: "18",
        cashTipInput: "",
        startTimeInput: "08:15",
        endTimeInput: "08:45",
        existingChargedAmount: null,
        existingCashTip: null,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amount).toBe(15);
        expect(result.value.chargedAmountValue).toBe(18);
      }
    });

    it("rejects an end time earlier than the start time", () => {
      expect(
        prepareTripEditSaveData({
          tripStartTime: "2026-07-01T08:00:00.000Z",
          amountInput: "15",
          payment: PaymentType.CASH,
          chargedAmountInput: "",
          cashTipInput: "",
          startTimeInput: "09:00",
          endTimeInput: "08:45",
          existingChargedAmount: null,
          existingCashTip: null,
        }),
      ).toEqual({ ok: false, error: "END_BEFORE_START" });
    });

    it("rejects card payments when the charged amount is lower than the fare", () => {
      expect(
        prepareTripEditSaveData({
          tripStartTime: "2026-07-01T08:00:00.000Z",
          amountInput: "15",
          payment: PaymentType.CARD,
          chargedAmountInput: "14",
          cashTipInput: "",
          startTimeInput: "08:15",
          endTimeInput: "08:45",
          existingChargedAmount: null,
          existingCashTip: null,
        }),
      ).toEqual({ ok: false, error: "CHARGED_AMOUNT_TOO_LOW" });
    });

    it("rejects empty edit amounts instead of converting them to zero", () => {
      for (const amountInput of ["", "   "]) {
        expect(
          prepareTripEditSaveData({
            tripStartTime: "2026-07-01T08:00:00.000Z",
            amountInput,
            payment: PaymentType.CASH,
            chargedAmountInput: "",
            cashTipInput: "",
            startTimeInput: "08:15",
            endTimeInput: "08:45",
            existingChargedAmount: null,
            existingCashTip: null,
          }),
        ).toEqual({ ok: false, error: "INVALID_AMOUNT" });
      }
    });

    it("accepts explicit zero and negative edit amounts", () => {
      const cases = [
        ["0", 0],
        ["0,00", 0],
        ["-33", -33],
        ["-33,00", -33],
      ] as const;

      for (const [amountInput, expectedAmount] of cases) {
        const result = prepareTripEditSaveData({
          tripStartTime: "2026-07-01T08:00:00.000Z",
          amountInput,
          payment: PaymentType.CASH,
          chargedAmountInput: "",
          cashTipInput: "",
          startTimeInput: "08:15",
          endTimeInput: "08:45",
          existingChargedAmount: null,
          existingCashTip: null,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.amount).toBe(expectedAmount);
        }
      }
    });
  });
});
