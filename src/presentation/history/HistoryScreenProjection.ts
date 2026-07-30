import type {
  HistoricalDataset,
  HistoricalGoalContext,
  HistoricalPeriodSelection,
  HistoricalPeriodType,
} from "../../application/history";
import { toTripVisualProjection } from "../trips";
import type { TripVisualProjection } from "../trips";
import {
  groupTripsByKey,
  sortGroupsByOrder,
  type EconomicDrilldownGroup,
} from "../economics";
import { calculateWorkdayKilometers } from "../../domain/workdays/workdayOdometer";

export type HistoryScreenGoalRow = Readonly<{
  label: string;
  value: string;
}>;

export type HistoryScreenMetricRow = Readonly<{
  id: string;
  label: string;
  value: string;
  detail?: string;
}>;

export type HistoryScreenPeriodBreakdownRow = Readonly<{
  id: string;
  rangeLabel: string;
  workdaysLabel: string;
  servicesLabel: string;
  amountLabel: string;
  goalContextLabel: string;
  goalContextDetail: string;
  selection: HistoricalPeriodSelection;
}>;

export type HistoryScreenWorkdayRow = Readonly<{
  id: number;
  startTime: string;
  dateLabel: string;
  timeRangeLabel: string;
  statusLabel: "ABIERTA" | "CERRADA";
  servicesLabel: string;
  amountLabel: string;
  goalContextLabel: string;
  goalContextDetail: string;
}>;

