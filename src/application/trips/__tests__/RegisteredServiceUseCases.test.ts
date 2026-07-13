import { PaymentType, TripSource } from "../../../constants/enums";
import {
  configureApplicationPersistence,
  resetApplicationPersistence,
} from "../../ports/persistence";
import {
  configureApplicationRuntime,
  resetApplicationRuntime,
} from "../../runtime";
import { CorrectRegisteredService } from "../CorrectRegisteredService";
import { DeleteRegisteredServiceRecord } from "../DeleteRegisteredServiceRecord";

const completedTrip = {
  id: 12,
  startTime: "2026-07-01T08:00:00.000Z",
  endTime: "2026-07-01T08:15:00.000Z",
  serviceStatus: "completed" as const,
  amount: 10,
  payment: PaymentType.CASH,
  source: TripSource.TAXI,
  customSource: null,
  chargedAmount: null,
  cashTip: 2,
  manualPickupZone: null,
  manualDropoffZone: null,
  workdayId: 7,
};

function createPersistence() {
  return {
    tripRepository: {
      runInTransaction: jest.fn(async (operation: () => Promise<void>) =>
        operation(),
      ),
      findTripById: jest.fn().mockResolvedValue(completedTrip),
      updateEditedTrip: jest.fn(),
      deleteTrip: jest.fn(),
    },
    workdayRepository: {},
    tripGeoSnapshotRepository: {
      deleteSnapshotsForTrip: jest.fn(),
    },
    recordNoteRepository: {
      deleteByOwner: jest.fn(),
    },
    recordAttachmentRepository: {
      listByOwner: jest.fn().mockResolvedValue([]),
      markOwnerAttachmentsDeleting: jest.fn().mockResolvedValue(0),
      deleteMetadata: jest.fn(),
    },
  };
}

describe("registered service use cases", () => {
  afterEach(() => {
    resetApplicationPersistence();
    resetApplicationRuntime();
  });

  it("updates a completed service in one transaction and preserves completed status", async () => {
    const persistence = createPersistence();
    configureApplicationPersistence(persistence as any);

    await expect(
      CorrectRegisteredService.execute({
        id: 12,
        amount: 11,
        payment: PaymentType.CARD,
        chargedAmount: 11,
        cashTip: null,
        source: TripSource.CABIFY,
        customSource: null,
        startTime: new Date("2026-07-01T08:05:00.000Z"),
        endTime: new Date("2026-07-01T08:25:00.000Z"),
        manualPickupZone: "016",
        manualDropoffZone: null,
      }),
    ).resolves.toEqual({ status: "updated" });

    expect(persistence.tripRepository.runInTransaction).toHaveBeenCalledTimes(1);
    expect(persistence.tripRepository.updateEditedTrip).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 12,
        serviceStatus: "completed",
      }),
    );
  });

  it("returns unchanged and does not update when the command is semantically equal", async () => {
    const persistence = createPersistence();
    configureApplicationPersistence(persistence as any);

    await expect(
      CorrectRegisteredService.execute({
        id: 12,
        amount: 10,
        payment: PaymentType.CASH,
        chargedAmount: null,
        cashTip: 2,
        source: TripSource.TAXI,
        customSource: null,
        startTime: new Date("2026-07-01T08:00:00.000Z"),
        endTime: new Date("2026-07-01T08:15:00.000Z"),
        manualPickupZone: null,
        manualDropoffZone: null,
      }),
    ).resolves.toEqual({ status: "unchanged" });

    expect(persistence.tripRepository.updateEditedTrip).not.toHaveBeenCalled();
  });

  it("rejects pending services", async () => {
    const persistence = createPersistence();
    persistence.tripRepository.findTripById.mockResolvedValue({
      ...completedTrip,
      serviceStatus: "incomplete",
    });
    configureApplicationPersistence(persistence as any);

    await expect(
      CorrectRegisteredService.execute({
        id: 12,
        amount: 10,
        payment: PaymentType.CASH,
        chargedAmount: null,
        cashTip: null,
        source: TripSource.TAXI,
        customSource: null,
        startTime: new Date("2026-07-01T08:00:00.000Z"),
        endTime: new Date("2026-07-01T08:15:00.000Z"),
        manualPickupZone: null,
        manualDropoffZone: null,
      }),
    ).rejects.toThrow("Solo se puede corregir un servicio registrado");
  });

  it("deletes snapshots and trip while filesystem cleanup failure remains non-blocking", async () => {
    const persistence = createPersistence();
    persistence.recordAttachmentRepository.listByOwner.mockResolvedValue([
      {
        id: "att-1",
        ownerType: "registered_service",
        ownerId: "12",
        attachmentKind: "document",
        mimeType: "application/pdf",
        originalName: "ticket.pdf",
        storageKey: "attachments/registered_service/12/att-1.pdf",
        sizeBytes: 1,
        createdAt: "2026-07-01T08:00:00.000Z",
        status: "ready",
        source: "document",
        description: null,
      },
    ]);
    configureApplicationPersistence(persistence as any);
    configureApplicationRuntime({
      goalStorage: {} as any,
      weekConfigurationStorage: {} as any,
      geoLocation: {} as any,
      geoAdministrativeResolver: {} as any,
      tripCsvExporter: {} as any,
      attachmentFileStorage: {
        delete: jest.fn().mockRejectedValue(new Error("fs failed")),
      } as any,
    });

    await expect(DeleteRegisteredServiceRecord.execute(12)).resolves.toEqual({
      deleted: true,
      enrichmentCleanupPending: true,
      pendingAttachmentIds: ["att-1"],
    });

    expect(persistence.tripRepository.runInTransaction).toHaveBeenCalledTimes(1);
    expect(
      persistence.tripGeoSnapshotRepository.deleteSnapshotsForTrip,
    ).toHaveBeenCalledWith(12);
    expect(persistence.tripRepository.deleteTrip).toHaveBeenCalledWith(12);
    expect(
      persistence.recordAttachmentRepository.markOwnerAttachmentsDeleting,
    ).toHaveBeenCalledWith({
      ownerType: "registered_service",
      ownerId: "12",
    });
  });
});
