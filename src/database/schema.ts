/**
 * Tabla de días de trabajo.
 * Un día de trabajo puede cruzar medianoche.
 */
export const WORKDAYS_TABLE = "workdays";

/**
 * Esquema de la tabla workdays
 * Representa una jornada real de trabajo del taxista.
 */
export const WORKDAYS_SCHEMA = `
CREATE TABLE IF NOT EXISTS workdays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  startTime TEXT NOT NULL,       -- Inicio del día de trabajo
  endTime TEXT,                  -- Fin del día (null si sigue abierto)
  isClosed INTEGER NOT NULL DEFAULT 0, -- 0 = abierto, 1 = cerrado
  createdAt TEXT NOT NULL
);
`;

/**
 * Añade la relación entre viajes y días de trabajo
 */
export const ADD_WORKDAY_TO_TRIPS_SCHEMA = `
ALTER TABLE trips ADD COLUMN workdayId INTEGER;
`;

/**
 * Tabla de snapshots geográficos de viajes.
 * Representa capturas puntuales de GPS (inicio / fin de viaje).
 */
export const TRIP_GEO_SNAPSHOTS_TABLE = "trip_geo_snapshots";

/**
 * Esquema de la tabla trip_geo_snapshots
 */
export const TRIP_GEO_SNAPSHOTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS trip_geo_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('START', 'END')),
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestamp TEXT NOT NULL,
  zoneId TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
);
`;
