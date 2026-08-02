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

  const createBoundaryDatabase = () => {
    const rows = [
      {
        id: 101,
        startTime: new Date(2026, 6, 19, 22, 0, 0, 0).toISOString(),
        endTime: new Date(2026, 6, 20, 1, 25, 0, 0).toISOString(),
        startOdometer: 1200,
        endOdometer: 1250,
        isClosed: 1,
        createdAt: new Date(2026, 6, 19, 22, 0, 0, 0).toISOString(),
      },
      {
        id: 102,
        startTime: new Date(2026, 6, 20, 1, 25, 0, 0).toISOString(),
        endTime: null,
        startOdometer: 1250,
        endOdometer: null,
        isClosed: 0,
        createdAt: new Date(2026, 6, 20, 1, 25, 0, 0).toISOString(),
      },
    ];

    return {
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 44 }),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn((query: string, params?: string[]) => {
        if (!params || params.length !== 2) {
          return Promise.resolve([]);
        }

        const [start, end] = params;
        const isDatePrefixQuery = query.includes("substr(startTime, 1, 10)");
        const matches = rows.filter((row) => {
          if (isDatePrefixQuery) {
            const dateKey = row.startTime.substring(0, 10);
            return dateKey >= start && dateKey <= end;
          }

          return row.startTime >= start && row.startTime <= end;
        });

        if (query.includes("SELECT id\n      FROM workdays")) {
          return Promise.resolve(matches.map((row) => ({ id: row.id })));
        }

        return Promise.resolve(matches);
      }),
      execAsync: jest.fn(),
    };
  };

  const createAttributionDatabase = () => {
    const rows = [
      {
        id: 44,
        startTime: new Date(2026, 6, 31, 12, 0, 0, 0).toISOString(),
        endTime: new Date(2026, 7, 1, 2, 0, 0, 0).toISOString(),
        startOdometer: 1200,
        endOdometer: 1250,
        isClosed: 1,
        createdAt: new Date(2026, 6, 31, 12, 0, 0, 0).toISOString(),
      },
    ];

    return {
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 44 }),
      getFirstAsync: jest.fn((query: string, params?: string[]) => {
        if (!params || params.length !== 2) {
          return Promise.resolve(rows[0]);
        }

        const [start, end] = params;
        const match = rows.find(
          (row) => row.startTime >= start && row.startTime <= end,
        );

        if (query.includes("SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt")) {
          return Promise.resolve(match ?? null);
        }

        return Promise.resolve(match ?? null);
      }),
      getAllAsync: jest.fn().mockResolvedValue(rows),
      execAsync: jest.fn(),
    };
  };

  it("closes the current workday using the official update shape", async () => {
    const db = createDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    await repository.closeCurrentWorkday(1300, "goal-2");

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "UPDATE workdays\n        SET endTime = ?, endOdometer = ?, goalPolicyId = ?, isClosed = 1\n        WHERE id = ?",
      ),
      [expect.any(String), 1300, "goal-2", 44],
    );
  });

  it("does nothing when there is no open workday to close", async () => {
    const db = createDatabase();
    db.getFirstAsync.mockResolvedValueOnce(null);
    const repository = new SqliteWorkdayRepository(db as any);

    await repository.closeCurrentWorkday(1300, "goal-2");

    expect(db.runAsync).not.toHaveBeenCalled();
  });

  it("closes only the open workday by id, never every open row at once", async () => {
    const db = createDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    await repository.closeCurrentWorkday(null, null);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "UPDATE workdays\n      SET endTime = ?, goalPolicyId = ?, isClosed = 1\n      WHERE id = ?",
      ),
      [expect.any(String), null, 44],
    );
  });

  it("creates an open workday with a mandatory start odometer", async () => {
    const db = createDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    const workday = await repository.openWorkday(1200);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "INSERT INTO workdays (startTime, startOdometer, endOdometer, createdAt, goalPolicyId)",
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

  it("translates a unique-constraint violation into a friendly already-open error", async () => {
    const db = createDatabase();
    db.runAsync.mockRejectedValueOnce(
      new Error("UNIQUE constraint failed: index 'idx_workdays_single_open'"),
    );
    const repository = new SqliteWorkdayRepository(db as any);

    await expect(repository.openWorkday(1200)).rejects.toThrow(
      /ya tienes una jornada abierta/i,
    );
  });

  it("rethrows unrelated database errors from openWorkday untouched", async () => {
    const db = createDatabase();
    db.runAsync.mockRejectedValueOnce(new Error("disk I/O error"));
    const repository = new SqliteWorkdayRepository(db as any);

    await expect(repository.openWorkday(1200)).rejects.toThrow("disk I/O error");
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
        "SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt, goalPolicyId",
      ),
    );
  });

  it("keeps a workday attributed to the opening day even when it closes after midnight in the next month", async () => {
    const db = createAttributionDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    const july31 = new Date(2026, 6, 31, 12, 0, 0, 0);
    const august1 = new Date(2026, 7, 1, 12, 0, 0, 0);
    const expectedStartTime = july31.toISOString();
    const expectedEndTime = new Date(2026, 7, 1, 2, 0, 0, 0).toISOString();

    await expect(repository.getWorkdayInfoForDate(july31)).resolves.toEqual({
      id: 44,
      startTime: expectedStartTime,
      endTime: expectedEndTime,
      startOdometer: 1200,
      endOdometer: 1250,
      isClosed: true,
      createdAt: expectedStartTime,
    });
    await expect(repository.getWorkdayInfoForDate(august1)).resolves.toBeNull();
  });

  it("returns full workday rows for a historical date range", async () => {
    const db = createAttributionDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    await repository.findWorkdaysBetweenDates(
      new Date(2026, 6, 1, 12, 0, 0, 0),
      new Date(2026, 6, 31, 12, 0, 0, 0),
    );

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        "SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt, goalPolicyId",
      ),
      [
        new Date(2026, 6, 1, 0, 0, 0, 0).toISOString(),
        new Date(2026, 6, 31, 23, 59, 59, 999).toISOString(),
      ],
    );
  });

  it("keeps a Monday opening at 01:25 in the following week instead of leaking it into the previous one", async () => {
    const db = createBoundaryDatabase();
    const repository = new SqliteWorkdayRepository(db as any);

    const previousWeekStart = new Date(2026, 6, 13, 12, 0, 0, 0);
    const previousWeekEnd = new Date(2026, 6, 19, 12, 0, 0, 0);
    const nextWeekStart = new Date(2026, 6, 20, 12, 0, 0, 0);
    const nextWeekEnd = new Date(2026, 6, 26, 12, 0, 0, 0);

    await expect(
      repository.findWorkdaysBetweenDates(previousWeekStart, previousWeekEnd),
    ).resolves.toEqual([
      {
        id: 101,
        startTime: new Date(2026, 6, 19, 22, 0, 0, 0).toISOString(),
        endTime: new Date(2026, 6, 20, 1, 25, 0, 0).toISOString(),
        startOdometer: 1200,
        endOdometer: 1250,
        isClosed: true,
        createdAt: new Date(2026, 6, 19, 22, 0, 0, 0).toISOString(),
      },
    ]);

    await expect(
      repository.findWorkdayIdsBetweenDates(previousWeekStart, previousWeekEnd),
    ).resolves.toEqual([{ id: 101 }]);

    await expect(
      repository.findWorkdaysBetweenDates(nextWeekStart, nextWeekEnd),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 102,
        startTime: new Date(2026, 6, 20, 1, 25, 0, 0).toISOString(),
        endTime: null,
        startOdometer: 1250,
        endOdometer: null,
        isClosed: false,
        createdAt: new Date(2026, 6, 20, 1, 25, 0, 0).toISOString(),
      }),
    ]);

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("WHERE startTime BETWEEN ? AND ?"),
      [
        new Date(2026, 6, 13, 0, 0, 0, 0).toISOString(),
        new Date(2026, 6, 19, 23, 59, 59, 999).toISOString(),
      ],
    );
  });
});
