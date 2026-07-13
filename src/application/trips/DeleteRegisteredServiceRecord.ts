import { RecordEnrichmentService } from "../records";
import { getApplicationPersistence } from "../ports/persistence";

export type DeleteRegisteredServiceRecordResult = Readonly<{
  deleted: true;
  enrichmentCleanupPending: boolean;
  pendingAttachmentIds: string[];
}>;

export class DeleteRegisteredServiceRecord {
  static async execute(id: number): Promise<DeleteRegisteredServiceRecordResult> {
    const { tripRepository, tripGeoSnapshotRepository } =
      getApplicationPersistence();
    const trip = await tripRepository.findTripById(id);

    if (!trip) {
      throw new Error("Servicio registrado no encontrado");
    }

    if (trip.serviceStatus !== "completed") {
      throw new Error("Solo se puede eliminar un servicio registrado");
    }

    await tripRepository.runInTransaction(async () => {
      await tripGeoSnapshotRepository.deleteSnapshotsForTrip(id);
      await tripRepository.deleteTrip(id);
    });

    const enrichment = await RecordEnrichmentService.deleteEnrichmentForOwner({
      ownerType: "registered_service",
      ownerId: String(id),
    });

    return {
      deleted: true,
      enrichmentCleanupPending: enrichment.pendingFilesystemCleanup.length > 0,
      pendingAttachmentIds: enrichment.pendingFilesystemCleanup,
    };
  }
}
