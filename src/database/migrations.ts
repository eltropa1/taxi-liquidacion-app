import { getDatabase } from "./database";

/**
 * Ejecuta las migraciones necesarias.
 * Se debe llamar UNA VEZ al arrancar la app.
 *
 * IMPORTANTE:
 * - Todas las migraciones deben ser SEGURAS
 * - Nunca deben borrar datos existentes
 */
export async function runMigrations() {
  const db = await getDatabase();

  // =========================
  // TABLA: locations
  // =========================
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // =========================
  // TABLA: trips
  // =========================
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

  // Tabla workdays (días de trabajo)
  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS workdays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    startTime TEXT NOT NULL,
    endTime TEXT,
    isClosed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  );
`);

  // =====================================================
  // NUEVO: TABLA workdays (días reales de trabajo)
  // =====================================================
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workdays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startTime TEXT NOT NULL,
      endTime TEXT,
      isClosed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  // =====================================================
  // NUEVO: añadir workdayId a trips (si no existe)
  // =====================================================

  // =====================================================
// COMPROBAMOS COLUMNAS EXISTENTES EN trips
// =====================================================
const columns = await db.getAllAsync<{ name: string }>(
  `PRAGMA table_info(trips);`
);

// =====================================================
// NUEVO: chargedAmount
// =====================================================
const hasChargedAmount = columns.some(
  (column) => column.name === "chargedAmount"
);

if (!hasChargedAmount) {
  await db.execAsync(`
    ALTER TABLE trips ADD COLUMN chargedAmount REAL;
  `);
}

// =====================================================
// NUEVO: workdayId
// =====================================================
const hasWorkdayId = columns.some(
  (column) => column.name === "workdayId"
);

if (!hasWorkdayId) {
  await db.execAsync(`
    ALTER TABLE trips ADD COLUMN workdayId INTEGER;
  `);
}

// =====================================================
// NUEVO: customSource
// =====================================================
const hasCustomSource = columns.some(
  (column) => column.name === "customSource"
);

if (!hasCustomSource) {
  await db.execAsync(`
    ALTER TABLE trips ADD COLUMN customSource TEXT;
  `);
}

// =====================================================
// NUEVO: añadir cashTip a trips (si no existe)
// =====================================================

const hasCashTip = columns.some(
  (column) => column.name === "cashTip"
);

if (!hasCashTip) {
  await db.execAsync(`
    ALTER TABLE trips ADD COLUMN cashTip REAL;
  `);
}


}
