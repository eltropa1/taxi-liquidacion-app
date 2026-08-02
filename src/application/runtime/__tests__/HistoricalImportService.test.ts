import {
  configureApplicationPersistence,
  resetApplicationPersistence,
} from "../../ports/persistence";
import { HistoricalImportService } from "../HistoricalImportService";

describe("HistoricalImportService", () => {
  const runInTransaction: any = jest.fn(async (operation: any) => {
    await operation();
  });
  const upsertHistoricalWorkday = jest.fn();
  const upsertHistoricalTrip = jest.fn();

  beforeEach(() => {
    configureApplicationPersistence({
      tripRepository: {
        runInTransaction,
        createStartedTrip: jest.fn(),
        createManualTrip: jest.fn(),
        findActiveTrip: jest.fn(),
        findTripById: jest.fn(),
        findCanonicalTripById: jest.fn(),
        findTripsForWorkday: jest.fn(),
        findTripsForWorkdayIds: jest.fn(),
        findAllTripsForExport: jest.fn(),
        updateTrip: jest.fn(),
        updateTripService: jest.fn(),
        updateTripTimes: jest.fn(),
        updateTripManualZones: jest.fn(),
        updateEditedTrip: jest.fn(),
        voidTrip: jest.fn(),
        stampClosedWorkdayEdit: jest.fn(),
        upsertHistoricalTrip,
      },
      workdayRepository: {
        getOpenWorkday: jest.fn(),
        getWorkdayById: jest.fn(),
        openWorkdayIfNeeded: jest.fn(),
        getMostRecentWorkday: jest.fn(),
        openWorkday: jest.fn(),
        closeCurrentWorkday: jest.fn(),
        updateWorkdayOdometers: jest.fn(),
        setEndOdometerIfMissing: jest.fn(),
        getWorkdayForDate: jest.fn(),
        getWorkdayInfoForDate: jest.fn(),
        findWorkdayIdsBetweenDates: jest.fn(),
        findWorkdaysBetweenDates: jest.fn(),
        assignTripToCurrentWorkday: jest.fn(),
        upsertHistoricalWorkday,
      },
      tripGeoSnapshotRepository: {
        upsert: jest.fn(),
        findByTripId: jest.fn(),
        deleteByTripId: jest.fn(),
      } as any,
      recordNoteRepository: {
        findByOwner: jest.fn(),
        upsert: jest.fn(),
        deleteByOwner: jest.fn(),
      } as any,
      recordAttachmentRepository: {
        findById: jest.fn(),
        listByOwner: jest.fn(),
        countActiveByOwner: jest.fn(),
        insert: jest.fn(),
        updateStatus: jest.fn(),
        updateStatusIfCurrent: jest.fn(),
        deleteMetadata: jest.fn(),
        listByStatus: jest.fn(),
        listAll: jest.fn(),
        markOwnerAttachmentsDeleting: jest.fn(),
      } as any,
    });
  });

  afterEach(() => {
    resetApplicationPersistence();
    jest.clearAllMocks();
  });

  it("rebuilds workdays and trips from the canonical historical CSV export", async () => {
    const csv = [
      "trip_id,workday_id,workday_date,workday_start_at,trip_start_at,trip_end_at,amount,charged_amount,cash_tip,payment,source,service_status",
      "101,7,2025-12-28,2025-12-28T12:46:43.354Z,2025-12-28T13:08:48.515Z,2025-12-28T13:20:00.000Z,12.5,12.5,,CASH,TAXI,completed",
      "102,7,2025-12-28,2025-12-28T12:46:43.354Z,2025-12-28T14:00:00.000Z,2025-12-28T14:15:00.000Z,18,20,2,CARD,UBER,completed",
    ].join("\n");

    const result = await HistoricalImportService.importHistoricalDatasetFromCsv(csv);

    expect(result).toEqual({
      status: "imported",
      workdayCount: 1,
      tripCount: 2,
    });
    expect(runInTransaction).toHaveBeenCalledTimes(1);
    expect(upsertHistoricalWorkday).toHaveBeenCalledTimes(1);
    expect(upsertHistoricalWorkday).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 7,
        isClosed: true,
        startTime: new Date("2025-12-28T12:46:43.354Z"),
        endTime: new Date("2025-12-28T14:15:00.000Z"),
      }),
    );
    expect(upsertHistoricalTrip).toHaveBeenCalledTimes(2);
    expect(upsertHistoricalTrip).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: 101,
        workdayId: 7,
        source: "TAXI",
        payment: "CASH",
        amount: 12.5,
        chargedAmount: 12.5,
        cashTip: null,
      }),
    );
  });

  it("rejects files that do not match the historical export format", async () => {
    await expect(
      HistoricalImportService.importHistoricalDatasetFromCsv("foo,bar\n1,2"),
    ).rejects.toThrow("formato de exportación histórica esperado");
  });
});
