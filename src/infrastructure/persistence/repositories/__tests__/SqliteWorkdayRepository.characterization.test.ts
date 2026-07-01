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
        isClosed: 0,
        createdAt: "2026-07-01T08:00:00.000Z",
      }),
    getAllAsync: jest.fn(),
    execAsync: jest.fn(),
  });

  it("closes the current workday using the official update shape", async () => {
    const db = createDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    await repository.closeCurrentWorkday();

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "UPDATE workdays\n      SET endTime = ?, isClosed = 1\n      WHERE isClosed = 0",
      ),
      [expect.any(String)],
    );
  });

  it("creates an open workday when none exists", async () => {
    const db = createDatabase();
    db.getFirstAsync
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 44,
        startTime: "2026-07-01T08:00:00.000Z",
        endTime: null,
        isClosed: 0,
        createdAt: "2026-07-01T08:00:00.000Z",
      })
      .mockResolvedValueOnce({
        id: 44,
        startTime: "2026-07-01T08:00:00.000Z",
      });
    const repository = new SqliteWorkdayRepository(db as any);

    const workday = await repository.openWorkdayIfNeeded();

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO workdays (startTime, createdAt)"),
      [expect.any(String), expect.any(String)],
    );
    expect(workday).toEqual({
      id: 44,
      startTime: "2026-07-01T08:00:00.000Z",
    });
  });
});
