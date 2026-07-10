import { SummaryService, TripQueryService, WorkdayService } from "../application/runtime";

export type TodayScreenCriticalState = Readonly<{
  activeTripId: number | null;
  workdayInfo: Awaited<ReturnType<typeof WorkdayService.getWorkdayInfoForDate>>;
  activeWorkday: Awaited<ReturnType<typeof WorkdayService.getOpenWorkday>>;
}>;

export type TodayScreenEnrichmentState = Readonly<{
  trips: Awaited<ReturnType<typeof TripQueryService.getTripsForWorkday>>;
  dailySummary:
    | Awaited<ReturnType<typeof SummaryService.getSummaryForWorkday>>
    | null;
}>;

/**
 * Camino crítico de lectura de la pantalla.
 *
 * Resuelve el contexto operativo mínimo sin mezclarlo con resúmenes o agregaciones.
 */
export async function loadTodayScreenCriticalState(selectedDate: Date): Promise<TodayScreenCriticalState> {
  const activePromise = TripQueryService.getActiveTrip().then((result) => {
    return result;
  });
  const workdayPromise = WorkdayService.getOpenWorkday().then((result) => {
    return result;
  });
  const workdayInfoPromise = WorkdayService.getWorkdayInfoForDate(selectedDate).then(
    (result) => {
      return result;
    },
  );

  const [active, activeWorkday, workdayInfo] = await Promise.all([
    activePromise,
    workdayPromise,
    workdayInfoPromise,
  ]);

  return {
    activeTripId: active ? active.id : null,
    activeWorkday,
    workdayInfo,
  };
}

/**
 * Camino de enriquecimiento de lectura de la pantalla.
 *
 * Produce resúmenes y listados derivados sin participar en la definición del estado operativo.
 */
export async function loadTodayScreenEnrichmentState(
  workdayId: number | null,
): Promise<TodayScreenEnrichmentState> {
  let trips: TodayScreenEnrichmentState["trips"] = [];
  let dailySummary: TodayScreenEnrichmentState["dailySummary"] = null;

  if (workdayId !== null) {
    const tripsPromise = TripQueryService.getTripsForWorkday(workdayId).then(
      (result) => {
        return result;
      },
    );
    const dailySummaryPromise = SummaryService.getSummaryForWorkday(workdayId).then(
      (result) => {
        return result;
      },
    );

    [trips, dailySummary] = await Promise.all([
      tripsPromise,
      dailySummaryPromise,
    ]);
  }

  return {
    trips,
    dailySummary,
  };
}
