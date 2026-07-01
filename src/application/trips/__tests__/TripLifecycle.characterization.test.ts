import { PaymentType, TripSource } from "../../../constants/enums";
import { Trip, TripServiceClassification } from "../../../domain/trips/canonical";
import {
  configureApplicationRuntime,
  resetApplicationRuntime,
} from "../../runtime";
import {
  configureApplicationPersistence,
  resetApplicationPersistence,
} from "../../ports/persistence";
import { CreateManualTrip } from "../CreateManualTrip";
import { DeleteTrip } from "../DeleteTrip";
import { FinishTrip } from "../FinishTrip";
import { StartTrip } from "../StartTrip";
import { UpdateTrip } from "../UpdateTrip";

describe("Trip lifecycle characterization", () => {
  const createPersistence = () => ({
    tripRepository: {
      createStartedTrip: jest.fn(),
      createManualTrip: jest.fn(),
      findActiveTrip: jest.fn(),
      findCanonicalTripById: jest.fn(),
      updateTrip: jest.fn(),
      updateTripTimes: jest.fn(),
      updateTripManualZones: jest.fn(),
      updateEditedTrip: jest.fn(),
      deleteTrip: jest.fn(),
    },
    workdayRepository: {
      getOpenWorkday: jest.fn(),
      openWorkdayIfNeeded: jest.fn(),
      openWorkday: jest.fn(),
      closeCurrentWorkday: jest.fn(),
      getWorkdayForDate: jest.fn(),
      getWorkdayInfoForDate: jest.fn(),
      assignTripToCurrentWorkday: jest.fn(),
    },
    tripGeoSnapshotRepository: {
      insert: jest.fn(),
      getSnapshotsForTrip: jest.fn(),
      getSnapshotsForWorkday: jest.fn(),
    },
  });

  let persistence: ReturnType<typeof createPersistence>;
  let geoLocationService: { getCurrentLocation: jest.Mock };
  let mockedGeoResolve: jest.Mock;

  beforeEach(() => {
    persistence = createPersistence();
    configureApplicationPersistence(persistence as any);

    geoLocationService = {
      getCurrentLocation: jest.fn(),
    };

    mockedGeoResolve = jest.fn();

    configureApplicationRuntime({
      goalStorage: {
        getGoals: jest.fn(),
        saveGoals: jest.fn(),
      },
      geoLocation: geoLocationService as any,
      geoAdministrativeResolver: {
        resolve: mockedGeoResolve,
      } as any,
      tripCsvExporter: {
        exportCsv: jest.fn(),
      } as any,
    });

    geoLocationService.getCurrentLocation.mockResolvedValue({
      latitude: 40.4168,
      longitude: -3.7038,
      accuracy: 5,
      timestamp: "2026-07-01T12:00:00.000Z",
    });

    mockedGeoResolve.mockReturnValue({
      resolvedAt: "2026-07-01T12:00:00.000Z",
      latitude: 40.4168,
      longitude: -3.7038,
      neighborhood: { id: "016", name: "Sol" },
      district: { id: "01", name: "Centro" },
    } as any);
  });

  afterEach(() => {
    resetApplicationPersistence();
    resetApplicationRuntime();
    jest.clearAllMocks();
  });

  const flushPromises = async () => {
    await new Promise<void>((resolve) => setImmediate(resolve));
    await new Promise<void>((resolve) => setImmediate(resolve));
  };

  describe("StartTrip", () => {
    it("throws when there is no open workday", async () => {
      persistence.workdayRepository.getOpenWorkday.mockResolvedValue(null);

      await expect(StartTrip.execute()).rejects.toThrow(
        "No hay un día de trabajo abierto",
      );
    });

    it("creates an in-progress trip and captures the START geo snapshot in the background", async () => {
      persistence.workdayRepository.getOpenWorkday.mockResolvedValue({
        id: 7,
        startTime: "2026-07-01T08:00:00.000Z",
      });
      persistence.tripRepository.createStartedTrip.mockResolvedValue({
        id: 42,
      });

      await StartTrip.execute();
      await flushPromises();

      expect(persistence.tripRepository.createStartedTrip).toHaveBeenCalledWith(
        expect.objectContaining({
          startedAt: expect.any(Date),
          source: TripSource.TAXI,
          workdayId: 7,
          createdAt: expect.any(Date),
        }),
      );
      expect(geoLocationService.getCurrentLocation).toHaveBeenCalledTimes(1);
      expect(mockedGeoResolve).toHaveBeenCalledWith(40.4168, -3.7038);
      expect(persistence.tripGeoSnapshotRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          tripId: 42,
          kind: "START",
          createdAt: expect.any(String),
        }),
      );
    });
  });

  describe("FinishTrip", () => {
    it("returns without writing when there is no active trip", async () => {
      persistence.tripRepository.findActiveTrip.mockResolvedValue(null);

      await FinishTrip.execute(12.5, PaymentType.CASH, TripSource.TAXI);

      expect(persistence.tripRepository.updateTripTimes).not.toHaveBeenCalled();
      expect(persistence.tripGeoSnapshotRepository.insert).not.toHaveBeenCalled();
    });

    it("completes the active trip, persists it and captures the END geo snapshot", async () => {
      const trip = Trip.start({
        id: "99",
        startedAt: new Date("2026-07-01T10:00:00.000Z"),
        workdayId: "7",
        classification: TripServiceClassification.create({
          platformId: TripSource.TAXI,
          serviceLabel: TripSource.TAXI,
        }),
      });

      persistence.tripRepository.findActiveTrip.mockResolvedValue({
        id: 99,
        startTime: "2026-07-01T10:00:00.000Z",
      });
      persistence.tripRepository.findCanonicalTripById.mockResolvedValue(trip);

      await FinishTrip.execute(12.5, PaymentType.CASH, TripSource.TAXI);

      expect(persistence.tripRepository.updateTripTimes).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 99,
          startTime: expect.any(Date),
          endTime: expect.any(Date),
        }),
      );
      expect(persistence.tripRepository.updateTrip).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 99,
          amount: 12.5,
          payment: PaymentType.CASH,
          source: TripSource.TAXI,
          customSource: null,
        }),
      );
      expect(geoLocationService.getCurrentLocation).toHaveBeenCalledTimes(1);
      expect(mockedGeoResolve).toHaveBeenCalledWith(40.4168, -3.7038);
      expect(persistence.tripGeoSnapshotRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          tripId: 99,
          kind: "END",
        }),
      );
    });
  });

  describe("CreateManualTrip", () => {
    it("uses the workday for the trip date and stores the trip on that workday", async () => {
      persistence.workdayRepository.getWorkdayForDate.mockResolvedValue({
        id: 15,
        startTime: "2026-07-01T00:00:00.000Z",
      });

      await CreateManualTrip.execute({
        startTime: new Date("2026-07-01T12:30:00.000Z"),
        endTime: new Date("2026-07-01T12:45:00.000Z"),
        amount: 18,
        payment: PaymentType.CARD,
        source: TripSource.UBER,
      });

      expect(persistence.tripRepository.createManualTrip).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          amount: 18,
          payment: PaymentType.CARD,
          source: TripSource.UBER,
          workdayId: 15,
          createdAt: expect.any(Date),
        }),
      );
    });

    it("throws when there is no workday for the selected date", async () => {
      persistence.workdayRepository.getWorkdayForDate.mockResolvedValue(null);

      await expect(
        CreateManualTrip.execute({
          startTime: new Date("2026-07-01T12:30:00.000Z"),
          endTime: new Date("2026-07-01T12:45:00.000Z"),
          amount: 18,
          payment: PaymentType.CARD,
          source: TripSource.UBER,
        }),
      ).rejects.toThrow("No existe día de trabajo para esa fecha");
    });
  });

  describe("UpdateTrip", () => {
    it("updates the selected trip through the official repository port", async () => {
      await UpdateTrip.execute(
        33,
        21,
        PaymentType.CASH,
        TripSource.CABIFY,
        undefined,
        undefined,
        undefined,
      );

      expect(persistence.tripRepository.updateTrip).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 33,
          amount: 21,
          payment: PaymentType.CASH,
          source: TripSource.CABIFY,
          customSource: null,
          chargedAmount: null,
          cashTip: null,
        }),
      );
    });
  });

  describe("DeleteTrip", () => {
    it("deletes the selected trip by id", async () => {
      await DeleteTrip.execute(77);

      expect(persistence.tripRepository.deleteTrip).toHaveBeenCalledWith(77);
    });
  });
});
