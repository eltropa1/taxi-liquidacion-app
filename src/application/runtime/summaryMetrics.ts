import { PaymentType, TripSource } from "../../constants/enums";

export type SummaryMetrics = Readonly<{
  servicesTotal: number;
  servicesTaxi: number;
  servicesUber: number;
  servicesCabify: number;
  servicesFreeNow: number;
  servicesOther: number;
  total: number;
  taxi: number;
  uber: number;
  cabify: number;
  freeNow: number;
  efectivo: number;
  tarjeta: number;
  app: number;
  propinaTarjeta: number;
  propinaEfectivo: number;
}>;

export type SummaryTripLike = Readonly<{
  amount: number | null;
  chargedAmount?: number | null;
  cashTip?: number | null;
  source: TripSource;
  payment: PaymentType | null;
}>;

export function createEmptySummary(includeTips = false): SummaryMetrics {
  return {
    servicesTotal: 0,
    servicesTaxi: 0,
    servicesUber: 0,
    servicesCabify: 0,
    servicesFreeNow: 0,
    servicesOther: 0,
    total: 0,
    taxi: 0,
    uber: 0,
    cabify: 0,
    freeNow: 0,
    efectivo: 0,
    tarjeta: 0,
    app: 0,
    propinaTarjeta: includeTips ? 0 : 0,
    propinaEfectivo: includeTips ? 0 : 0,
  };
}

export function accumulateSummary(
  summary: SummaryMetrics,
  trip: SummaryTripLike,
  includeTips = false,
): SummaryMetrics {
  const amount = trip.amount ?? 0;
  const chargedAmount = trip.chargedAmount ?? amount;

  const nextSummary = {
    ...summary,
    servicesTotal: summary.servicesTotal + 1,
    servicesTaxi:
      trip.source === TripSource.TAXI ? summary.servicesTaxi + 1 : summary.servicesTaxi,
    servicesUber:
      trip.source === TripSource.UBER ? summary.servicesUber + 1 : summary.servicesUber,
    servicesCabify:
      trip.source === TripSource.CABIFY
        ? summary.servicesCabify + 1
        : summary.servicesCabify,
    servicesFreeNow:
      trip.source === TripSource.FREE_NOW
        ? summary.servicesFreeNow + 1
        : summary.servicesFreeNow,
    servicesOther:
      trip.source === TripSource.CUSTOM
        ? summary.servicesOther + 1
        : summary.servicesOther,
    total: summary.total + amount,
    taxi: trip.source === TripSource.TAXI ? summary.taxi + amount : summary.taxi,
    uber: trip.source === TripSource.UBER ? summary.uber + amount : summary.uber,
    cabify: trip.source === TripSource.CABIFY ? summary.cabify + amount : summary.cabify,
    freeNow: trip.source === TripSource.FREE_NOW ? summary.freeNow + amount : summary.freeNow,
    efectivo:
      trip.payment === PaymentType.CASH ? summary.efectivo + amount : summary.efectivo,
    tarjeta:
      trip.payment === PaymentType.CARD ? summary.tarjeta + chargedAmount : summary.tarjeta,
    app: trip.payment === PaymentType.APP ? summary.app + amount : summary.app,
    propinaTarjeta: summary.propinaTarjeta,
    propinaEfectivo: summary.propinaEfectivo,
  };

  if (includeTips) {
    if (trip.payment === PaymentType.CARD && chargedAmount > amount) {
      nextSummary.propinaTarjeta += chargedAmount - amount;
    }

    if (trip.payment === PaymentType.CASH && (trip.cashTip ?? 0) > 0) {
      nextSummary.propinaEfectivo += trip.cashTip ?? 0;
    }
  }

  return nextSummary;
}

export function calculateSummary(
  trips: readonly SummaryTripLike[],
  includeTips = false,
): SummaryMetrics {
  return trips.reduce(
    (summary, trip) => accumulateSummary(summary, trip, includeTips),
    createEmptySummary(includeTips),
  );
}
