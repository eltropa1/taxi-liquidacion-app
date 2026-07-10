import { TripEconomics } from "../../trips/canonical/TripEconomics";
import { TripServiceClassification } from "../../trips/canonical/TripServiceClassification";

export type ServiceStatus = "incomplete" | "completed";

type ServiceConstructionParams = Readonly<{
  classification?: TripServiceClassification | null;
  economics?: TripEconomics | null;
}>;

export type ServiceCompletionInput = Readonly<{
  classification?: TripServiceClassification | null;
  economics?: TripEconomics | null;
}>;

function normalizeClassification(
  value: TripServiceClassification | null | undefined,
) {
  return value ?? null;
}

function normalizeEconomics(value: TripEconomics | null | undefined) {
  return value ?? null;
}

export class Service {
  private readonly classificationValue: TripServiceClassification | null;
  private readonly economicsValue: TripEconomics | null;

  private constructor(params: ServiceConstructionParams) {
    this.classificationValue = normalizeClassification(params.classification);
    this.economicsValue = normalizeEconomics(params.economics);
    this.ensureStateIsValid();
  }

  static createIncomplete(params: {
    classification?: TripServiceClassification | null;
  } = {}) {
    return new Service({
      classification: params.classification ?? null,
      economics: null,
    });
  }

  static createCompleted(params: {
    classification?: TripServiceClassification | null;
    economics: TripEconomics;
  }) {
    return new Service({
      classification: params.classification ?? null,
      economics: params.economics,
    });
  }

  static fromLegacyState(params: {
    classification?: TripServiceClassification | null;
    economics?: TripEconomics | null;
  }) {
    return new Service({
      classification: params.classification ?? null,
      economics: params.economics ?? null,
    });
  }

  get classification() {
    return this.classificationValue;
  }

  get economics() {
    return this.economicsValue;
  }

  get status(): ServiceStatus {
    return this.economicsValue === null ? "incomplete" : "completed";
  }

  isIncomplete() {
    return this.status === "incomplete";
  }

  isCompleted() {
    return this.status === "completed";
  }

  completeInformation(params: ServiceCompletionInput) {
    const nextClassification =
      params.classification !== undefined
        ? normalizeClassification(params.classification)
        : this.classificationValue;

    const nextEconomics =
      params.economics !== undefined
        ? normalizeEconomics(params.economics)
        : this.economicsValue;

    return new Service({
      classification: nextClassification,
      economics: nextEconomics,
    });
  }

  private ensureStateIsValid() {
    return;
  }
}
