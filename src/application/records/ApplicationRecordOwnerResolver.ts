import { createRecordOwner, type RecordOwner } from "../../domain/records";
import type { RecordOwnerResolverPort } from "../ports/runtime";
import { getApplicationPersistence } from "../ports/persistence";

export class ApplicationRecordOwnerResolver implements RecordOwnerResolverPort {
  async exists(owner: RecordOwner): Promise<boolean> {
    const normalizedOwner = createRecordOwner(owner.ownerType, owner.ownerId);

    if (normalizedOwner.ownerType !== "registered_service") {
      return false;
    }

    const id = Number(normalizedOwner.ownerId);
    if (!Number.isInteger(id) || id <= 0) {
      return false;
    }

    const { tripRepository } = getApplicationPersistence();
    const trip = await tripRepository.findTripById(id);
    return trip?.serviceStatus === "completed";
  }
}
