import type { RecordOwner, RecordOwnerType } from "./recordOwner";

export const ATTACHMENT_STATUSES = [
  "pending",
  "ready",
  "failed",
  "missing",
  "deleting",
] as const;

export type AttachmentStatus = (typeof ATTACHMENT_STATUSES)[number];

export const ATTACHMENT_SOURCES = [
  "camera",
  "gallery",
  "document",
  "import",
] as const;

export type AttachmentSource = (typeof ATTACHMENT_SOURCES)[number];

export const ATTACHMENT_KINDS = ["image", "document"] as const;

export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export type RecordAttachment = Readonly<{
  id: string;
  ownerType: RecordOwnerType;
  ownerId: string;
  attachmentKind: AttachmentKind;
  mimeType: string;
  originalName: string | null;
  storageKey: string;
  sizeBytes: number;
  createdAt: string;
  status: AttachmentStatus;
  source: AttachmentSource;
  description: string | null;
}>;

export const RECORD_ATTACHMENT_LIMITS = Object.freeze({
  maxAttachmentsPerOwner: 5,
  maxSizeBytes: 10 * 1024 * 1024,
});

const ALLOWED_MIME_TYPES: Record<
  string,
  Readonly<{ attachmentKind: AttachmentKind; extension: string }>
> = Object.freeze({
  "image/jpeg": { attachmentKind: "image", extension: "jpg" },
  "image/png": { attachmentKind: "image", extension: "png" },
  "image/webp": { attachmentKind: "image", extension: "webp" },
  "application/pdf": { attachmentKind: "document", extension: "pdf" },
});

const EXTENSION_TO_MIME_TYPE: Record<string, string> = Object.freeze({
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
});

const VALID_TRANSITIONS: Record<AttachmentStatus, AttachmentStatus[]> =
  Object.freeze({
    pending: ["ready", "failed", "missing"],
    ready: ["deleting", "missing"],
    failed: ["pending", "deleting"],
    missing: ["deleting"],
    deleting: ["missing"],
  });

export type AttachmentTypeResolution =
  | Readonly<{
      ok: true;
      mimeType: string;
      attachmentKind: AttachmentKind;
      extension: string;
    }>
  | Readonly<{ ok: false; reason: "unsupported_type" | "incoherent_type" }>;

export function isAttachmentStatus(value: unknown): value is AttachmentStatus {
  return (
    typeof value === "string" &&
    ATTACHMENT_STATUSES.includes(value as AttachmentStatus)
  );
}

export function isAttachmentSource(value: unknown): value is AttachmentSource {
  return (
    typeof value === "string" &&
    ATTACHMENT_SOURCES.includes(value as AttachmentSource)
  );
}

export function isAttachmentKind(value: unknown): value is AttachmentKind {
  return (
    typeof value === "string" &&
    ATTACHMENT_KINDS.includes(value as AttachmentKind)
  );
}

export function normalizeAttachmentDescription(
  description: unknown,
): string | null {
  if (description === null || description === undefined) {
    return null;
  }

  if (typeof description !== "string") {
    throw new Error("Attachment description must be a string");
  }

  const normalized = description.trim();
  return normalized.length === 0 ? null : normalized;
}

export function resolveAllowedAttachmentType(input: {
  mimeType?: string | null;
  originalName?: string | null;
}): AttachmentTypeResolution {
  const declaredMime = input.mimeType?.trim().toLowerCase() || null;
  const extensionMime = resolveMimeTypeFromName(input.originalName);

  if (declaredMime && ALLOWED_MIME_TYPES[declaredMime]) {
    if (extensionMime && extensionMime !== declaredMime) {
      return { ok: false, reason: "incoherent_type" };
    }

    return {
      ok: true,
      mimeType: declaredMime,
      attachmentKind: ALLOWED_MIME_TYPES[declaredMime].attachmentKind,
      extension: ALLOWED_MIME_TYPES[declaredMime].extension,
    };
  }

  if (declaredMime && !ALLOWED_MIME_TYPES[declaredMime]) {
    return { ok: false, reason: "unsupported_type" };
  }

  if (extensionMime && ALLOWED_MIME_TYPES[extensionMime]) {
    return {
      ok: true,
      mimeType: extensionMime,
      attachmentKind: ALLOWED_MIME_TYPES[extensionMime].attachmentKind,
      extension: ALLOWED_MIME_TYPES[extensionMime].extension,
    };
  }

  return { ok: false, reason: "unsupported_type" };
}

export function canTransitionAttachmentStatus(
  from: AttachmentStatus,
  to: AttachmentStatus,
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function assertAttachmentStatusTransition(
  from: AttachmentStatus,
  to: AttachmentStatus,
): void {
  if (!canTransitionAttachmentStatus(from, to)) {
    throw new Error(`Invalid attachment status transition: ${from} -> ${to}`);
  }
}

export function buildAttachmentStorageKey(input: {
  owner: RecordOwner;
  attachmentId: string;
  extension: string;
}): string {
  const attachmentId = input.attachmentId.trim();
  if (!/^[A-Za-z0-9_-]+$/.test(attachmentId)) {
    throw new Error("Invalid attachment id for storage key");
  }

  const extension = input.extension.trim().toLowerCase();
  if (!/^[a-z0-9]+$/.test(extension)) {
    throw new Error("Invalid attachment extension");
  }

  const ownerSegment = toSafeStorageSegment(input.owner.ownerId);
  const storageKey = `attachments/${input.owner.ownerType}/${ownerSegment}/${attachmentId}.${extension}`;
  assertValidFinalStorageKey(storageKey);
  return storageKey;
}

export function buildTemporaryAttachmentStorageKey(input: {
  attachmentId: string;
  extension: string;
}): string {
  const attachmentId = input.attachmentId.trim();
  if (!/^[A-Za-z0-9_-]+$/.test(attachmentId)) {
    throw new Error("Invalid attachment id for temporary storage key");
  }

  const extension = input.extension.trim().toLowerCase();
  if (!/^[a-z0-9]+$/.test(extension)) {
    throw new Error("Invalid attachment extension");
  }

  return `temp/attachments/${attachmentId}.${extension}`;
}

export function assertValidFinalStorageKey(storageKey: string): void {
  assertManagedStorageKey(storageKey);

  if (!storageKey.startsWith("attachments/")) {
    throw new Error("Invalid attachment storage key root");
  }
}

export function assertManagedStorageKey(storageKey: string): void {
  if (
    storageKey.length === 0 ||
    storageKey.startsWith("/") ||
    storageKey.startsWith("\\") ||
    storageKey.includes("://") ||
    storageKey.includes("..") ||
    storageKey.includes("\\")
  ) {
    throw new Error("Invalid managed storage key");
  }

  const segments = storageKey.split("/");
  if (segments.some((segment) => segment.length === 0 || segment === ".")) {
    throw new Error("Invalid managed storage key segment");
  }
}

function resolveMimeTypeFromName(name?: string | null): string | null {
  if (!name) {
    return null;
  }

  const lastSegment = name.trim().split(/[\\/]/).pop() ?? "";
  const extension = lastSegment.includes(".")
    ? lastSegment.split(".").pop()?.toLowerCase()
    : null;

  return extension ? EXTENSION_TO_MIME_TYPE[extension] ?? null : null;
}

function toSafeStorageSegment(value: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error("Invalid owner id for storage key");
  }

  const safe = normalized.replace(/[^A-Za-z0-9_-]/g, "_");
  return safe.length === 0 ? "owner" : safe;
}
