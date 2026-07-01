import { PaymentType, TripSource } from "../../constants/enums";
import {
  Trip,
  TripEconomics,
  TripPaymentMethodId,
  TripServiceClassification,
} from "../../domain/trips/canonical";
import { getApplicationRuntime } from "../runtime";
import { getApplicationPersistence } from "../ports/persistence";

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

function mapClassificationFromLegacyInput(input: {
  amount: number;
  payment: PaymentType;
  source: TripSource;
  customSource?: string;
  chargedAmount?: number;
  cashTip?: number;
}) {
  return TripServiceClassification.create({
    platformId: input.source,
    serviceLabel: input.customSource ?? input.source,
  });
}

function mapEconomicsFromLegacyInput(input: {
  amount: number;
  payment: PaymentType;
  source: TripSource;
  customSource?: string;
  chargedAmount?: number;
  cashTip?: number;
}) {
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

/**
 * Caso de uso: finalizar un viaje.
 *
 * Mantiene la secuencia histórica exacta para no alterar comportamiento.
 */
export class FinishTrip {
  static async execute(
    amount: number,
    payment: PaymentType,
    source: TripSource,
    customSource?: string,
    chargedAmount?: number,
    cashTip?: number,
  ): Promise<void> {
    const { tripRepository, tripGeoSnapshotRepository } =
      getApplicationPersistence();

    const active = await tripRepository.findActiveTrip();
    if (!active) return;

    const trip = await tripRepository.findCanonicalTripById(active.id);
    if (!trip) return;

    const endedAt = new Date();
    const completionInput = {
      amount,
      payment,
      source,
      customSource,
      chargedAmount,
      cashTip,
    };
    const classification = mapClassificationFromLegacyInput(completionInput);
    const economics = mapEconomicsFromLegacyInput(completionInput);

    // 1️⃣ Cerrar viaje en dominio
    trip.finish(endedAt);
    trip.completeInformation({
      classification,
      economics,
    });

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

    // 2️⃣ Persistir el estado resultante
    await tripRepository.updateTripTimes({
      id: Number(trip.id),
      startTime: trip.chronology.startedAt,
      endTime: endedAt,
    });

    await tripRepository.updateTrip({
      id: Number(trip.id),
      amount: persistedAmount ?? 0,
      payment: persistedPayment ?? payment,
      source: persistedSource.source,
      customSource: persistedSource.customSource,
      chargedAmount: persistedChargedAmount,
      cashTip: persistedCashTip,
    });

    // 3️⃣ GPS real
    const runtime = getApplicationRuntime();
    const location = await runtime.geoLocation.getCurrentLocation();

    // 4️⃣ Resolver snapshot administrativo
    const geoSnapshot = runtime.geoAdministrativeResolver.resolve(
      location.latitude,
      location.longitude,
    );

    // 5️⃣ Guardar snapshot END
    await tripGeoSnapshotRepository.insert({
      tripId: Number(trip.id),
      kind: "END",
      snapshot: geoSnapshot,
      createdAt: new Date().toISOString(),
    });
  }
}
