import { TripChronology } from "./TripChronology";
import { TripDomainError } from "./TripDomainError";
import { TripEconomics } from "./TripEconomics";
import { TripServiceClassification } from "./TripServiceClassification";

export type TripStatus =
  | "inProgress"
  | "closedPendingInformation"
  | "completed";

function normalizeIdentity(value: string) {
  const normalized = value.trim();
  if (normalized === "") {
    throw new TripDomainError("Trip identity cannot be empty");
  }
  return normalized;
}

function normalizeWorkdayReference(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized === "" ? null : normalized;
}

type TripConstructionParams = {
  id: string;
  chronology: TripChronology;
  workdayId?: string | null;
  classification?: TripServiceClassification | null;
  economics?: TripEconomics | null;
};

type TripCorrectionParams = {
  startedAt?: Date;
  endedAt?: Date | null;
  workdayId?: string | null;
  classification?: TripServiceClassification | null;
  economics?: TripEconomics | null;
};

export class Trip {
  private readonly identity: string;
  private chronologyValue: TripChronology;
  private workdayIdValue: string | null;
  private classificationValue: TripServiceClassification | null;
  private economicsValue: TripEconomics | null;

  private constructor(params: TripConstructionParams) {
    this.identity = normalizeIdentity(params.id);
    this.chronologyValue = params.chronology;
    this.workdayIdValue = normalizeWorkdayReference(params.workdayId);
    this.classificationValue = params.classification ?? null;
    this.economicsValue = params.economics ?? null;

    this.ensureAggregateStateIsValid();
  }

  static start(params: {
    id: string;
    startedAt: Date;
    workdayId?: string | null;
    classification?: TripServiceClassification | null;
  }) {
    const trip = new Trip({
      id: params.id,
      chronology: TripChronology.start(params.startedAt),
      workdayId: params.workdayId,
      classification: params.classification ?? null,
      economics: null,
    });

    trip.ensureCreatedByStart();

    return trip;
  }

  static registerCompleted(params: {
    id: string;
    startedAt: Date;
    endedAt: Date;
    workdayId?: string | null;
    classification?: TripServiceClassification | null;
    economics?: TripEconomics | null;
  }) {
    const trip = new Trip({
      id: params.id,
      chronology: TripChronology.close(params.startedAt, params.endedAt),
      workdayId: params.workdayId,
      classification: params.classification ?? null,
      economics: params.economics ?? null,
    });

    trip.ensureCreatedByRegisterCompleted();

    return trip;
  }

  get id() {
    return this.identity;
  }

  get workdayId() {
    return this.workdayIdValue;
  }

  get chronology() {
    return this.chronologyValue;
  }

  get classification() {
    return this.classificationValue;
  }

  get economics() {
    return this.economicsValue;
  }

  get status(): TripStatus {
    if (this.chronologyValue.isOpen()) {
      return "inProgress";
    }

    if (this.economicsValue === null) {
      return "closedPendingInformation";
    }

    return "completed";
  }

  isInProgress() {
    return this.status === "inProgress";
  }

  isCompleted() {
    return this.status === "completed";
  }

  finish(endedAt: Date) {
    this.chronologyValue = this.chronologyValue.finish(endedAt);
    this.ensureAggregateStateIsValid();
  }

  completeInformation(params: {
    workdayId?: string | null;
    classification?: TripServiceClassification | null;
    economics?: TripEconomics | null;
  }) {
    if (this.chronologyValue.isOpen() && params.economics !== undefined) {
      throw new TripDomainError(
        "Trip economics cannot be completed while the trip is still open",
      );
    }

    const nextWorkdayId =
      params.workdayId !== undefined
        ? normalizeWorkdayReference(params.workdayId)
        : this.workdayIdValue;

    const nextClassification =
      params.classification !== undefined
        ? params.classification
        : this.classificationValue;

    const nextEconomics =
      params.economics !== undefined ? params.economics : this.economicsValue;

    this.ensureStateIsValid(this.chronologyValue, nextEconomics);

    this.workdayIdValue = nextWorkdayId;
    this.classificationValue = nextClassification;
    this.economicsValue = nextEconomics;
  }

  correct(params: TripCorrectionParams) {
    const nextChronology = this.chronologyValue.correct({
      startedAt: params.startedAt,
      endedAt: params.endedAt,
    });

    const nextWorkdayId =
      params.workdayId !== undefined
        ? normalizeWorkdayReference(params.workdayId)
        : this.workdayIdValue;

    const nextClassification =
      params.classification !== undefined
        ? params.classification
        : this.classificationValue;

    const nextEconomics =
      params.economics !== undefined ? params.economics : this.economicsValue;

    this.ensureStateIsValid(nextChronology, nextEconomics);

    this.chronologyValue = nextChronology;
    this.workdayIdValue = nextWorkdayId;
    this.classificationValue = nextClassification;
    this.economicsValue = nextEconomics;
  }

  private ensureAggregateStateIsValid() {
    this.ensureStateIsValid(this.chronologyValue, this.economicsValue);
  }

  private ensureCreatedByStart() {
    if (this.status !== "inProgress") {
      throw new TripDomainError(
        "Trip.start must create an in-progress trip",
      );
    }
  }

  private ensureCreatedByRegisterCompleted() {
    if (this.status === "inProgress") {
      throw new TripDomainError(
        "Trip.registerCompleted must create a finished trip",
      );
    }
  }

  private ensureStateIsValid(
    chronology: TripChronology,
    economics: TripEconomics | null,
  ) {
    const status = this.resolveStatusFromState(chronology, economics);

    switch (status) {
      case "inProgress":
        if (!chronology.isOpen()) {
          throw new TripDomainError(
            "An in-progress trip must remain open",
          );
        }

        if (economics !== null) {
          throw new TripDomainError(
            "An in-progress trip cannot contain economics information",
          );
        }

        return;

      case "closedPendingInformation":
        if (!chronology.isClosed()) {
          throw new TripDomainError(
            "A finished trip pending information must remain closed",
          );
        }

        if (economics !== null) {
          throw new TripDomainError(
            "A finished trip pending information cannot contain economics information",
          );
        }

        return;

      case "completed":
        if (!chronology.isClosed()) {
          throw new TripDomainError(
            "A completed trip must remain closed",
          );
        }

        if (economics === null) {
          throw new TripDomainError(
            "A completed trip must contain economics information",
          );
        }

        return;
    }
  }

  private resolveStatusFromState(
    chronology: TripChronology,
    economics: TripEconomics | null,
  ): TripStatus {
    if (chronology.isOpen()) {
      return "inProgress";
    }

    if (economics === null) {
      return "closedPendingInformation";
    }

    return "completed";
  }
}
