import { SqliteWorkdayRepository } from "../SqliteWorkdayRepository";

describe("SqliteWorkdayRepository", () => {
  const createDatabase = () => ({
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 44 }),
    getFirstAsync: jest
      .fn()
      .mockResolvedValue({
        id: 44,
        startTime: "2026-07-01T08:00:00.000Z",
        endTime: null,
        startOdometer: 1200,
        endOdometer: null,
        isClosed: 0,
        createdAt: "2026-07-01T08:00:00.000Z",
      }),
    getAllAsync: jest.fn(),
    execAsync: jest.fn(),
  });

  it("closes the current workday using the official update shape", async () => {
    const db = createDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    await repository.closeCurrentWorkday(1300);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "UPDATE workdays\n        SET endTime = ?, endOdometer = ?, isClosed = 1\n        WHERE isClosed = 0",
      ),
      [expect.any(String), 1300],
    );
  });

  it("creates an open workday with a mandatory start odometer", async () => {
    const db = createDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    const workday = await repository.openWorkday(1200);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "INSERT INTO workdays (startTime, startOdometer, endOdometer, createdAt)",
      ),
      [expect.any(String), 1200, expect.any(String)],
    );
    expect(workday).toEqual({
      id: 44,
      startTime: "2026-07-01T08:00:00.000Z",
      endTime: null,
      startOdometer: 1200,
      endOdometer: null,
      isClosed: 0,
      createdAt: "2026-07-01T08:00:00.000Z",
    });
  });

  it("updates the end odometer only when it is missing", async () => {
    const db = createDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    await repository.setEndOdometerIfMissing({ id: 7, endOdometer: 1333 });

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "UPDATE workdays\n      SET endOdometer = ?\n      WHERE id = ? AND endOdometer IS NULL",
      ),
      [1333, 7],
    );
  });

  it("returns the most recent workday with odometers", async () => {
    const db = createDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    await repository.getMostRecentWorkday();

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt",
      ),
    );
  });
});
