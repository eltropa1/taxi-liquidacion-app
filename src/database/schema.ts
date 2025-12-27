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
