export const RECORD_OWNER_TYPES = [
  "registered_service",
  "expense",
  "administrative_movement",
  "incident",
] as const;

export type RecordOwnerType = (typeof RECORD_OWNER_TYPES)[number];

export type RecordOwner = Readonly<{
  ownerType: RecordOwnerType;
  ownerId: string;
}>;

export function isRecordOwnerType(value: unknown): value is RecordOwnerType {
  return (
    typeof value === "string" &&
    RECORD_OWNER_TYPES.includes(value as RecordOwnerType)
  );
}

export function createRecordOwner(
  ownerType: unknown,
  ownerId: unknown,
): RecordOwner {
  if (!isRecordOwnerType(ownerType)) {
    throw new Error("Invalid record owner type");
  }

  if (typeof ownerId !== "string" && typeof ownerId !== "number") {
    throw new Error("Invalid record owner id");
  }

  const normalizedOwnerId = String(ownerId).trim();
  if (normalizedOwnerId.length === 0) {
    throw new Error("Invalid record owner id");
  }

  return Object.freeze({
    ownerType,
    ownerId: normalizedOwnerId,
  });
}
