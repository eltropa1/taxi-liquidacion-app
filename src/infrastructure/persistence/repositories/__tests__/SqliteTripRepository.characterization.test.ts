import { PaymentType, TripSource } from "../../../../constants/enums";
import { SqliteTripRepository } from "../SqliteTripRepository";

describe("SqliteTripRepository", () => {
  const createDatabase = () => ({
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 99 }),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    execAsync: jest.fn().mockResolvedValue(undefined),
  });

  it("persists a started trip using the official insert shape", async () => {
    const db = createDatabase();
    const repository = new SqliteTripRepository(db as any);

    const result = await repository.createStartedTrip({
      startedAt: new Date("2026-07-01T08:00:00.000Z"),
      workdayId: 12,
      source: TripSource.TAXI,
    });

    expect(result).toEqual({ id: 99 });
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "INSERT INTO trips (startTime, source, createdAt, workdayId)",
      ),
      [expect.any(String), TripSource.TAXI, expect.any(String), 12],
    );
  });

  it("translates a unique-constraint violation into a friendly already-active error", async () => {
    const db = createDatabase();
    db.runAsync.mockRejectedValueOnce(
      new Error("UNIQUE constraint failed: index 'idx_trips_single_active'"),
    );
    const repository = new SqliteTripRepository(db as any);

    await expect(
      repository.createStartedTrip({
        startedAt: new Date("2026-07-01T08:00:00.000Z"),
        workdayId: 12,
        source: TripSource.TAXI,
      }),
    ).rejects.toThrow(/ya tienes un viaje en curso/i);
  });

  it("rethrows unrelated database errors from createStartedTrip untouched", async () => {
    const db = createDatabase();
    db.runAsync.mockRejectedValueOnce(new Error("disk I/O error"));
    const repository = new SqliteTripRepository(db as any);

    await expect(
      repository.createStartedTrip({
        startedAt: new Date("2026-07-01T08:00:00.000Z"),
        workdayId: 12,
        source: TripSource.TAXI,
      }),
    ).rejects.toThrow("disk I/O error");
  });

  it("persists a manual trip with a completed service state by default", async () => {
    const db = createDatabase();
    const repository = new SqliteTripRepository(db as any);

    await repository.createManualTrip({
      startTime: new Date("2026-07-01T09:00:00.000Z"),
      endTime: new Date("2026-07-01T09:20:00.000Z"),
      amount: 21,
      payment: PaymentType.CASH,
      source: TripSource.CABIFY,
      workdayId: 12,
    });

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO trips (\n        startTime,\n        endTime,\n        serviceStatus,"),
      [
        "2026-07-01T09:00:00.000Z",
        "2026-07-01T09:20:00.000Z",
        "completed",
        21,
        PaymentType.CASH,
        TripSource.CABIFY,
        expect.any(String),
        12,
      ],
    );
  });

  it("updates an edited trip using the legacy write sequence", async () => {
    const db = createDatabase();
    const repository = new SqliteTripRepository(db as any);

    await repository.updateEditedTrip({
      id: 55,
      amount: 21,
      payment: PaymentType.CASH,
      source: TripSource.CABIFY,
      startTime: new Date("2026-07-01T09:00:00.000Z"),
      endTime: new Date("2026-07-01T09:20:00.000Z"),
      manualPickupZone: "016",
      manualDropoffZone: "014",
      customSource: null,
      chargedAmount: null,
      cashTip: null,
    });

    expect(db.runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("UPDATE trips\n      SET manualPickupZone = ?, manualDropoffZone = ?"),
      ["016", "014", 55],
    );
    expect(db.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("UPDATE trips\n      SET startTime = ?, endTime = ?"),
      [
        "2026-07-01T09:00:00.000Z",
        "2026-07-01T09:20:00.000Z",
        55,
      ],
    );
    expect(db.runAsync).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("UPDATE trips\n      SET amount = ?, payment = ?, source = ?, customSource = ?, chargedAmount = ?, cashTip = ?, serviceStatus = ?"),
      [21, PaymentType.CASH, TripSource.CABIFY, null, null, null, "completed", 55],
    );
    expect(db.execAsync).not.toHaveBeenCalled();
  });

  it("updates a service directly through the explicit service write path", async () => {
    const db = createDatabase();
    const repository = new SqliteTripRepository(db as any);

    await repository.updateTripService({
      id: 77,
      serviceStatus: "incomplete",
      source: TripSource.UBER,
      customSource: "Uber",
      amount: null,
      payment: null,
      chargedAmount: null,
      cashTip: null,
    });

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE trips\n      SET amount = ?, payment = ?, source = ?, customSource = ?, chargedAmount = ?, cashTip = ?, serviceStatus = ?"),
      [null, null, TripSource.UBER, "Uber", null, null, "incomplete", 77],
    );
  });

  it("runs trip changes inside a database transaction", async () => {
    const db = createDatabase();
    const repository = new SqliteTripRepository(db as any);

    const result = await repository.runInTransaction(async () => {
      await repository.updateTrip({
        id: 55,
        amount: 21,
        payment: PaymentType.CASH,
        source: TripSource.CABIFY,
        customSource: null,
        chargedAmount: null,
        cashTip: null,
      });

      return "ok";
    });

    expect(result).toBe("ok");
    expect(db.execAsync).toHaveBeenNthCalledWith(
      1,
      "BEGIN IMMEDIATE TRANSACTION;",
    );
    expect(db.execAsync).toHaveBeenNthCalledWith(2, "COMMIT;");
  });

  it("rolls back the transaction when the operation fails", async () => {
    const db = createDatabase();
    const repository = new SqliteTripRepository(db as any);

    await expect(
      repository.runInTransaction(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(db.execAsync).toHaveBeenNthCalledWith(
      1,
      "BEGIN IMMEDIATE TRANSACTION;",
    );
    expect(db.execAsync).toHaveBeenNthCalledWith(2, "ROLLBACK;");
  });
});
