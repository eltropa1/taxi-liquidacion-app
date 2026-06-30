import { PaymentType, TripSource } from "../../constants/enums";
import {
  Trip,
  TripEconomics,
  TripPaymentMethodId,
  TripServiceClassification,
} from "../../domain/trips/canonical";

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
}
