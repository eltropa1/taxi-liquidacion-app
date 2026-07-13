import type { RecordOwnerType } from "./recordOwner";

export type RecordNote = Readonly<{
  id: number;
  ownerType: RecordOwnerType;
  ownerId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}>;

export function normalizeRecordNoteBody(body: unknown): string | null {
  if (typeof body !== "string") {
    throw new Error("Record note body must be a string");
  }

  const normalized = body.trim();
  return normalized.length === 0 ? null : normalized;
}
