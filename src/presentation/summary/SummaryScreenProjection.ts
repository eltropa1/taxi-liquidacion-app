import { PaymentType } from "../../constants/enums";
import { calculateWorkdayKilometers } from "../../domain/workdays/workdayOdometer";
import { toTripVisualProjection } from "../trips";
import type { TripVisualProjection } from "../trips";

export type SummaryTripRecord = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  amount: number | null;
  source: string;
  payment: PaymentType | null;
  serviceStatus?: "completed" | "incomplete" | null;
}>;

export type SummaryWorkdayInfo = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  startOdometer: number | null;
  endOdometer: number | null;
  isClosed: boolean;
}>;

export type SummaryActiveWorkday = Readonly<{
  id: number;
  startTime: string;
  startOdometer: number | null;
}> | null | undefined;

export type SummaryDailySummary = Readonly<{
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
}> | null;

export type SummaryScreenData = Readonly<{
  selectedDate: Date;
  currentTime: Date;
  workdayInfo: SummaryWorkdayInfo | null;
  activeWorkday: SummaryActiveWorkday;
  trips: readonly SummaryTripRecord[];
  dailySummary: SummaryDailySummary;
}>;

export type SummaryDrilldownGroup = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  count: number;
  amount: number;
  trips: readonly TripVisualProjection[];
}>;

export type SummaryScreenProjection = Readonly<{
  dateLabel: string;
  statusLabel: "ABIERTA" | "CERRADA";
  statusNote: string;
  workdayId: number | null;
  totalServices: number;
  completedServices: number;
  pendingServices: number;
  openServices: number;
  incidentServices: number;
  totalAmount: number;
  tipCardAmount: number;
  tipCashAmount: number;
  tipTotalAmount: number;
  workdayRangeLabel: string;
  workedDurationLabel: string;
  workedMinutes: number | null;
  workedKilometers: number | null;
  tripHistory: readonly TripVisualProjection[];
  platformRows: readonly SummaryDrilldownGroup[];
  paymentRows: readonly SummaryDrilldownGroup[];
  incidentRows: readonly SummaryDrilldownGroup[];
}>;

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateLabel(date: Date) {
  return capitalize(
    date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  );
}

