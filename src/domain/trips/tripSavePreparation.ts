import { PaymentType, TripSource } from "../../constants/enums";

export type TripSavePreparationInput = {
  amountInput: string;
  payment: PaymentType;
  chargedAmountInput: string;
  cashTipInput: string;
  source: TripSource;
  customSource: string;
};

export type TripSavePreparationResult = {
  amount: number;
  chargedAmountValue?: number;
  cashTip?: number;
  finalSource: TripSource | string;
};

function parseAmountInput(input: string) {
  const amount = Number(input.replace(",", "."));
  return isNaN(amount) ? null : amount;
}

function parseOptionalAmountInput(input: string) {
  if (input.trim() === "") return undefined;

  const amount = Number(input.replace(",", "."));
  return isNaN(amount) ? null : amount;
}

function resolveFinalSource(source: TripSource, customSource: string) {
  return source === TripSource.CUSTOM && customSource.trim()
    ? customSource.trim()
    : source;
}

export function prepareTripSaveData(
  input: TripSavePreparationInput,
): TripSavePreparationResult | null {
  const amount = parseAmountInput(input.amountInput);
  if (amount === null) return null;

  const chargedAmountValue =
    input.payment === PaymentType.CARD || input.payment === PaymentType.APP
      ? parseOptionalAmountInput(input.chargedAmountInput)
      : undefined;

  if (chargedAmountValue === null) return null;

  let cashTip: number | undefined = undefined;

  if (input.payment === PaymentType.CASH) {
    const totalCobrado = parseOptionalAmountInput(input.cashTipInput);
    if (totalCobrado === null) return null;

    if (typeof totalCobrado === "number") {
      const diff = totalCobrado - amount;
      cashTip = diff > 0 ? diff : 0;
    }
  }

  return {
    amount,
    chargedAmountValue,
    cashTip,
    finalSource: resolveFinalSource(input.source, input.customSource),
  };
}
