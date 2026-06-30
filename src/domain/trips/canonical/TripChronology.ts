import { TripDomainError } from "./TripDomainError";

function cloneDate(value: Date) {
  return new Date(value.getTime());
}

function ensureValidDate(value: Date, label: string) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TripDomainError(`${label} must be a valid date`);
  }
}

export class TripChronology {
  private constructor(
    private readonly startedAtValue: Date,
    private readonly endedAtValue: Date | null,
  ) {
    ensureValidDate(this.startedAtValue, "Trip start");

    if (this.endedAtValue !== null) {
      ensureValidDate(this.endedAtValue, "Trip end");

      if (this.endedAtValue.getTime() < this.startedAtValue.getTime()) {
        throw new TripDomainError("Trip end cannot be before trip start");
      }
    }
  }

  static start(startedAt: Date) {
    return new TripChronology(cloneDate(startedAt), null);
  }

  static close(startedAt: Date, endedAt: Date) {
    return new TripChronology(cloneDate(startedAt), cloneDate(endedAt));
  }

  get startedAt() {
    return cloneDate(this.startedAtValue);
  }

  get endedAt() {
    return this.endedAtValue ? cloneDate(this.endedAtValue) : null;
  }

  isOpen() {
    return this.endedAtValue === null;
  }

  isClosed() {
    return this.endedAtValue !== null;
  }

  finish(endedAt: Date) {
    if (this.isClosed()) {
      throw new TripDomainError("Trip is already finished");
    }

    return TripChronology.close(this.startedAtValue, endedAt);
  }

  correct(params: { startedAt?: Date; endedAt?: Date | null }) {
    const nextStartedAt =
      params.startedAt !== undefined
        ? cloneDate(params.startedAt)
        : this.startedAtValue;

    let nextEndedAt = this.endedAtValue ? cloneDate(this.endedAtValue) : null;

    if (params.endedAt !== undefined) {
      if (params.endedAt === null && this.isClosed()) {
        throw new TripDomainError("A finished trip cannot be reopened");
      }

      nextEndedAt =
        params.endedAt === null ? null : cloneDate(params.endedAt);
    }

    return new TripChronology(nextStartedAt, nextEndedAt);
  }
}
