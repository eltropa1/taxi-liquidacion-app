import type { RecordNote, RecordOwner } from "../../../domain/records";

export type RecordNoteUpsertInput = Readonly<{
  owner: RecordOwner;
  body: string;
  createdAt: string;
  updatedAt: string;
}>;

export interface RecordNoteRepositoryPort {
  findByOwner(owner: RecordOwner): Promise<RecordNote | null>;

  upsert(input: RecordNoteUpsertInput): Promise<RecordNote>;

  deleteByOwner(owner: RecordOwner): Promise<void>;
}
