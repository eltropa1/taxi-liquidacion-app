export type WorkdayOdometerValidationError =
  | "START_ODOMETER_REQUIRED"
  | "START_ODOMETER_INVALID"
  | "END_ODOMETER_INVALID"
  | "END_ODOMETER_BEFORE_START";

export type WorkdayOdometerValidationResult =
  | { ok: true }
  | { ok: false; error: WorkdayOdometerValidationError };

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

export function parsePositiveIntegerInput(value: string): number | null {
  const trimmed = value.trim();
  if (!POSITIVE_INTEGER_PATTERN.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function validateWorkdayOdometers(
  startOdometer: number | null | undefined,
  endOdometer: number | null | undefined,
): WorkdayOdometerValidationResult {
  if (startOdometer === null || startOdometer === undefined) {
    return { ok: false, error: "START_ODOMETER_REQUIRED" };
  }

  if (!Number.isInteger(startOdometer) || startOdometer <= 0) {
    return { ok: false, error: "START_ODOMETER_INVALID" };
  }

  if (endOdometer === null || endOdometer === undefined) {
    return { ok: true };
  }

  if (!Number.isInteger(endOdometer) || endOdometer <= 0) {
    return { ok: false, error: "END_ODOMETER_INVALID" };
  }

  if (endOdometer < startOdometer) {
    return { ok: false, error: "END_ODOMETER_BEFORE_START" };
  }

  return { ok: true };
}

export function calculateWorkdayKilometers(
  startOdometer: number | null | undefined,
  endOdometer: number | null | undefined,
): number | null {
  if (startOdometer === null || startOdometer === undefined) {
    return null;
  }

  if (endOdometer === null || endOdometer === undefined) {
    return null;
  }

  return endOdometer - startOdometer;
}
