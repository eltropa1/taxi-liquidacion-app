import { PaymentType, TripSource } from "../../constants/enums";
import {
  Trip,
  TripEconomics,
  TripPaymentMethodId,
  TripServiceClassification,
} from "../../domain/trips/canonical";
import { getApplicationRuntime } from "../runtime";
import { getApplicationPersistence } from "../ports/persistence";
import { captureTripGeoEnrichment } from "./tripGeoEnrichment";

export type FinishTripResult = Readonly<{
  finalized: boolean;
  enrichmentSaved: boolean;
}>;

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
      : (input.payment === PaymentType.CARD || input.payment === PaymentType.APP) &&
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
 * Garantiza la finalización crítica y trata el enriquecimiento GEO como best effort.
 */
export class FinishTrip {
  static async execute(
    amount: number,
    payment: PaymentType,
    source: TripSource,
    customSource?: string,
    chargedAmount?: number,
    cashTip?: number,
  ): Promise<FinishTripResult> {
    const { tripRepository, tripGeoSnapshotRepository } =
      getApplicationPersistence();

    const active = await tripRepository.findActiveTrip();
    if (!active) {
      return { finalized: false, enrichmentSaved: true };
    }

    const trip = await tripRepository.findCanonicalTripById(active.id);
    if (!trip) {
      return { finalized: false, enrichmentSaved: true };
    }

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

    // Camino crítico: cerrar el viaje y fijar el hecho económico.
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

    await tripRepository.runInTransaction(async () => {
      // Camino crítico: persistir el registro del servicio.
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
    });

    // Camino de enriquecimiento: snapshot GEO posterior al registro.
    void captureTripGeoEnrichment({
      tripId: Number(trip.id),
      kind: "END",
      runtime: getApplicationRuntime(),
      snapshotRepository: tripGeoSnapshotRepository,
      errorLabel: "Error capturando snapshot GEO de fin de viaje",
    });

    return { finalized: true, enrichmentSaved: true };
  }
}
