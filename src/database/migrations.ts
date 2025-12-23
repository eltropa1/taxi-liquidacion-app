import { getDatabase } from './database';

/**
 * Ejecuta las migraciones necesarias.
 * Se debe llamar UNA VEZ al arrancar la app.
 */
export async function runMigrations() {
  const db = await getDatabase();

  // Tabla locations
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // Tabla trips
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
      notes TEXT
    );
  `);
}
