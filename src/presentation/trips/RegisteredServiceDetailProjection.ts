import { PaymentType, TripSource } from "../../constants/enums";
import type { ServiceStatus } from "../../domain/services";
import type { TripGeoSnapshotRecord } from "../../application/ports/persistence";
import { parseMoneyInput } from "../../utils/numberInput";
import {
  resolveEffectiveNeighborhoodName,
  resolveGeoZoneLabel,
  resolveTripEditClock,
} from "./TripEditProjection";

export type RegisteredServiceRecord = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  serviceStatus: ServiceStatus | null;
  amount: number | null;
  payment: PaymentType | null;
  source: TripSource;
  customSource: string | null;
  chargedAmount: number | null;
  cashTip: number | null;
  manualPickupZone: string | null;
  manualDropoffZone: string | null;
  workdayId: number | null;
  closedWorkdayEditedAt: string | null;
}>;

export type RegisteredServiceCorrectionForm = Readonly<{
  amountInput: string;
  payment: PaymentType;
  chargedAmountInput: string;
  cashTotalReceivedInput: string;
  source: TripSource;
  customSourceInput: string;
  startTimeInput: string;
  endTimeInput: string;
  manualPickupZone: string | null;
  manualDropoffZone: string | null;
}>;

export type RegisteredServiceCorrectionErrors = Partial<
  Record<
    | "amount"
    | "payment"
    | "chargedAmount"
    | "cashTotalReceived"
    | "startTime"
    | "endTime"
    | "customSource",
    string
  >
>;

export type RegisteredServiceCorrectionCommand = Readonly<{
  id: number;
  amount: number;
  payment: PaymentType;
  chargedAmount: number | null;
  cashTip: number | null;
  source: TripSource;
  customSource: string | null;
  startTime: Date;
  endTime: Date;
  manualPickupZone: string | null;
  manualDropoffZone: string | null;
}>;

export type RegisteredServiceCorrectionPreparation =
  | Readonly<{
      ok: true;
      command: RegisteredServiceCorrectionCommand;
      dirty: boolean;
    }>
  | Readonly<{
      ok: false;
      errors: RegisteredServiceCorrectionErrors;
    }>;

export type RegisteredServiceDetailProjection = Readonly<{
  title: "Detalle del servicio";
  statusLabel: "Registrado";
  amountLabel: string;
  paymentLabel: string;
  chargedAmountLabel: string | null;
  cashTotalReceivedLabel: string | null;
  cashTipLabel: string | null;
  sourceLabel: string;
  customSourceLabel: string | null;
  scheduleLabel: string;
  manualPickupZoneLabel: string;
  manualDropoffZoneLabel: string;
  geoPickupZoneLabel: string;
  geoDropoffZoneLabel: string;
  editedAfterCloseWarning: string | null;
}>;

const paymentLabels: Record<PaymentType, string> = {
  [PaymentType.CASH]: "Efectivo",
  [PaymentType.CARD]: "Tarjeta",
  [PaymentType.APP]: "App",
};

const sourceLabels: Record<TripSource, string> = {
  [TripSource.TAXI]: "Taxi",
  [TripSource.UBER]: "Uber",
  [TripSource.CABIFY]: "Cabify",
  [TripSource.FREE_NOW]: "Free Now",
  [TripSource.CUSTOM]: "Otra",
};

export function buildRegisteredServiceDetailProjection(input: {
  trip: RegisteredServiceRecord;
  snapshots: TripGeoSnapshotRecord[];
}): RegisteredServiceDetailProjection {
  const geoPickupSnapshot = input.snapshots.find((s) => s.kind === "START")?.snapshot;
  const geoDropoffSnapshot = input.snapshots.find((s) => s.kind === "END")?.snapshot;
  const cashTotal =
    input.trip.payment === PaymentType.CASH &&
    input.trip.amount !== null &&
    input.trip.cashTip !== null
      ? input.trip.amount + input.trip.cashTip
      : null;

  return {
    title: "Detalle del servicio",
    statusLabel: "Registrado",
    amountLabel: formatMoney(input.trip.amount),
    paymentLabel: input.trip.payment ? formatPaymentTypeLabel(input.trip.payment) : "-",
    chargedAmountLabel:
      input.trip.payment === PaymentType.CARD
        ? formatMoney(input.trip.chargedAmount)
        : null,
    cashTotalReceivedLabel:
      input.trip.payment === PaymentType.CASH ? formatMoney(cashTotal) : null,
    cashTipLabel:
      input.trip.payment === PaymentType.CASH
        ? formatMoney(input.trip.cashTip)
        : null,
    sourceLabel: formatTripSourceLabel(input.trip.source),
    customSourceLabel: input.trip.customSource,
    scheduleLabel: `${resolveTripEditClock(input.trip.startTime)} - ${
      input.trip.endTime ? resolveTripEditClock(input.trip.endTime) : "-"
    }`,
    manualPickupZoneLabel: resolveEffectiveNeighborhoodName(
      input.trip.manualPickupZone,
      null,
    ),
    manualDropoffZoneLabel: resolveEffectiveNeighborhoodName(
      input.trip.manualDropoffZone,
      null,
    ),
    geoPickupZoneLabel: resolveGeoZoneLabel(geoPickupSnapshot),
    geoDropoffZoneLabel: resolveGeoZoneLabel(geoDropoffSnapshot),
    editedAfterCloseWarning: input.trip.closedWorkdayEditedAt
      ? `Editado el ${new Date(input.trip.closedWorkdayEditedAt).toLocaleString()} tras cerrar la jornada. Las cifras de esa jornada ya cerrada han cambiado.`
      : null,
  };
}

