import { TripDomainError } from "./TripDomainError";

export const tripPaymentMethodIds = ["cash", "card", "app"] as const;

export type TripPaymentMethodId = (typeof tripPaymentMethodIds)[number];

function ensureNonNegativeAmount(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TripDomainError(`${label} must be zero or greater`);
  }
}

function ensureKnownPaymentMethod(value: string) {
  if (!tripPaymentMethodIds.includes(value as TripPaymentMethodId)) {
    throw new TripDomainError("Trip payment method is not supported");
  }
}

export class TripEconomics {
  private constructor(
    private readonly fareAmountValue: number,
    private readonly paymentMethodIdValue: TripPaymentMethodId,
    private readonly collectedAmountValue: number,
  ) {
    ensureNonNegativeAmount(this.fareAmountValue, "Trip amount");
    ensureNonNegativeAmount(this.collectedAmountValue, "Trip collected amount");
    ensureKnownPaymentMethod(this.paymentMethodIdValue);
  }

  static create(params: {
    fareAmount: number;
    paymentMethodId: TripPaymentMethodId;
    collectedAmount?: number;
  }) {
    return new TripEconomics(
      params.fareAmount,
      params.paymentMethodId,
      params.collectedAmount ?? params.fareAmount,
    );
  }

  get fareAmount() {
    return this.fareAmountValue;
  }

  get paymentMethodId() {
    return this.paymentMethodIdValue;
  }

  get collectedAmount() {
    return this.collectedAmountValue;
  }

  get collectedAmountDelta() {
    return this.collectedAmountValue - this.fareAmountValue;
  }
}
