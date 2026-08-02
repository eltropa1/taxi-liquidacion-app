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
import { ClosedWorkdayEditConfirmationRequiredError } from "../ClosedWorkdayEditConfirmationRequiredError";

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
      voidTrip: jest.fn(),
      stampClosedWorkdayEdit: jest.fn(),
    },
    workdayRepository: {
      getWorkdayById: jest.fn().mockResolvedValue({
        id: 7,
        startTime: "2026-07-01T07:00:00.000Z",
        endTime: null,
        startOdometer: 1000,
        endOdometer: null,
        isClosed: false,
        createdAt: "2026-07-01T07:00:00.000Z",
      }),
    },
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

  it("voids a completed service instead of deleting it, preserving snapshots and attachments", async () => {
    const persistence = createPersistence();
    configureApplicationPersistence(persistence as any);
    configureApplicationRuntime({
      goalStorage: {} as any,
      weekConfigurationStorage: {} as any,
      geoLocation: {} as any,
      geoAdministrativeResolver: {} as any,
      tripCsvExporter: {} as any,
    });

    await expect(DeleteRegisteredServiceRecord.execute(12)).resolves.toEqual({
      voided: true,
    });

    expect(persistence.tripRepository.voidTrip).toHaveBeenCalledWith(
      12,
      expect.any(Date),
    );
    expect(
      persistence.tripGeoSnapshotRepository.deleteSnapshotsForTrip,
    ).not.toHaveBeenCalled();
    expect(
      persistence.recordAttachmentRepository.markOwnerAttachmentsDeleting,
    ).not.toHaveBeenCalled();
  });

  it("requires explicit confirmation before editing a trip in a closed workday", async () => {
    const persistence = createPersistence();
    persistence.workdayRepository.getWorkdayById.mockResolvedValue({
      id: 7,
      startTime: "2026-07-01T07:00:00.000Z",
      endTime: "2026-07-01T20:00:00.000Z",
      startOdometer: 1000,
      endOdometer: 1100,
      isClosed: true,
      createdAt: "2026-07-01T07:00:00.000Z",
    });
    configureApplicationPersistence(persistence as any);

    const command = {
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
    };

    await expect(CorrectRegisteredService.execute(command)).rejects.toThrow(
      ClosedWorkdayEditConfirmationRequiredError,
    );
    expect(persistence.tripRepository.updateEditedTrip).not.toHaveBeenCalled();

    await expect(
      CorrectRegisteredService.execute(command, {
        confirmedClosedWorkdayEdit: true,
      }),
    ).resolves.toEqual({ status: "updated" });

    expect(persistence.tripRepository.stampClosedWorkdayEdit).toHaveBeenCalledWith(
      12,
      expect.any(Date),
    );
  });

  it("requires explicit confirmation before voiding a trip in a closed workday", async () => {
    const persistence = createPersistence();
    persistence.workdayRepository.getWorkdayById.mockResolvedValue({
      id: 7,
      startTime: "2026-07-01T07:00:00.000Z",
      endTime: "2026-07-01T20:00:00.000Z",
      startOdometer: 1000,
      endOdometer: 1100,
      isClosed: true,
      createdAt: "2026-07-01T07:00:00.000Z",
    });
    configureApplicationPersistence(persistence as any);

    await expect(DeleteRegisteredServiceRecord.execute(12)).rejects.toThrow(
      ClosedWorkdayEditConfirmationRequiredError,
    );
    expect(persistence.tripRepository.voidTrip).not.toHaveBeenCalled();

    await expect(
      DeleteRegisteredServiceRecord.execute(12, {
        confirmedClosedWorkdayEdit: true,
      }),
    ).resolves.toEqual({ voided: true });

    expect(persistence.tripRepository.stampClosedWorkdayEdit).toHaveBeenCalledWith(
      12,
      expect.any(Date),
    );
  });

  it("rejects voiding a service that is not completed", async () => {
    const persistence = createPersistence();
    persistence.tripRepository.findTripById.mockResolvedValue({
      ...completedTrip,
      serviceStatus: "incomplete",
    });
    configureApplicationPersistence(persistence as any);

    await expect(DeleteRegisteredServiceRecord.execute(12)).rejects.toThrow(
      "Solo se puede anular un servicio registrado",
    );
    expect(persistence.tripRepository.voidTrip).not.toHaveBeenCalled();
  });
});
