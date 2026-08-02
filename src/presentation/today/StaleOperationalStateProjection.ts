export type StaleActiveTrip = Readonly<{
  id: number;
  startTime: string;
}>;

export type StaleOpenWorkday = Readonly<{
  id: number;
  startTime: string;
}>;

export type StaleOperationalState = Readonly<{
  staleTrip: StaleActiveTrip | null;
  staleWorkday: StaleOpenWorkday | null;
}>;

function isSameCalendarDay(left: Date, right: Date): boolean {
  return left.toDateString() === right.toDateString();
}

/**
 * Un viaje o una jornada que sigue "en curso" desde un día distinto de hoy
 * casi siempre es un olvido (móvil apagado, app cerrada) y no una decisión
 * consciente del conductor: hay que avisarle en vez de dejarlo en silencio.
 */
export function resolveStaleOperationalState(input: {
  activeTrip: StaleActiveTrip | null;
  activeWorkday: StaleOpenWorkday | null;
  now: Date;
}): StaleOperationalState {
  const staleTrip =
    input.activeTrip &&
    !isSameCalendarDay(new Date(input.activeTrip.startTime), input.now)
      ? input.activeTrip
      : null;

  const staleWorkday =
    input.activeWorkday &&
    !isSameCalendarDay(new Date(input.activeWorkday.startTime), input.now)
      ? input.activeWorkday
      : null;

  return { staleTrip, staleWorkday };
}
