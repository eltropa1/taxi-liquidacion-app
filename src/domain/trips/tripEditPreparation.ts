import { PaymentType } from "../../constants/enums";

export type TripEditPreparationError =
  | "INVALID_AMOUNT"
  | "INVALID_TIME_FORMAT"
  | "END_BEFORE_START"
  | "INVALID_CARD_AMOUNT_FORMAT"
  | "INVALID_CASH_AMOUNT_FORMAT"
  | "CHARGED_AMOUNT_TOO_LOW";

export type TripEditPreparationInput = {
  tripStartTime: string;
  amountInput: string;
  payment: PaymentType;
  chargedAmountInput: string;
  cashTipInput: string;
  startTimeInput: string;
  endTimeInput: string;
  existingChargedAmount: number | null;
  existingCashTip: number | null;
};

export type TripEditPreparationResult =
  | {
      ok: true;
      value: {
        amount: number;
        newStartTime: Date;
        newEndTime: Date;
        chargedAmountValue?: number;
        cashTipValue?: number;
      };
    }
  | {
      ok: false;
      error: TripEditPreparationError;
    };

const parseTimeInput = (value: string): { h: number; m: number } | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const h = Number(match[1]);
  const m = Number(match[2]);

  if (h < 0 || h > 23 || m < 0 || m > 59) return null;

  return { h, m };
};

const buildTimeFromBaseDate = (
  baseDate: Date,
  time: { h: number; m: number },
) => {
  const result = new Date(baseDate);
  result.setHours(time.h, time.m, 0, 0);
  return result;
};

const parseAmountInput = (value: string) => {
  if (value.trim() === "") return null;

  const amount = Number(value.replace(",", "."));
  return Number.isFinite(amount) ? amount : null;
};

export function prepareTripEditSaveData(
  input: TripEditPreparationInput,
): TripEditPreparationResult {
  const startParsed = parseTimeInput(input.startTimeInput);
  const endParsed = parseTimeInput(input.endTimeInput);

  if (!startParsed || !endParsed) {
    return { ok: false, error: "INVALID_TIME_FORMAT" };
  }

  const baseDate = new Date(input.tripStartTime);
  const newStartTime = buildTimeFromBaseDate(baseDate, startParsed);
  const newEndTime = buildTimeFromBaseDate(baseDate, endParsed);

  if (newEndTime < newStartTime) {
    return { ok: false, error: "END_BEFORE_START" };
  }

  const amount = parseAmountInput(input.amountInput);
  if (amount === null) {
    return { ok: false, error: "INVALID_AMOUNT" };
  }

  let chargedAmountValue: number | undefined = undefined;
  let cashTipValue: number | undefined = undefined;

  if (input.payment === PaymentType.CARD) {
    let resolvedChargedAmount: number =
      input.existingChargedAmount ?? amount;

    if (input.chargedAmountInput.trim() !== "") {
      const parsed = parseAmountInput(input.chargedAmountInput);
      if (parsed === null) {
        return { ok: false, error: "INVALID_CARD_AMOUNT_FORMAT" };
      }
      resolvedChargedAmount = parsed;
    }

    if (resolvedChargedAmount < amount) {
      return { ok: false, error: "CHARGED_AMOUNT_TOO_LOW" };
    }

    chargedAmountValue = resolvedChargedAmount;
  }

  if (input.payment === PaymentType.CASH) {
    let resolvedCashCharged: number = amount + (input.existingCashTip ?? 0);

    if (input.cashTipInput.trim() !== "") {
      const parsed = parseAmountInput(input.cashTipInput);
      if (parsed === null) {
        return { ok: false, error: "INVALID_CASH_AMOUNT_FORMAT" };
      }
      resolvedCashCharged = parsed;
    }

    if (resolvedCashCharged < amount) {
      return { ok: false, error: "CHARGED_AMOUNT_TOO_LOW" };
    }

    cashTipValue = resolvedCashCharged - amount;
  }

  return {
    ok: true,
    value: {
      amount,
      newStartTime,
      newEndTime,
      chargedAmountValue,
      cashTipValue,
    },
  };
}
