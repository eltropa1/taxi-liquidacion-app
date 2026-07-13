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

export const RECORD_NOTES_TABLE = "record_notes";

export const RECORD_NOTES_SCHEMA = `
CREATE TABLE IF NOT EXISTS record_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownerType TEXT NOT NULL,
  ownerId TEXT NOT NULL,
  body TEXT NOT NULL CHECK(length(trim(body)) > 0),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(ownerType, ownerId),
  CHECK(ownerType IN ('registered_service', 'expense', 'administrative_movement', 'incident'))
);
`;

export const RECORD_NOTES_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_record_notes_owner
  ON record_notes(ownerType, ownerId);
`;

export const RECORD_ATTACHMENTS_TABLE = "record_attachments";

export const RECORD_ATTACHMENTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS record_attachments (
  id TEXT PRIMARY KEY,
  ownerType TEXT NOT NULL,
  ownerId TEXT NOT NULL,
  attachmentKind TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  originalName TEXT,
  storageKey TEXT NOT NULL UNIQUE,
  sizeBytes INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  status TEXT NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  CHECK(ownerType IN ('registered_service', 'expense', 'administrative_movement', 'incident')),
  CHECK(attachmentKind IN ('image', 'document')),
  CHECK(status IN ('pending', 'ready', 'failed', 'missing', 'deleting')),
  CHECK(source IN ('camera', 'gallery', 'document', 'import')),
  CHECK(sizeBytes >= 0)
);
`;

export const RECORD_ATTACHMENTS_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_record_attachments_owner
  ON record_attachments(ownerType, ownerId);

CREATE INDEX IF NOT EXISTS idx_record_attachments_status
  ON record_attachments(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_record_attachments_storage_key
  ON record_attachments(storageKey);
`;
