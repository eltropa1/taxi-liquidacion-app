import { getDatabase } from "./database";
import { TRIP_GEO_SNAPSHOTS_SCHEMA } from "./schema";

export async function runMigrations() {
  const db = getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startTime TEXT NOT NULL,
      endTime TEXT,
      pickupLocationId INTEGER,
      pickupCustomText TEXT,
      destinationLocationId INTEGER,
      destinationCustomText TEXT,
      rate TEXT,
      source TEXT NOT NULL,
      amount REAL,
      payment TEXT,
      createdAt TEXT NOT NULL,
      ticketPhotoUri TEXT,
      notes TEXT,
      workdayId INTEGER
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workdays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startTime TEXT NOT NULL,
      endTime TEXT,
      isClosed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(trips);`,
  );

  const ensureColumn = async (columnName: string, statement: string) => {
    const hasColumn = columns.some((column) => column.name === columnName);
    if (!hasColumn) {
      await db.execAsync(statement);
    }
  };

  await ensureColumn("chargedAmount", `ALTER TABLE trips ADD COLUMN chargedAmount REAL;`);
  await ensureColumn("workdayId", `ALTER TABLE trips ADD COLUMN workdayId INTEGER;`);
  await ensureColumn("customSource", `ALTER TABLE trips ADD COLUMN customSource TEXT;`);
  await ensureColumn("cashTip", `ALTER TABLE trips ADD COLUMN cashTip REAL;`);
  await ensureColumn(
    "manualPickupZone",
    `ALTER TABLE trips ADD COLUMN manualPickupZone TEXT;`,
  );
  await ensureColumn(
    "manualDropoffZone",
    `ALTER TABLE trips ADD COLUMN manualDropoffZone TEXT;`,
  );

  await db.execAsync(TRIP_GEO_SNAPSHOTS_SCHEMA);

  const tripsWithoutWorkday = await db.getAllAsync<any>(`
    SELECT * FROM trips
    WHERE workdayId IS NULL
    ORDER BY startTime ASC;
  `);

  if (tripsWithoutWorkday.length === 0) {
    return;
  }

  const grouped: Record<string, any[]> = {};

  for (const trip of tripsWithoutWorkday) {
    const dateKey = trip.startTime.substring(0, 10);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(trip);
  }

  for (const dateKey of Object.keys(grouped)) {
    const dayTrips = grouped[dateKey];
    dayTrips.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    const firstTrip = dayTrips[0];
    const lastTrip = dayTrips[dayTrips.length - 1];
    const startTime = firstTrip.startTime;
    const endTime = lastTrip.endTime ?? lastTrip.startTime;
    const now = new Date().toISOString();

    await db.execAsync(`
      INSERT INTO workdays (startTime, endTime, isClosed, createdAt)
      VALUES ('${startTime}', '${endTime}', 1, '${now}');
    `);

    const insertedId = await db.getAllAsync<{ id: number }>(
      `SELECT last_insert_rowid() as id;`,
    );

    const workdayId = insertedId[0].id;

    for (const trip of dayTrips) {
      await db.execAsync(`
        UPDATE trips
        SET workdayId = ${workdayId}
        WHERE id = ${trip.id};
      `);
    }
  }
}
