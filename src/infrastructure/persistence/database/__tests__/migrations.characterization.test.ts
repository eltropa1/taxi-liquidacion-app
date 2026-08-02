describe("runMigrations", () => {
  it("adds and backfills serviceStatus for legacy trips", async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    const getAllAsync = jest.fn(async (query: string) => {
      if (query.startsWith("PRAGMA table_info(trips)")) {
        return [
          { name: "id" },
          { name: "startTime" },
          { name: "endTime" },
          { name: "amount" },
          { name: "payment" },
          { name: "source" },
          { name: "createdAt" },
          { name: "workdayId" },
        ];
      }

      if (query.startsWith("PRAGMA table_info(workdays)")) {
        return [
          { name: "id" },
          { name: "startTime" },
          { name: "endTime" },
          { name: "isClosed" },
          { name: "createdAt" },
        ];
      }

      if (query.includes("SELECT * FROM trips")) {
        return [];
      }

      return [];
    });

    jest.resetModules();
    jest.doMock("../database", () => ({
      getDatabase: () => ({
        execAsync,
        getAllAsync,
      }),
    }));

    const { runMigrations } = await import("../migrations");
    await runMigrations();

    expect(execAsync).toHaveBeenCalledWith(
      "PRAGMA busy_timeout = 5000;",
    );
    expect(execAsync).toHaveBeenCalledWith(
      "BEGIN IMMEDIATE TRANSACTION;",
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("ALTER TABLE trips ADD COLUMN serviceStatus TEXT;"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("SET serviceStatus = CASE"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS record_notes"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS record_attachments"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE INDEX IF NOT EXISTS idx_record_attachments_owner"),
    );
    expect(execAsync).toHaveBeenCalledWith("COMMIT;");
    expect(execAsync).not.toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS services"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE UNIQUE INDEX IF NOT EXISTS idx_workdays_single_open"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE UNIQUE INDEX IF NOT EXISTS idx_trips_single_active"),
    );
  });

  it("auto-closes duplicate open workdays and duplicate active trips before enforcing uniqueness", async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    const getAllAsync = jest.fn(async (query: string) => {
      if (query.startsWith("PRAGMA table_info(trips)")) {
        return [{ name: "id" }, { name: "startTime" }, { name: "workdayId" }];
      }

      if (query.startsWith("PRAGMA table_info(workdays)")) {
        return [{ name: "id" }, { name: "startTime" }, { name: "isClosed" }];
      }

      if (query.includes("SELECT * FROM trips")) {
        return [];
      }

      if (query.includes("FROM workdays WHERE isClosed = 0")) {
        return [
          { id: 9, startTime: "2026-07-02T06:00:00.000Z" },
          { id: 3, startTime: "2026-07-01T06:00:00.000Z" },
        ];
      }

      if (query.includes("FROM trips\n      WHERE endTime IS NULL")) {
        return [
          { id: 55, startTime: "2026-07-02T09:00:00.000Z" },
          { id: 21, startTime: "2026-07-01T09:00:00.000Z" },
        ];
      }

      return [];
    });

    jest.resetModules();
    jest.doMock("../database", () => ({
      getDatabase: () => ({ execAsync, getAllAsync }),
    }));

    const { runMigrations } = await import("../migrations");
    await runMigrations();

    // Se conserva abierta la jornada 9 (la más reciente) y se cierra la 3.
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE workdays[\s\S]*WHERE id = 3;/),
    );
    expect(execAsync).not.toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE workdays[\s\S]*WHERE id = 9;/),
    );

    // Se conserva activo el viaje 55 (el más reciente) y se cierra el 21.
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE trips[\s\S]*WHERE id = 21;/),
    );
    expect(execAsync).not.toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE trips[\s\S]*WHERE id = 55;/),
    );

    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE UNIQUE INDEX IF NOT EXISTS idx_workdays_single_open"),
    );
    expect(execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE UNIQUE INDEX IF NOT EXISTS idx_trips_single_active"),
    );
    expect(execAsync).toHaveBeenCalledWith("COMMIT;");
  });
});
