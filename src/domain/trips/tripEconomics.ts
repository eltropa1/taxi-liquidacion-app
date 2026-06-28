import { PaymentType, TripSource } from "../../constants/enums";

export type TripEconomicsItem = {
  amount: number | null;
  source: TripSource;
  payment: PaymentType | null;
};

export type TripTotalsBySource = {
  taxi: number;
  uber: number;
  cabify: number;
};

export type TripTotalsByPayment = {
  efectivo: number;
  tarjeta: number;
};

export function calculateProgress(current: number, goal: number) {
  if (goal <= 0) return null;
  return Math.min((current / goal) * 100, 100);
}

export function calculateRemainingAmount(total: number, goal: number) {
  if (goal <= 0) return null;
  return Math.max(goal - total, 0);
}

export function calculateTripTotalsBySource(
  trips: TripEconomicsItem[],
): TripTotalsBySource {
  return {
    taxi: trips
      .filter((trip) => trip.source === TripSource.TAXI)
      .reduce((sum, trip) => sum + (trip.amount ?? 0), 0),
    uber: trips
      .filter((trip) => trip.source === TripSource.UBER)
      .reduce((sum, trip) => sum + (trip.amount ?? 0), 0),
    cabify: trips
      .filter((trip) => trip.source === TripSource.CABIFY)
      .reduce((sum, trip) => sum + (trip.amount ?? 0), 0),
  };
}

export function calculateTripTotalsByPayment(
  trips: TripEconomicsItem[],
): TripTotalsByPayment {
  const efectivo = trips
    .filter((trip) => trip.payment === PaymentType.CASH)
    .reduce((sum, trip) => sum + (trip.amount ?? 0), 0);

  const tarjeta = trips
    .filter(
      (trip) =>
        trip.payment === PaymentType.CARD || trip.payment === PaymentType.APP,
    )
    .reduce((sum, trip) => sum + (trip.amount ?? 0), 0);

  return { efectivo, tarjeta };
}
