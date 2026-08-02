import { TripSource } from "../../../constants/enums";
import { createPersistenceDependencies } from "../createPersistenceDependencies";

describe("createPersistenceDependencies", () => {
  it("builds repositories that use the provided database connection", async () => {
    const db = {
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 11 }),
      getFirstAsync: jest.fn(async (query: string) => {
        if (query.includes("FROM record_notes")) {
          return {
            id: 1,
            ownerType: "registered_service",
            ownerId: "11",
            body: "note",
            createdAt: "2026-07-01T08:00:00.000Z",
            updatedAt: "2026-07-01T08:00:00.000Z",
          };
        }

        return {
          id: 11,
          startTime: "2026-07-01T08:00:00.000Z",
        };
      }),
      getAllAsync: jest.fn().mockResolvedValue([]),
      execAsync: jest.fn().mockResolvedValue(undefined),
    };

    const dependencies = await createPersistenceDependencies(db as any);

    await dependencies.tripRepository.createStartedTrip({
      startedAt: new Date("2026-07-01T08:00:00.000Z"),
      workdayId: 7,
      source: TripSource.TAXI,
    });

    await dependencies.workdayRepository.closeCurrentWorkday();

    await dependencies.tripGeoSnapshotRepository.insert({
      tripId: 11,
      kind: "START",
      snapshot: {} as any,
      createdAt: "2026-07-01T08:00:00.000Z",
    });

    await dependencies.recordNoteRepository.upsert({
      owner: { ownerType: "registered_service", ownerId: "11" },
      body: "note",
      createdAt: "2026-07-01T08:00:00.000Z",
      updatedAt: "2026-07-01T08:00:00.000Z",
    });

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO trips (startTime, source, createdAt, workdayId)"),
      [expect.any(String), TripSource.TAXI, expect.any(String), 7],
    );

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE workdays"),
      [expect.any(String), null, 11],
    );

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO trip_geo_snapshots"),
      [11, "START", "{}", "2026-07-01T08:00:00.000Z"],
    );

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO record_notes"),
      [
        "registered_service",
        "11",
        "note",
        "2026-07-01T08:00:00.000Z",
        "2026-07-01T08:00:00.000Z",
      ],
    );
  });
});