export function formatPaymentTypeLabel(payment: PaymentType): string {
  return paymentLabels[payment] ?? payment;
}

export function formatTripSourceLabel(
  source: TripSource,
): string {
  return sourceLabels[source] ?? source;
}

export function createRegisteredServiceCorrectionForm(
  trip: RegisteredServiceRecord,
): RegisteredServiceCorrectionForm {
  const amount = trip.amount ?? 0;
  return {
    amountInput: trip.amount === null ? "" : formatDecimalInput(trip.amount),
    payment: trip.payment ?? PaymentType.CASH,
    chargedAmountInput:
      trip.chargedAmount === null ? "" : formatDecimalInput(trip.chargedAmount),
    cashTotalReceivedInput:
      trip.cashTip === null || trip.amount === null
        ? ""
        : formatDecimalInput(amount + trip.cashTip),
    source: trip.source,
    customSourceInput: trip.customSource ?? "",
    startTimeInput: resolveTripEditClock(trip.startTime),
    endTimeInput: trip.endTime ? resolveTripEditClock(trip.endTime) : "",
    manualPickupZone: trip.manualPickupZone,
    manualDropoffZone: trip.manualDropoffZone,
  };
}

export function prepareRegisteredServiceCorrection(
  trip: RegisteredServiceRecord,
  form: RegisteredServiceCorrectionForm,
): RegisteredServiceCorrectionPreparation {
  const errors: RegisteredServiceCorrectionErrors = {};
  const amount = parseDecimalInput(form.amountInput);
  if (amount === null) {
    errors.amount = "El importe es obligatorio y debe ser un numero finito.";
  }

  if (!Object.values(PaymentType).includes(form.payment)) {
    errors.payment = "Metodo de pago no reconocido.";
  }

  const startTime = parseTimeOnBaseDate(trip.startTime, form.startTimeInput);
  const endTime = resolveOvernightAwareEndTime(startTime, trip.startTime, form.endTimeInput);

  if (!startTime) {
    errors.startTime = "Introduce la hora de inicio en formato HH:mm.";
  }

  if (!endTime) {
    errors.endTime = "Introduce la hora de fin en formato HH:mm.";
  }

  if (form.source === TripSource.CUSTOM && form.customSourceInput.trim() === "") {
    errors.customSource = "Introduce la clasificacion personalizada.";
  }

  let chargedAmount: number | null = null;
  let cashTip: number | null = null;

  if (amount !== null && form.payment === PaymentType.CARD) {
    if (form.chargedAmountInput.trim() !== "") {
      chargedAmount = parseDecimalInput(form.chargedAmountInput);
      if (chargedAmount === null) {
        errors.chargedAmount = "Importe cobrado por tarjeta invalido.";
      } else if (chargedAmount < amount) {
        errors.chargedAmount =
          "El importe cobrado no puede ser menor que el importe.";
      }
    }
  }

  if (amount !== null && form.payment === PaymentType.CASH) {
    if (form.cashTotalReceivedInput.trim() !== "") {
      const cashTotal = parseDecimalInput(form.cashTotalReceivedInput);
      if (cashTotal === null) {
        errors.cashTotalReceived = "Total cobrado en efectivo invalido.";
      } else if (cashTotal < amount) {
        errors.cashTotalReceived =
          "El total cobrado no puede ser menor que el importe.";
      } else {
        cashTip = cashTotal - amount;
      }
    }
  }

  if (Object.keys(errors).length > 0 || amount === null || !startTime || !endTime) {
    return { ok: false, errors };
  }

  const command: RegisteredServiceCorrectionCommand = {
    id: trip.id,
    amount,
    payment: form.payment,
    chargedAmount: form.payment === PaymentType.CARD ? chargedAmount : null,
    cashTip: form.payment === PaymentType.CASH ? cashTip : null,
    source: form.source,
    customSource:
      form.source === TripSource.CUSTOM
        ? normalizeOptionalText(form.customSourceInput)
        : null,
    startTime,
    endTime,
    manualPickupZone: normalizeOptionalText(form.manualPickupZone),
    manualDropoffZone: normalizeOptionalText(form.manualDropoffZone),
  };

  return {
    ok: true,
    command,
    dirty: isRegisteredServiceCorrectionDirty(trip, command),
  };
}

