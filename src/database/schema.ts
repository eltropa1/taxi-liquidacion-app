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
 * Snapshots GEO de viajes (inicio / fin)
 */
export const TRIP_GEO_SNAPSHOTS_TABLE = "trip_geo_snapshots";

export const TRIP_GEO_SNAPSHOTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS trip_geo_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL,
  kind TEXT NOT NULL, -- START | END
  snapshot TEXT NOT NULL, -- JSON serializado
  createdAt TEXT NOT NULL,
  FOREIGN KEY (tripId) REFERENCES trips(id)
);
`;
