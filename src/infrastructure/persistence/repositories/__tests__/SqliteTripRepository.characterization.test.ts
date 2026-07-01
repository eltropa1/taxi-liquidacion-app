import { PaymentType, TripSource } from "../../../../constants/enums";
import { SqliteTripRepository } from "../SqliteTripRepository";

describe("SqliteTripRepository", () => {
  const createDatabase = () => ({
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 99 }),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    execAsync: jest.fn(),
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
      expect.stringContaining("INSERT INTO trips (startTime, source, createdAt, workdayId)"),
      [expect.any(String), TripSource.TAXI, expect.any(String), 12],
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
      expect.stringContaining("UPDATE trips\n      SET amount = ?, payment = ?, source = ?, customSource = ?, chargedAmount = ?, cashTip = ?"),
      [21, PaymentType.CASH, TripSource.CABIFY, null, null, null, 55],
    );
  });
});
