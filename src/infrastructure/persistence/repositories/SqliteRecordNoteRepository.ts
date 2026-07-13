import type {
  RecordNoteRepositoryPort,
  RecordNoteUpsertInput,
} from "../../../application/ports/persistence";
import {
  createRecordOwner,
  normalizeRecordNoteBody,
  type RecordNote,
  type RecordOwner,
} from "../../../domain/records";
import type { PersistenceDatabase } from "../database";

type RecordNoteRow = {
  id: number;
  ownerType: string;
  ownerId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export class SqliteRecordNoteRepository implements RecordNoteRepositoryPort {
  constructor(private readonly database: PersistenceDatabase) {}

  async findByOwner(owner: RecordOwner): Promise<RecordNote | null> {
    const normalizedOwner = createRecordOwner(owner.ownerType, owner.ownerId);
    const row = await this.database.getFirstAsync<RecordNoteRow>(
      `
      SELECT id, ownerType, ownerId, body, createdAt, updatedAt
      FROM record_notes
      WHERE ownerType = ? AND ownerId = ?
      LIMIT 1
      `,
      [normalizedOwner.ownerType, normalizedOwner.ownerId],
    );

    return row ? mapRecordNoteRow(row) : null;
  }

  async upsert(input: RecordNoteUpsertInput): Promise<RecordNote> {
    const owner = createRecordOwner(input.owner.ownerType, input.owner.ownerId);
    const body = normalizeRecordNoteBody(input.body);
    if (!body) {
      throw new Error("Cannot persist an empty record note");
    }

    await this.database.runAsync(
      `
      INSERT INTO record_notes (ownerType, ownerId, body, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(ownerType, ownerId) DO UPDATE SET
        body = excluded.body,
        updatedAt = excluded.updatedAt
      `,
      [owner.ownerType, owner.ownerId, body, input.createdAt, input.updatedAt],
    );

    const note = await this.findByOwner(owner);
    if (!note) {
      throw new Error("Record note upsert did not return a note");
    }

    return note;
  }

  async deleteByOwner(owner: RecordOwner): Promise<void> {
    const normalizedOwner = createRecordOwner(owner.ownerType, owner.ownerId);
    await this.database.runAsync(
      `
      DELETE FROM record_notes
      WHERE ownerType = ? AND ownerId = ?
      `,
      [normalizedOwner.ownerType, normalizedOwner.ownerId],
    );
  }
}

function mapRecordNoteRow(row: RecordNoteRow): RecordNote {
  createRecordOwner(row.ownerType, row.ownerId);
  const body = normalizeRecordNoteBody(row.body);
  if (!body) {
    throw new Error("Invalid empty record note row");
  }

  return {
    id: row.id,
    ownerType: createRecordOwner(row.ownerType, row.ownerId).ownerType,
    ownerId: row.ownerId,
    body,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
