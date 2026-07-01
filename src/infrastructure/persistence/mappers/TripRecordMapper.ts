import { PaymentType, TripSource } from "../../../constants/enums";
import {
  Trip,
  TripEconomics,
  TripServiceClassification,
} from "../../../domain/trips/canonical";
import type { TripPaymentMethodId } from "../../../domain/trips/canonical";

export type TripRecordRow = {
  id: number;
  startTime: string;
  endTime: string | null;
  amount: number | null;
  payment: PaymentType | null;
  source: TripSource;
  customSource: string | null;
  chargedAmount: number | null;
  cashTip: number | null;
  manualPickupZone: string | null;
  manualDropoffZone: string | null;
  workdayId: number | null;
};

export type LegacyTripCompletionInput = {
  amount: number;
  payment: PaymentType;
  source: TripSource;
  customSource?: string;
  chargedAmount?: number;
  cashTip?: number;
};

export type TripPersistenceRecord = {
  id: number;
  startTime: string;
  endTime: string | null;
  amount: number | null;
  payment: PaymentType | null;
  source: TripSource;
  customSource: string | null;
  chargedAmount: number | null;
  cashTip: number | null;
  workdayId: number | null;
};

function mapPaymentMethodId(
  payment: PaymentType | null,
): TripPaymentMethodId | null {
  switch (payment) {
    case PaymentType.CASH:
      return "cash";
    case PaymentType.CARD:
      return "card";
    case PaymentType.APP:
      return "app";
    default:
      return null;
  }
}

function mapClassification(row: TripRecordRow) {
  const customSource = row.customSource?.trim() ?? "";

  if (row.source === TripSource.CUSTOM) {
    return customSource
      ? TripServiceClassification.create({ serviceLabel: customSource })
      : null;
  }

  return TripServiceClassification.create({
    platformId: row.source,
    serviceLabel: customSource || row.source,
  });
}

function mapEconomics(row: TripRecordRow) {
  const paymentMethodId = mapPaymentMethodId(row.payment);

  if (row.amount === null || paymentMethodId === null) {
    return null;
  }

  const collectedAmount =
    row.payment === PaymentType.CASH
      ? row.amount + (row.cashTip ?? 0)
      : row.chargedAmount ?? row.amount;

  return TripEconomics.create({
    fareAmount: row.amount,
    paymentMethodId,
    collectedAmount,
  });
}

function mapClassificationFromLegacyInput(input: LegacyTripCompletionInput) {
  return TripServiceClassification.create({
    platformId: input.source,
    serviceLabel: input.customSource ?? input.source,
  });
}

function mapEconomicsFromLegacyInput(input: LegacyTripCompletionInput) {
  const paymentMethodId = mapPaymentMethodId(input.payment);

  if (paymentMethodId === null) {
    throw new Error("Legacy payment method is not supported");
  }

  const collectedAmount =
    input.payment === PaymentType.CASH
      ? input.amount + (input.cashTip ?? 0)
      : input.payment === PaymentType.CARD &&
          typeof input.chargedAmount === "number"
        ? input.chargedAmount
        : input.amount;

  return TripEconomics.create({
    fareAmount: input.amount,
    paymentMethodId,
    collectedAmount,
  });
}

function mapPersistedSource(
  classification: TripServiceClassification | null,
): { source: TripSource; customSource: string | null } {
  if (!classification) {
    return {
      source: TripSource.TAXI,
      customSource: null,
    };
  }

  if (classification.platformId) {
    return {
      source: classification.platformId as TripSource,
      customSource:
        classification.serviceLabel !== classification.platformId
          ? classification.serviceLabel
          : null,
    };
  }

  return {
    source: TripSource.CUSTOM,
    customSource: classification.serviceLabel,
  };
}

function mapPersistedPayment(
  paymentMethodId: TripPaymentMethodId | null,
): PaymentType | null {
  switch (paymentMethodId) {
    case "cash":
      return PaymentType.CASH;
    case "card":
      return PaymentType.CARD;
    case "app":
      return PaymentType.APP;
    default:
      return null;
  }
}

export class TripRecordMapper {
  static toCanonicalTrip(row: TripRecordRow) {
    const classification = mapClassification(row);
    const economics = mapEconomics(row);
    const workdayId =
      row.workdayId !== null ? String(row.workdayId) : null;

    if (row.endTime === null) {
      return Trip.start({
        id: String(row.id),
        startedAt: new Date(row.startTime),
        workdayId,
        classification,
      });
    }

    return Trip.registerCompleted({
      id: String(row.id),
      startedAt: new Date(row.startTime),
      endedAt: new Date(row.endTime),
      workdayId,
      classification,
      economics,
    });
  }

  static toCanonicalCompletion(input: LegacyTripCompletionInput) {
    return {
      classification: mapClassificationFromLegacyInput(input),
      economics: mapEconomicsFromLegacyInput(input),
    };
  }

  static toPersistenceRecord(trip: Trip): TripPersistenceRecord {
    const persistedSource = mapPersistedSource(trip.classification);
    const persistedPayment = mapPersistedPayment(
      trip.economics?.paymentMethodId ?? null,
    );
    const persistedAmount = trip.economics?.fareAmount ?? null;
    const persistedChargedAmount =
      persistedPayment === PaymentType.CARD
        ? trip.economics?.collectedAmount ?? null
        : persistedAmount;
    const persistedCashTip =
      persistedPayment === PaymentType.CASH
        ? trip.economics?.collectedAmountDelta ?? null
        : null;

    return {
      id: Number(trip.id),
      startTime: trip.chronology.startedAt.toISOString(),
      endTime: trip.chronology.endedAt?.toISOString() ?? null,
      amount: persistedAmount,
      payment: persistedPayment,
      source: persistedSource.source,
      customSource: persistedSource.customSource,
      chargedAmount: persistedChargedAmount,
      cashTip: persistedCashTip,
      workdayId: trip.workdayId ? Number(trip.workdayId) : null,
    };
  }
}
