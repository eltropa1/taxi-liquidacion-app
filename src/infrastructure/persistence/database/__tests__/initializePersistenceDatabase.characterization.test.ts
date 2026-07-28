describe("initializePersistenceDatabase", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("reuses the in-flight initialization promise", async () => {
    let releaseMigration: (() => void) | undefined;

    const runMigrations = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          releaseMigration = resolve;
        }),
    );
    const getPersistenceDatabase = jest.fn(() => ({ database: true }));

    jest.doMock("../migrations", () => ({
      runMigrations,
    }));

    jest.doMock("../getPersistenceDatabase", () => ({
      getPersistenceDatabase,
    }));

    const { initializePersistenceDatabase } = await import("../initializePersistenceDatabase");

    const first = initializePersistenceDatabase();
    const second = initializePersistenceDatabase();

    expect(first).toBe(second);
    expect(runMigrations).toHaveBeenCalledTimes(1);

    if (releaseMigration) {
      releaseMigration();
    }

    await expect(first).resolves.toEqual({ database: true });
    expect(getPersistenceDatabase).toHaveBeenCalledTimes(1);
  });
});