export function isRegisteredServiceCorrectionFormDirty(
  trip: RegisteredServiceRecord,
  form: RegisteredServiceCorrectionForm,
): boolean {
  return (
    JSON.stringify(normalizeTripForComparison(trip)) !==
    JSON.stringify(normalizeFormForComparison(trip, form))
  );
}

export function isRegisteredServiceCorrectionDirty(
  trip: RegisteredServiceRecord,
  command: RegisteredServiceCorrectionCommand,
): boolean {
  const current = normalizeTripForComparison(trip);
  const next = normalizeCommandForComparison(command);
  return JSON.stringify(current) !== JSON.stringify(next);
}

function normalizeTripForComparison(trip: RegisteredServiceRecord) {
  return {
    amount: trip.amount,
    payment: trip.payment,
    chargedAmount: trip.payment === PaymentType.CARD ? trip.chargedAmount : null,
    cashTip: trip.payment === PaymentType.CASH ? trip.cashTip : null,
    source: trip.source,
    customSource:
      trip.source === TripSource.CUSTOM
        ? normalizeOptionalText(trip.customSource)
        : null,
    startTime: new Date(trip.startTime).toISOString(),
    endTime: trip.endTime ? new Date(trip.endTime).toISOString() : null,
    manualPickupZone: normalizeOptionalText(trip.manualPickupZone),
    manualDropoffZone: normalizeOptionalText(trip.manualDropoffZone),
  };
}

function normalizeCommandForComparison(command: RegisteredServiceCorrectionCommand) {
  return {
    amount: command.amount,
    payment: command.payment,
    chargedAmount:
      command.payment === PaymentType.CARD ? command.chargedAmount : null,
    cashTip: command.payment === PaymentType.CASH ? command.cashTip : null,
    source: command.source,
    customSource:
      command.source === TripSource.CUSTOM
        ? normalizeOptionalText(command.customSource)
        : null,
    startTime: command.startTime.toISOString(),
    endTime: command.endTime.toISOString(),
    manualPickupZone: normalizeOptionalText(command.manualPickupZone),
    manualDropoffZone: normalizeOptionalText(command.manualDropoffZone),
  };
}

function normalizeFormForComparison(
  trip: RegisteredServiceRecord,
  form: RegisteredServiceCorrectionForm,
) {
  const amount = parseComparableDecimalInput(form.amountInput);
  const chargedAmount =
    form.payment === PaymentType.CARD
      ? parseComparableDecimalInput(form.chargedAmountInput)
      : null;
  const cashTotal =
    form.payment === PaymentType.CASH
      ? parseComparableDecimalInput(form.cashTotalReceivedInput)
      : null;
  const cashTip =
    typeof amount === "number" && typeof cashTotal === "number"
      ? cashTotal - amount
      : cashTotal;

  return {
    amount,
    payment: form.payment,
    chargedAmount,
    cashTip,
    source: form.source,
    customSource:
      form.source === TripSource.CUSTOM
        ? normalizeOptionalText(form.customSourceInput)
        : null,
    startTime: normalizeComparableTime(trip.startTime, form.startTimeInput),
    endTime: normalizeComparableEndTime(
      trip.startTime,
      form.startTimeInput,
      form.endTimeInput,
    ),
    manualPickupZone: normalizeOptionalText(form.manualPickupZone),
    manualDropoffZone: normalizeOptionalText(form.manualDropoffZone),
  };
}

function parseComparableDecimalInput(value: string): number | string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = parseDecimalInput(trimmed);
  return parsed === null ? `invalid:${trimmed}` : parsed;
}

function normalizeComparableEndTime(
  baseValue: string,
  startTimeInput: string,
  endTimeInput: string,
): string | null {
  const startTime = parseTimeOnBaseDate(baseValue, startTimeInput);
  const parsed = resolveOvernightAwareEndTime(startTime, baseValue, endTimeInput);
  if (parsed) return parsed.toISOString();
  const trimmed = endTimeInput.trim();
  return trimmed === "" ? null : `invalid:${trimmed}`;
}

function normalizeComparableTime(baseValue: string, input: string): string | null {
  const parsed = parseTimeOnBaseDate(baseValue, input);
  if (parsed) return parsed.toISOString();
  const trimmed = input.trim();
  return trimmed === "" ? null : `invalid:${trimmed}`;
}

function parseDecimalInput(value: string): number | null {
  return parseMoneyInput(value);
}

function resolveOvernightAwareEndTime(
  startTime: Date | null,
  baseValue: string,
  endTimeInput: string,
): Date | null {
  const endTime = parseTimeOnBaseDate(baseValue, endTimeInput);
  if (!startTime || !endTime) return endTime;

  // Un servicio de taxi no dura más de 24h: si la hora de fin cae "antes"
  // que la de inicio en el mismo día, es que cruza la medianoche.
  if (endTime < startTime) {
    return new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
  }

  return endTime;
}

function parseTimeOnBaseDate(baseValue: string, input: string): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(input.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  const date = new Date(baseValue);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";
  return normalized.length === 0 ? null : normalized;
}

function formatDecimalInput(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} EUR`;
}
