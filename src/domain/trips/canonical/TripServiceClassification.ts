import { TripDomainError } from "./TripDomainError";

function normalizeReference(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized === "" ? null : normalized;
}

export class TripServiceClassification {
  private constructor(
    private readonly platformIdValue: string | null,
    private readonly serviceTypeIdValue: string | null,
    private readonly serviceLabelValue: string | null,
  ) {
    if (
      this.platformIdValue === null &&
      this.serviceTypeIdValue === null &&
      this.serviceLabelValue === null
    ) {
      throw new TripDomainError(
        "Trip classification requires at least one classification reference",
      );
    }
  }

  static create(params: {
    platformId?: string | null;
    serviceTypeId?: string | null;
    serviceLabel?: string | null;
  }) {
    return new TripServiceClassification(
      normalizeReference(params.platformId),
      normalizeReference(params.serviceTypeId),
      normalizeReference(params.serviceLabel),
    );
  }

  get platformId() {
    return this.platformIdValue;
  }

  get serviceTypeId() {
    return this.serviceTypeIdValue;
  }

  get serviceLabel() {
    return this.serviceLabelValue;
  }
}
