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
  });
});
