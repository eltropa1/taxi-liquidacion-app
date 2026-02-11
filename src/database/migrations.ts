import { getDatabase } from "./database";
import {
  WORKDAYS_SCHEMA,
  ADD_WORKDAY_TO_TRIPS_SCHEMA,
  TRIP_GEO_SNAPSHOTS_SCHEMA,
} from "./schema";


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

// =====================================================
// NUEVO: zonas manuales (edición de viaje)
// =====================================================

// Zona de recogida manual
const hasManualPickupZone = columns.some(
  (column) => column.name === "manualPickupZone"
);

if (!hasManualPickupZone) {
  await db.execAsync(`
    ALTER TABLE trips ADD COLUMN manualPickupZone TEXT;
  `);
}

// Zona de destino manual
const hasManualDropoffZone = columns.some(
  (column) => column.name === "manualDropoffZone"
);

if (!hasManualDropoffZone) {
  await db.execAsync(`
    ALTER TABLE trips ADD COLUMN manualDropoffZone TEXT;
  `);
}


// =====================================================
// NUEVO: TABLA trip_geo_snapshots (GEO)
// =====================================================
await db.execAsync(TRIP_GEO_SNAPSHOTS_SCHEMA);

  // =====================================================
  // FASE 2 — MIGRACIÓN HISTÓRICA DE TRIPS SIN WORKDAY
  // =====================================================

  // 1️⃣ Obtener trips sin workdayId
  const tripsWithoutWorkday = await db.getAllAsync<any>(`
    SELECT * FROM trips
    WHERE workdayId IS NULL
    ORDER BY startTime ASC;
  `);

  if (tripsWithoutWorkday.length > 0) {
    console.log("FASE 2 → Trips a migrar:", tripsWithoutWorkday.length);

    // Agrupar por día natural
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
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime()
      );

      const firstTrip = dayTrips[0];
      const lastTrip = dayTrips[dayTrips.length - 1];

      const startTime = firstTrip.startTime;
      const endTime = lastTrip.endTime ?? lastTrip.startTime;
      const now = new Date().toISOString();

      // Crear workday retrospectivo cerrado
      await db.execAsync(`
        INSERT INTO workdays (startTime, endTime, isClosed, createdAt)
        VALUES ('${startTime}', '${endTime}', 1, '${now}');
      `);

      // Obtener ID seguro
      const insertedId = await db.getAllAsync<{ id: number }>(`
        SELECT last_insert_rowid() as id;
      `);

      const workdayId = insertedId[0].id;

      // Asignar workdayId a todos los trips del día
      for (const trip of dayTrips) {
        await db.execAsync(`
          UPDATE trips
          SET workdayId = ${workdayId}
          WHERE id = ${trip.id};
        `);
      }

      console.log(`FASE 2 → Migrado día ${dateKey} → workdayId ${workdayId}`);
    }

    console.log("FASE 2 → Migración completada.");
  } else {
    console.log("FASE 2 → No hay trips para migrar.");
  }





}
