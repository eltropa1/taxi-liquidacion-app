import type { HistoricalDataset } from "../history";

type HistoricalExportRow = Readonly<{
  tripId: number;
  workdayId: number;
  workdayDate: string;
  workdayStartAt: string;
  tripStartAt: string;
  tripEndAt: string;
  amount: number | null;
  chargedAmount: number | null;
  cashTip: number | null;
  payment: string | null;
  source: string;
  serviceStatus: string | null;
}>;

export type HistoricalDatasetExportResult = Readonly<{
  csv: string;
  fileName: string;
  recordCount: number;
}>;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatIsoTimestamp(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString();
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return value.toFixed(2);
}

export function escapeCsvValue(value: string) {
  if (!/[",\r\n]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

export function serializeCsvRow(values: readonly (string | number | boolean | null | undefined)[]) {
  return `${values.map((value) => escapeCsvValue(formatCsvValue(value))).join(",")}\n`;
}

function formatCsvValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function buildHistoricalExportFileName(dataset: HistoricalDataset) {
  const { period } = dataset;
  const startKey = formatLocalDateKey(period.startDate);
  const endKey = formatLocalDateKey(period.endDate);

  if (period.periodType === "year") {
    return `GeoTaxi_Historial_${period.startDate.getFullYear()}.csv`;
  }

  if (period.periodType === "fortnight") {
    const monthKey = `${period.startDate.getFullYear()}-${pad2(period.startDate.getMonth() + 1)}`;
    const fortnightKey = period.startDate.getDate() <= 15 ? "Q1" : "Q2";
    return `GeoTaxi_Historial_${monthKey}_${fortnightKey}.csv`;
  }

  if (period.periodType === "month") {
    return `GeoTaxi_Historial_${period.startDate.getFullYear()}-${pad2(period.startDate.getMonth() + 1)}.csv`;
  }

  return `GeoTaxi_Historial_${startKey}_${endKey}.csv`;
}

function buildHistoricalExportRows(dataset: HistoricalDataset): HistoricalExportRow[] {
  const workdayById = new Map(dataset.workdays.map((workday) => [workday.id, workday]));

  return dataset.records.map((entry) => {
    const workday = workdayById.get(entry.workdayId);

    if (!workday) {
      throw new Error(`Missing workday ${entry.workdayId} for historical export`);
    }

    return {
      tripId: entry.trip.id,
      workdayId: workday.id,
      workdayDate: formatLocalDateKey(new Date(workday.startTime)),
      workdayStartAt: formatIsoTimestamp(workday.startTime),
      tripStartAt: formatIsoTimestamp(entry.trip.startTime),
      tripEndAt: formatIsoTimestamp(entry.trip.endTime),
      amount: entry.trip.amount ?? null,
      chargedAmount: entry.trip.chargedAmount ?? null,
      cashTip: entry.trip.cashTip ?? null,
      payment: entry.trip.payment ?? null,
      source: entry.trip.source,
      serviceStatus: entry.trip.serviceStatus ?? null,
    };
  });
}

export function buildHistoricalExportCsv(dataset: HistoricalDataset): HistoricalDatasetExportResult {
  const rows = buildHistoricalExportRows(dataset);
  const header = serializeCsvRow([
    "trip_id",
    "workday_id",
    "workday_date",
    "workday_start_at",
    "trip_start_at",
    "trip_end_at",
    "amount",
    "charged_amount",
    "cash_tip",
    "payment",
    "source",
    "service_status",
  ]);

  const csv = [
    header,
    ...rows.map((row) =>
      serializeCsvRow([
        row.tripId,
        row.workdayId,
        row.workdayDate,
        row.workdayStartAt,
        row.tripStartAt,
        row.tripEndAt,
        formatNumber(row.amount),
        formatNumber(row.chargedAmount),
        formatNumber(row.cashTip),
        row.payment,
        row.source,
        row.serviceStatus,
      ]),
    ),
  ].join("");

  return {
    csv,
    fileName: buildHistoricalExportFileName(dataset),
    recordCount: rows.length,
  };
}
