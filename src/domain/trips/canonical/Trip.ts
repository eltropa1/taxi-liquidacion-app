import { TripChronology } from "./TripChronology";
import { TripDomainError } from "./TripDomainError";
import { TripEconomics } from "./TripEconomics";
import { TripServiceClassification } from "./TripServiceClassification";
import { Service } from "../../services/canonical";

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
  service?: Service | null;
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
  private serviceValue: Service | null;

  private constructor(params: TripConstructionParams) {
    this.identity = normalizeIdentity(params.id);
    this.chronologyValue = params.chronology;
    this.workdayIdValue = normalizeWorkdayReference(params.workdayId);
    this.serviceValue =
      params.service !== undefined
        ? params.service
        : Service.fromLegacyState({
            classification: params.classification ?? null,
            economics: params.economics ?? null,
          });

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
      service: null,
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
      service:
        params.economics === undefined || params.economics === null
          ? Service.createIncomplete({
              classification: params.classification ?? null,
            })
          : Service.createCompleted({
              classification: params.classification ?? null,
              economics: params.economics,
            }),
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
    return this.serviceValue?.classification ?? null;
  }

  get economics() {
    return this.serviceValue?.economics ?? null;
  }

  get service() {
    return this.serviceValue;
  }

  get status(): TripStatus {
    if (this.chronologyValue.isOpen()) {
      return "inProgress";
    }

    if (this.serviceValue === null || this.serviceValue.isIncomplete()) {
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
        : this.classification;

    const nextEconomics =
      params.economics !== undefined ? params.economics : this.economics;

    const currentService =
      this.serviceValue ??
      Service.createIncomplete({ classification: this.classification });
    const nextService = currentService.completeInformation({
      classification: nextClassification,
      economics: nextEconomics,
    });

    this.ensureStateIsValid(this.chronologyValue, nextService);

    this.workdayIdValue = nextWorkdayId;
    this.serviceValue = nextService;
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
        : this.classification;

    const nextEconomics =
      params.economics !== undefined ? params.economics : this.economics;

    const currentService =
      this.serviceValue ??
      Service.createIncomplete({ classification: this.classification });
    const nextService = currentService.completeInformation({
      classification: nextClassification,
      economics: nextEconomics,
    });

    this.ensureStateIsValid(nextChronology, nextService);

    this.chronologyValue = nextChronology;
    this.workdayIdValue = nextWorkdayId;
    this.serviceValue = nextService;
  }

  private ensureAggregateStateIsValid() {
    this.ensureStateIsValid(this.chronologyValue, this.serviceValue);
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
    service: Service | null,
  ) {
    const status = this.resolveStatusFromState(chronology, service);

    switch (status) {
      case "inProgress":
        if (!chronology.isOpen()) {
          throw new TripDomainError(
            "An in-progress trip must remain open",
          );
        }

        if (service !== null && service.isCompleted()) {
          throw new TripDomainError(
            "An in-progress trip cannot contain completed service information",
          );
        }

        return;

      case "closedPendingInformation":
        if (!chronology.isClosed()) {
          throw new TripDomainError(
            "A finished trip pending information must remain closed",
          );
        }

        if (service !== null && service.isCompleted()) {
          throw new TripDomainError(
            "A finished trip pending information cannot contain completed service information",
          );
        }

        return;

      case "completed":
        if (!chronology.isClosed()) {
          throw new TripDomainError(
            "A completed trip must remain closed",
          );
        }

        if (service === null || service.isIncomplete()) {
          throw new TripDomainError(
            "A completed trip must contain economics information",
          );
        }

        return;
    }
  }

  private resolveStatusFromState(
    chronology: TripChronology,
    service: Service | null,
  ): TripStatus {
    if (chronology.isOpen()) {
      return "inProgress";
    }

    if (service === null || service.isIncomplete()) {
      return "closedPendingInformation";
    }

    return "completed";
  }
}
