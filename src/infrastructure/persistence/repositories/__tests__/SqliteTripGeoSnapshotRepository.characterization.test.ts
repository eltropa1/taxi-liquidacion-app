import { SqliteTripGeoSnapshotRepository } from "../SqliteTripGeoSnapshotRepository";

describe("SqliteTripGeoSnapshotRepository", () => {
  const createDatabase = () => ({
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 8 }),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn().mockResolvedValue([
      {
        tripId: 8,
        kind: "START",
        snapshot: JSON.stringify({
          neighborhood: { id: "016", name: "Sol" },
        }),
        createdAt: "2026-07-01T08:00:00.000Z",
      },
    ]),
    execAsync: jest.fn(),
  });

  it("stores and restores GEO snapshots without altering the payload", async () => {
    const db = createDatabase();
    const repository = new SqliteTripGeoSnapshotRepository(db as any);

    await repository.insert({
      tripId: 8,
      kind: "START",
      snapshot: {
        neighborhood: { id: "016", name: "Sol" },
      } as any,
      createdAt: "2026-07-01T08:00:00.000Z",
    });

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO trip_geo_snapshots"),
      [8, "START", JSON.stringify({ neighborhood: { id: "016", name: "Sol" } }), "2026-07-01T08:00:00.000Z"],
    );

    const snapshots = await repository.getSnapshotsForTrip(8);

    expect(snapshots).toEqual([
      {
        tripId: 8,
        kind: "START",
        snapshot: { neighborhood: { id: "016", name: "Sol" } },
        createdAt: "2026-07-01T08:00:00.000Z",
      },
    ]);
  });
});
