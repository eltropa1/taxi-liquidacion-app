import { getDatabase } from "./database";
import {
  RECORD_ATTACHMENTS_INDEXES,
  RECORD_ATTACHMENTS_SCHEMA,
  RECORD_NOTES_INDEXES,
  RECORD_NOTES_SCHEMA,
  TRIP_GEO_SNAPSHOTS_SCHEMA,
} from "./schema";

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
      serviceStatus TEXT,
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
      startOdometer INTEGER,
      endOdometer INTEGER,
      isClosed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  const getTableColumns = async (tableName: string) =>
    db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName});`);

  const ensureColumn = async (
    columns: Array<{ name: string }>,
    columnName: string,
    statement: string,
  ) => {
    const hasColumn = columns.some((column) => column.name === columnName);
    if (!hasColumn) {
      await db.execAsync(statement);
    }
  };

  const tripColumns = await getTableColumns("trips");
  const workdayColumns = await getTableColumns("workdays");

  await ensureColumn(tripColumns, "chargedAmount", `ALTER TABLE trips ADD COLUMN chargedAmount REAL;`);
  await ensureColumn(tripColumns, "workdayId", `ALTER TABLE trips ADD COLUMN workdayId INTEGER;`);
  await ensureColumn(tripColumns, "customSource", `ALTER TABLE trips ADD COLUMN customSource TEXT;`);
  await ensureColumn(tripColumns, "cashTip", `ALTER TABLE trips ADD COLUMN cashTip REAL;`);
  await ensureColumn(tripColumns, "serviceStatus", `ALTER TABLE trips ADD COLUMN serviceStatus TEXT;`);
  await ensureColumn(
    workdayColumns,
    "startOdometer",
    `ALTER TABLE workdays ADD COLUMN startOdometer INTEGER;`,
  );
  await ensureColumn(
    workdayColumns,
    "endOdometer",
    `ALTER TABLE workdays ADD COLUMN endOdometer INTEGER;`,
  );
  await ensureColumn(
    tripColumns,
    "manualPickupZone",
    `ALTER TABLE trips ADD COLUMN manualPickupZone TEXT;`,
  );
  await ensureColumn(
    tripColumns,
    "manualDropoffZone",
    `ALTER TABLE trips ADD COLUMN manualDropoffZone TEXT;`,
  );

  await db.execAsync(`
    UPDATE trips
    SET serviceStatus = CASE
      WHEN endTime IS NULL THEN NULL
      WHEN amount IS NOT NULL AND payment IS NOT NULL THEN 'completed'
      ELSE 'incomplete'
    END
    WHERE serviceStatus IS NULL;
  `);

  await db.execAsync(TRIP_GEO_SNAPSHOTS_SCHEMA);
  await db.execAsync(RECORD_NOTES_SCHEMA);
  await db.execAsync(RECORD_NOTES_INDEXES);
  await db.execAsync(RECORD_ATTACHMENTS_SCHEMA);
  await db.execAsync(RECORD_ATTACHMENTS_INDEXES);

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
      INSERT INTO workdays (startTime, endTime, startOdometer, endOdometer, isClosed, createdAt)
      VALUES ('${startTime}', '${endTime}', NULL, NULL, 1, '${now}');
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
