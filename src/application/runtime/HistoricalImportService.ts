import { PaymentType, TripSource } from "../../constants/enums";
import { getApplicationPersistence } from "../ports/persistence";
import type {
  HistoricalTripUpsertInput,
  HistoricalWorkdayUpsertInput,
} from "../ports/persistence";
import type { ServiceStatus } from "../../domain/services";

type HistoricalImportCsvRow = Readonly<{
  tripId: number;
  workdayId: number;
  workdayDate: string;
  workdayStartAt: string;
  tripStartAt: string;
  tripEndAt: string;
  amount: number | null;
  chargedAmount: number | null;
  cashTip: number | null;
  payment: PaymentType | null;
  source: TripSource;
  serviceStatus: ServiceStatus | null;
}>;

export type HistoricalImportOutcome = Readonly<{
  status: "imported";
  workdayCount: number;
  tripCount: number;
}>;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Valor numérico inválido en el CSV: ${value}`);
  }

  return parsed;
}

function parseRequiredDate(value: string, fieldName: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Fecha inválida en ${fieldName}: ${value}`);
  }

  return date;
}

function normalizeCsvCell(value: string | undefined): string {
  return (value ?? "").trim();
}

function parseEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: string,
  fieldName: string,
): T[keyof T] {
  const normalized = normalizeCsvCell(value);
  const allowedValues = new Set(Object.values(enumObject));

  if (!allowedValues.has(normalized)) {
    throw new Error(`Valor inválido en ${fieldName}: ${value}`);
  }

  return normalized as T[keyof T];
}

function parseServiceStatus(value: string | undefined): ServiceStatus | null {
  const normalized = normalizeCsvCell(value);
  if (normalized === "") {
    return null;
  }

  if (normalized === "completed" || normalized === "incomplete") {
    return normalized;
  }

  throw new Error(`Valor inválido en service_status: ${value}`);
}

function parseHistoricalExportCsv(csv: string): HistoricalImportCsvRow[] {
  const trimmed = csv.trim();
  if (!trimmed) {
    return [];
  }

  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return [];
  }

  const header = lines[0].split(",");
  const expectedHeader = [
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
  ];

  const hasExpectedHeader =
    header.length === expectedHeader.length &&
    header.every((value, index) => value === expectedHeader[index]);

  if (!hasExpectedHeader) {
    throw new Error("El archivo no tiene el formato de exportación histórica esperado");
  }

  const rows = lines.slice(1).map((line, lineIndex) => {
    const cells = line.split(",");
    if (cells.length !== expectedHeader.length) {
      throw new Error(`La fila ${lineIndex + 2} no tiene el número esperado de columnas`);
    }

    const tripId = Number(normalizeCsvCell(cells[0]));
    const workdayId = Number(normalizeCsvCell(cells[1]));
    if (!Number.isInteger(tripId) || tripId <= 0) {
      throw new Error(`trip_id inválido en la fila ${lineIndex + 2}`);
    }

    if (!Number.isInteger(workdayId) || workdayId <= 0) {
      throw new Error(`workday_id inválido en la fila ${lineIndex + 2}`);
    }

    const workdayDate = normalizeCsvCell(cells[2]);
    const workdayStartAt = normalizeCsvCell(cells[3]);
    const tripStartAt = normalizeCsvCell(cells[4]);
    const tripEndAt = normalizeCsvCell(cells[5]);
    const amount = parseNumber(cells[6]);
    const chargedAmount = parseNumber(cells[7]);
    const cashTip = parseNumber(cells[8]);
    const paymentCell = normalizeCsvCell(cells[9]);
    const sourceCell = normalizeCsvCell(cells[10]);
    const serviceStatus = parseServiceStatus(cells[11]);

    if (!workdayDate) {
      throw new Error(`workday_date vacío en la fila ${lineIndex + 2}`);
    }

    const startDate = parseRequiredDate(workdayStartAt, "workday_start_at");
    if (formatLocalDateKey(startDate) !== workdayDate) {
      throw new Error(
        `workday_date no coincide con workday_start_at en la fila ${lineIndex + 2}`,
      );
    }

    if (!tripStartAt) {
      throw new Error(`trip_start_at vacío en la fila ${lineIndex + 2}`);
    }

    return {
      tripId,
      workdayId,
      workdayDate,
      workdayStartAt,
      tripStartAt,
      tripEndAt,
      amount,
      chargedAmount,
      cashTip,
      payment: paymentCell ? parseEnumValue(PaymentType, paymentCell, "payment") : null,
      source: parseEnumValue(TripSource, sourceCell, "source"),
      serviceStatus,
    };
  });

  const uniqueTripIds = new Set(rows.map((row) => row.tripId));
  if (uniqueTripIds.size !== rows.length) {
    throw new Error("El CSV contiene identificadores de viaje duplicados");
  }

  return rows;
}

