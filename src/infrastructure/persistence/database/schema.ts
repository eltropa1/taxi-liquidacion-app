export const WORKDAYS_TABLE = "workdays";

export const WORKDAYS_SCHEMA = `
CREATE TABLE IF NOT EXISTS workdays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  startTime TEXT NOT NULL,
  endTime TEXT,
  startOdometer INTEGER,
  endOdometer INTEGER,
  isClosed INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);
`;

export const TRIP_GEO_SNAPSHOTS_TABLE = "trip_geo_snapshots";

export const TRIP_GEO_SNAPSHOTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS trip_geo_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL,
  kind TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (tripId) REFERENCES trips(id)
);
`;