export type HistoryScreenProjection = Readonly<{
  titleLabel: string;
  periodType: HistoricalPeriodType;
  periodLabel: string;
  periodRangeLabel: string;
  periodStatusLabel: string;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  previousSelection: HistoricalDataset["period"]["previousSelection"];
  nextSelection: HistoricalDataset["period"]["nextSelection"];
  summaryRows: readonly HistoryScreenMetricRow[];
  tripHistory: readonly TripVisualProjection[];
  platformRows: readonly EconomicDrilldownGroup[];
  paymentRows: readonly EconomicDrilldownGroup[];
  periodBreakdownRows: readonly HistoryScreenPeriodBreakdownRow[];
  goalContextLabel: string;
  goalContextDetail: string;
  goalRows: readonly HistoryScreenGoalRow[] | null;
  workdayRows: readonly HistoryScreenWorkdayRow[];
  emptyStateLabel: string;
}>;

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} €`;
}

function formatDateLabel(value: Date) {
  return capitalize(
    value.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  );
}

function formatMonthLabel(value: Date) {
  return capitalize(
    value.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    }),
  );
}

function formatTimeLabel(value: string | null) {
  if (!value) {
    return "ahora";
  }

  return new Date(value).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatWorkdayGoalContext(goalContext: HistoricalGoalContext) {
  switch (goalContext.status) {
    case "resolved":
      return {
        label: goalContext.source === "current" ? "Meta actual" : "Meta histórica",
        detail:
          goalContext.source === "current"
            ? "Usa la política vigente de la jornada abierta."
            : "Usa la política consolidada al cierre de la jornada.",
        rows: [
          { label: "Diaria", value: formatMoney(goalContext.policy.goals.daily) },
          { label: "Semanal", value: formatMoney(goalContext.policy.goals.weekly) },
          { label: "Mensual", value: formatMoney(goalContext.policy.goals.monthly) },
        ],
      };
    case "mixed": {
      const policyRows = goalContext.policies.map((policy) => ({
        label:
          goalContext.policies.length > 1
            ? `Desde ${formatDateLabel(new Date(policy.effectiveAt))}`
            : "Diaria",
        value: formatMoney(policy.goals.daily),
      }));

      return {
        label: goalContext.policies.length > 0 ? "Metas cambiaron en el periodo" : "Contexto mixto",
        detail:
          goalContext.reason === "multiple_policies"
            ? goalContext.policies.length > 0
              ? "La meta diaria varió entre jornadas de este periodo:"
              : "Este periodo mezcla jornadas consolidadas bajo políticas distintas."
            : goalContext.policies.length > 0
              ? "Se muestra la meta conocida; algunas jornadas no conservan evidencia histórica."
              : "Este periodo no tiene evidencia histórica completa para una única meta.",
        rows: policyRows.length > 0 ? policyRows : null,
      };
    }
    case "unknown":
      return {
        label: "Sin contexto histórico",
        detail:
          goalContext.reason === "missing_policy"
            ? "Existe una jornada sin la política histórica conservada."
            : "No hay evidencia suficiente para reconstruir la meta.",
        rows: null,
      };
  }
}

function formatPeriodStatusLabel(
  periodType: HistoricalPeriodType,
  isCurrent: boolean,
): string {
  if (periodType === "custom") {
    return "Rango personalizado";
  }

  if (periodType === "fortnight") {
    return isCurrent ? "Quincena actual" : "Quincena histórica";
  }

  if (periodType === "year") {
    return isCurrent ? "Año actual" : "Año histórico";
  }

  if (periodType === "month") {
    return isCurrent ? "Mes actual" : "Mes histórico";
  }

  return isCurrent ? "Semana actual" : "Semana histórica";
}

function formatKilometers(value: number) {
  return `${new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(value)} km`;
}

function calculatePeriodKilometers(dataset: HistoricalDataset) {
  let total = 0;
  let withData = 0;
  let missing = 0;

  for (const workday of dataset.workdays) {
    const km = calculateWorkdayKilometers(workday.startOdometer, workday.endOdometer);
    if (km === null) {
      if (workday.isClosed) missing += 1;
      continue;
    }
    total += km;
    withData += 1;
  }

  return { total, withData, missing };
}

function formatMetricRows(dataset: HistoricalDataset): HistoryScreenMetricRow[] {
  const tipTotal = dataset.summary.propinaTarjeta + dataset.summary.propinaEfectivo;
  const rows: HistoryScreenMetricRow[] = [
    {
      id: "income",
      label: "Ingresos",
      value: formatMoney(dataset.summary.total),
    },
    {
      id: "services",
      label: "Servicios",
      value: String(dataset.summary.servicesTotal),
    },
    {
      id: "workdays",
      label: "Jornadas",
      value: String(dataset.breakdown.length),
    },
  ];

  if (tipTotal > 0) {
    rows.push({
      id: "tips",
      label: "Propinas",
      value: formatMoney(tipTotal),
    });
  }

  const kilometers = calculatePeriodKilometers(dataset);
  if (kilometers.withData > 0) {
    rows.push({
      id: "kilometers",
      label: "Kilómetros",
      value: formatKilometers(kilometers.total),
      detail:
        kilometers.missing > 0
          ? `${kilometers.missing} jornada${kilometers.missing === 1 ? "" : "s"} sin odómetro registrado`
          : undefined,
    });
  }

  return rows;
}

function buildTripHistory(dataset: HistoricalDataset): readonly TripVisualProjection[] {
  return dataset.records.map((record) => toTripVisualProjection(record.trip));
}

function buildPlatformRows(tripHistory: readonly TripVisualProjection[]) {
  return sortGroupsByOrder(
    groupTripsByKey(
      tripHistory,
      (trip) => trip.platform.id,
      (key, groupedTrips) => {
        if (key === "other") return "Otros";
        return groupedTrips[0]?.platform.label ?? "Otros";
      },
      (groupedTrips) => `${groupedTrips.length} servicios`,
    ),
    ["taxi", "uber", "cabify", "freeNow", "other"],
  );
}

function buildPaymentRows(tripHistory: readonly TripVisualProjection[]) {
  return sortGroupsByOrder(
    groupTripsByKey(
      tripHistory,
      (trip) => trip.paymentMethod?.id ?? "unassigned",
      (key, groupedTrips) => {
        if (key === "unassigned") return "Sin método";
        return groupedTrips[0]?.paymentMethod?.label ?? "Sin método";
      },
      (groupedTrips) => `${groupedTrips.length} servicios`,
    ).filter((group) => group.id !== "unassigned"),
    ["cash", "card", "app"],
  );
}

function formatPeriodBreakdownRows(
  dataset: HistoricalDataset,
): HistoryScreenPeriodBreakdownRow[] {
  return (dataset.periodBreakdown ?? []).map((entry) => {
    const goalContext = formatWorkdayGoalContext(entry.goalContext);
    const rangeLabel =
      entry.periodType === "month"
        ? formatMonthLabel(entry.startDate)
        : `${formatDateLabel(entry.startDate)} - ${formatDateLabel(entry.endDate)}`;

    return {
      id: `${entry.periodType}-${entry.startDate.toISOString()}`,
      rangeLabel,
      workdaysLabel: formatCountLabel(entry.workdayCount, "jornada", "jornadas"),
      servicesLabel: formatCountLabel(entry.recordCount, "servicio", "servicios"),
      amountLabel: formatMoney(entry.summary.total),
      goalContextLabel: goalContext.label,
      goalContextDetail: goalContext.detail,
      selection: entry.selection,
    };
  });
}

export function buildHistoryScreenProjection(dataset: HistoricalDataset): HistoryScreenProjection {
  const goalContext = formatWorkdayGoalContext(dataset.goalContext);
  const tripHistory = buildTripHistory(dataset);
  const workdayRows: HistoryScreenWorkdayRow[] = dataset.breakdown.map((entry) => {
    const workdayGoalContext = formatWorkdayGoalContext(entry.goalContext);

    return {
      id: entry.workday.id,
      startTime: entry.workday.startTime,
      dateLabel: formatDateLabel(new Date(entry.workday.startTime)),
      timeRangeLabel: `${formatTimeLabel(entry.workday.startTime)} - ${formatTimeLabel(entry.workday.endTime)}`,
      statusLabel: entry.workday.isClosed ? "CERRADA" : "ABIERTA",
      servicesLabel: formatCountLabel(entry.recordCount, "servicio", "servicios"),
      amountLabel: formatMoney(entry.summary.total),
      goalContextLabel: workdayGoalContext.label,
      goalContextDetail: workdayGoalContext.detail,
    };
  });
  const platformRows = buildPlatformRows(tripHistory);
  const paymentRows = buildPaymentRows(tripHistory);

  return {
    titleLabel: "Historial",
    periodType: dataset.period.periodType,
    periodLabel: dataset.period.label,
    periodRangeLabel: `${formatDateLabel(dataset.period.startDate)} - ${formatDateLabel(dataset.period.endDate)}`,
    periodStatusLabel: formatPeriodStatusLabel(dataset.period.periodType, dataset.period.isCurrent),
    canNavigatePrevious: dataset.period.canNavigatePrevious,
    canNavigateNext: dataset.period.canNavigateNext,
    previousSelection: dataset.period.previousSelection,
    nextSelection: dataset.period.nextSelection,
    summaryRows: formatMetricRows(dataset),
    tripHistory,
    platformRows,
    paymentRows,
    periodBreakdownRows: formatPeriodBreakdownRows(dataset),
    goalContextLabel: goalContext.label,
    goalContextDetail: goalContext.detail,
    goalRows: goalContext.rows,
    workdayRows,
    emptyStateLabel: "No hay jornadas en este periodo.",
  };
}