function formatClockLabel(value: string) {
  return new Date(value).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDurationLabel(minutes: number | null) {
  if (minutes === null) return "—";
  if (minutes <= 0) return "0 min";

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainderMinutes} min`;
  }

  return remainderMinutes === 0
    ? `${hours} h`
    : `${hours} h ${String(remainderMinutes).padStart(2, "0")} min`;
}

function calculateDurationMinutes(startTime: string, endTime: string | null) {
  if (!endTime) return null;

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;

  return Math.round((end - start) / 60000);
}

function resolveRangeLabel(startTime: string, endTime: string | null, isOpen: boolean) {
  const endLabel = isOpen ? "ahora" : endTime ? formatClockLabel(endTime) : "—";
  return `${formatClockLabel(startTime)} → ${endLabel}`;
}

function sumTripAmounts(trips: readonly SummaryTripRecord[]) {
  return trips.reduce((accumulator, trip) => accumulator + (trip.amount ?? 0), 0);
}

function groupTripsByKey(
  trips: readonly TripVisualProjection[],
  getKey: (trip: TripVisualProjection) => string,
  getTitle: (key: string, trips: readonly TripVisualProjection[]) => string,
  getSubtitle: (trips: readonly TripVisualProjection[]) => string,
): SummaryDrilldownGroup[] {
  const map = new Map<string, TripVisualProjection[]>();

  for (const trip of trips) {
    const key = getKey(trip);
    const bucket = map.get(key);
    if (bucket) {
      bucket.push(trip);
    } else {
      map.set(key, [trip]);
    }
  }

  return [...map.entries()].map(([key, groupedTrips]) => ({
    id: key,
    title: getTitle(key, groupedTrips),
    subtitle: getSubtitle(groupedTrips),
    count: groupedTrips.length,
    amount: groupedTrips.reduce((accumulator, trip) => accumulator + (trip.amount.value ?? 0), 0),
    trips: groupedTrips,
  }));
}

function sortGroupsByOrder(
  groups: SummaryDrilldownGroup[],
  order: readonly string[],
) {
  const orderMap = new Map(order.map((value, index) => [value, index]));
  return [...groups].sort((left, right) => {
    const leftIndex = orderMap.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderMap.get(right.id) ?? Number.MAX_SAFE_INTEGER;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.title.localeCompare(right.title, "es");
  });
}

function sortByStartTime(trips: readonly TripVisualProjection[]) {
  return [...trips].sort(
    (left, right) =>
      new Date(left.schedule.startTime).getTime() - new Date(right.schedule.startTime).getTime(),
  );
}

function resolveWorkdayContext(
  selectedDate: Date,
  currentTime: Date,
  workdayInfo: SummaryWorkdayInfo | null,
  activeWorkday: SummaryActiveWorkday,
) {
  const isOpen = Boolean(activeWorkday);
  const fallbackStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    0,
    0,
    0,
    0,
  ).toISOString();

  const startTime = activeWorkday?.startTime ?? workdayInfo?.startTime ?? fallbackStart;
  const endTime = isOpen ? currentTime.toISOString() : workdayInfo?.endTime ?? null;
  const workedMinutes = calculateDurationMinutes(startTime, endTime);
  const workedKilometers = workdayInfo
    ? calculateWorkdayKilometers(
        workdayInfo.startOdometer,
        workdayInfo.endOdometer,
      )
    : null;

  return {
    isOpen,
    startTime,
    endTime,
    workedMinutes,
    workedKilometers,
  };
}

export function buildSummaryScreenProjection(
  data: SummaryScreenData,
): SummaryScreenProjection {
  const tripHistory = sortByStartTime(
    data.trips.map((trip) => toTripVisualProjection(trip)),
  );

  const totalServices = data.dailySummary?.servicesTotal ?? tripHistory.length;
  const totalAmount =
    data.dailySummary?.total ?? sumTripAmounts(data.trips);
  const tipCardAmount = data.dailySummary?.propinaTarjeta ?? 0;
  const tipCashAmount = data.dailySummary?.propinaEfectivo ?? 0;
  const tipTotalAmount = tipCardAmount + tipCashAmount;
  const completedServices = tripHistory.filter(
    (trip) => trip.schedule.endTime !== null,
  ).length;
  const pendingServices = tripHistory.filter((trip) => trip.isPendingCompletion).length;
  const openServices = tripHistory.filter(
    (trip) => trip.schedule.endTime === null && !trip.isPendingCompletion,
  ).length;
  const workday = resolveWorkdayContext(
    data.selectedDate,
    data.currentTime,
    data.workdayInfo,
    data.activeWorkday,
  );

  const platformRows = groupTripsByKey(
    tripHistory,
    (trip) => trip.platform.id,
    (key, groupedTrips) => {
      if (key === "other") return "Otros";
      return groupedTrips[0]?.platform.label ?? "Otros";
    },
    (groupedTrips) => `${groupedTrips.length} servicios`,
  );
  const orderedPlatformRows = sortGroupsByOrder(platformRows, [
    "taxi",
    "uber",
    "cabify",
    "freeNow",
    "other",
  ]);

  const paymentRows = groupTripsByKey(
    tripHistory,
    (trip) => trip.paymentMethod?.id ?? "unassigned",
    (key, groupedTrips) => {
      if (key === "unassigned") return "Sin método";
      return groupedTrips[0]?.paymentMethod?.label ?? "Sin método";
    },
    (groupedTrips) => `${groupedTrips.length} servicios`,
  ).filter((group) => group.id !== "unassigned");
  const orderedPaymentRows = sortGroupsByOrder(paymentRows, ["cash", "card", "app"]);

  const pendingTrips = tripHistory.filter((trip) => trip.isPendingCompletion);
  const openTrips = tripHistory.filter(
    (trip) => trip.schedule.endTime === null && !trip.isPendingCompletion,
  );
  const incidentServices = pendingServices + openServices;

  const incidentRows: SummaryDrilldownGroup[] = [];
  if (pendingTrips.length > 0) {
    incidentRows.push({
      id: "pending",
      title: "Pendientes",
      subtitle: `${pendingTrips.length} servicios`,
      count: pendingTrips.length,
      amount: pendingTrips.reduce(
        (accumulator, trip) => accumulator + (trip.amount.value ?? 0),
        0,
      ),
      trips: pendingTrips,
    });
  }
  if (openTrips.length > 0) {
    incidentRows.push({
      id: "open",
      title: "En curso",
      subtitle: `${openTrips.length} servicios`,
      count: openTrips.length,
      amount: openTrips.reduce(
        (accumulator, trip) => accumulator + (trip.amount.value ?? 0),
        0,
      ),
      trips: openTrips,
    });
  }

  return {
    dateLabel: formatDateLabel(data.selectedDate),
    statusLabel: workday.isOpen ? "ABIERTA" : "CERRADA",
    statusNote: workday.isOpen ? "Jornada en curso" : "Jornada cerrada",
    workdayId: data.workdayInfo?.id ?? data.activeWorkday?.id ?? null,
    totalServices,
    completedServices,
    pendingServices,
    openServices,
    incidentServices,
    totalAmount,
    tipCardAmount,
    tipCashAmount,
    tipTotalAmount,
    workdayRangeLabel: resolveRangeLabel(
      workday.startTime,
      workday.endTime,
      workday.isOpen,
    ),
    workedDurationLabel: formatDurationLabel(workday.workedMinutes),
    workedMinutes: workday.workedMinutes,
    workedKilometers: workday.workedKilometers,
    tripHistory,
    platformRows: orderedPlatformRows,
    paymentRows: orderedPaymentRows,
    incidentRows,
  };
}