function buildHistoricalWorkdayInputs(
  rows: readonly HistoricalImportCsvRow[],
): HistoricalWorkdayUpsertInput[] {
  const workdayById = new Map<number, HistoricalImportCsvRow[]>();

  for (const row of rows) {
    const current = workdayById.get(row.workdayId) ?? [];
    current.push(row);
    workdayById.set(row.workdayId, current);
  }

    return [...workdayById.entries()]
    .sort(([leftId], [rightId]) => leftId - rightId)
    .map(([workdayId, workdayRows]) => {
      const sortedRows = [...workdayRows].sort(
        (left, right) =>
          new Date(left.tripStartAt).getTime() - new Date(right.tripStartAt).getTime(),
      );
      const firstRow = sortedRows[0];
      const endCandidates = sortedRows
        .map((row) => (row.tripEndAt ? new Date(row.tripEndAt) : null))
        .filter((value): value is Date => value !== null)
        .sort((left, right) => left.getTime() - right.getTime());
      const endTime = endCandidates[endCandidates.length - 1] ?? null;

      return {
        id: workdayId,
        startTime: parseRequiredDate(firstRow.workdayStartAt, "workday_start_at"),
        endTime,
        startOdometer: null,
        endOdometer: null,
        isClosed: endTime !== null,
        createdAt: parseRequiredDate(firstRow.workdayStartAt, "workday_start_at"),
        goalPolicyId: null,
      };
    });
}

function buildHistoricalTripInput(row: HistoricalImportCsvRow): HistoricalTripUpsertInput {
  return {
    id: row.tripId,
    workdayId: row.workdayId,
    startTime: parseRequiredDate(row.tripStartAt, "trip_start_at"),
    endTime: row.tripEndAt ? parseRequiredDate(row.tripEndAt, "trip_end_at") : null,
    serviceStatus: row.serviceStatus,
    amount: row.amount,
    payment: row.payment,
    source: row.source,
    createdAt: parseRequiredDate(row.tripStartAt, "trip_start_at"),
    chargedAmount: row.chargedAmount,
    cashTip: row.cashTip,
    customSource: null,
    manualPickupZone: null,
    manualDropoffZone: null,
    voidedAt: null,
  };
}

export class HistoricalImportService {
  static async importHistoricalDatasetFromCsv(csv: string): Promise<HistoricalImportOutcome> {
    const rows = parseHistoricalExportCsv(csv);
    if (rows.length === 0) {
      throw new Error("El archivo no contiene datos históricos para importar");
    }

    const persistence = getApplicationPersistence();
    const workdayInputs = buildHistoricalWorkdayInputs(rows);

    await persistence.tripRepository.runInTransaction(async () => {
      for (const workday of workdayInputs) {
        await persistence.workdayRepository.upsertHistoricalWorkday(workday);
      }

      for (const row of rows) {
        await persistence.tripRepository.upsertHistoricalTrip(
          buildHistoricalTripInput(row),
        );
      }
    });

    return {
      status: "imported",
      workdayCount: workdayInputs.length,
      tripCount: rows.length,
    };
  }
}
