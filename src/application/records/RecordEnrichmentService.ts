import {
  RECORD_ATTACHMENT_LIMITS,
  assertAttachmentStatusTransition,
  buildAttachmentStorageKey,
  buildTemporaryAttachmentStorageKey,
  createRecordOwner,
  normalizeAttachmentDescription,
  normalizeRecordNoteBody,
  resolveAllowedAttachmentType,
  type AttachmentSource,
  type AttachmentStatus,
  type RecordAttachment,
  type RecordNote,
  type RecordOwner,
} from "../../domain/records";
import { getApplicationPersistence } from "../ports/persistence";
import type {
  AttachmentFileStoragePort,
  ClockPort,
  IdGeneratorPort,
  RecordOwnerResolverPort,
} from "../ports/runtime";
import { getApplicationRuntime } from "../runtime";

export type RecordEnrichment = Readonly<{
  note: RecordNote | null;
  attachments: RecordAttachment[];
}>;

export type RecordAttachmentImportInput = Readonly<{
  ownerType: string;
  ownerId: string | number;
  sourceUri: string;
  originalName?: string | null;
  declaredMimeType?: string | null;
  declaredSizeBytes?: number | null;
  source: AttachmentSource;
  description?: string | null;
}>;

export type RecordAttachmentImportResult =
  | Readonly<{ ok: true; attachment: RecordAttachment }>
  | Readonly<{
      ok: false;
      error:
        | "OWNER_NOT_FOUND"
        | "ATTACHMENT_LIMIT_REACHED"
        | "UNSUPPORTED_TYPE"
        | "INCOHERENT_TYPE"
        | "FILE_TOO_LARGE"
        | "COPY_FAILED"
        | "PERSISTENCE_FAILED"
        | "IMPORT_INCOMPLETE";
    }>;

export type DeleteAttachmentResult = Readonly<{
  deleted: boolean;
  pendingFilesystemCleanup: boolean;
}>;

export type DeleteOwnerEnrichmentResult = Readonly<{
  noteDeleted: boolean;
  attachmentsRequested: number;
  metadataDeleted: number;
  pendingFilesystemCleanup: string[];
}>;

export type ReconcileAttachmentsResult = Readonly<{
  pendingMarkedMissing: number;
  pendingMarkedReady: number;
  readyMarkedMissing: number;
  deletingDeleted: number;
  temporaryDeleted: number;
  quarantined: number;
}>;

export type ReconcileAttachmentsOptions = Readonly<{
  pendingMaxAgeMs?: number;
  temporaryMaxAgeMs?: number;
}>;

const DEFAULT_PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TEMPORARY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export class RecordEnrichmentService {
  static async getEnrichment(input: {
    ownerType: string;
    ownerId: string | number;
  }): Promise<RecordEnrichment> {
    const owner = createRecordOwner(input.ownerType, input.ownerId);
    const { noteRepository, attachmentRepository } = getRecordRepositories();

    const [note, attachments] = await Promise.all([
      noteRepository.findByOwner(owner),
      attachmentRepository.listByOwner(owner),
    ]);

    return { note, attachments };
  }

  static async updateNote(input: {
    ownerType: string;
    ownerId: string | number;
    body: string;
  }): Promise<{ note: RecordNote | null; changed: boolean }> {
    const owner = createRecordOwner(input.ownerType, input.ownerId);
    await assertOwnerExists(owner);
    const { noteRepository } = getRecordRepositories();
    const body = normalizeRecordNoteBody(input.body);
    const current = await noteRepository.findByOwner(owner);

    if (!body) {
      if (!current) {
        return { note: null, changed: false };
      }

      await noteRepository.deleteByOwner(owner);
      return { note: null, changed: true };
    }

    if (current?.body === body) {
      return { note: current, changed: false };
    }

    const now = getClock().now().toISOString();
    const note = await noteRepository.upsert({
      owner,
      body,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    });

    return { note, changed: true };
  }

  static async deleteNote(input: {
    ownerType: string;
    ownerId: string | number;
  }): Promise<void> {
    const owner = createRecordOwner(input.ownerType, input.ownerId);
    const { noteRepository } = getRecordRepositories();
    await noteRepository.deleteByOwner(owner);
  }

  static async importAttachment(
    input: RecordAttachmentImportInput,
  ): Promise<RecordAttachmentImportResult> {
    const owner = createRecordOwner(input.ownerType, input.ownerId);
    const ownerExists = await getOwnerResolver().exists(owner);
    if (!ownerExists) {
      return { ok: false, error: "OWNER_NOT_FOUND" };
    }

    const { attachmentRepository } = getRecordRepositories();
    const activeCount = await attachmentRepository.countActiveByOwner(owner);
    if (activeCount >= RECORD_ATTACHMENT_LIMITS.maxAttachmentsPerOwner) {
      return { ok: false, error: "ATTACHMENT_LIMIT_REACHED" };
    }

    if (
      input.declaredSizeBytes !== null &&
      input.declaredSizeBytes !== undefined &&
      input.declaredSizeBytes > RECORD_ATTACHMENT_LIMITS.maxSizeBytes
    ) {
      return { ok: false, error: "FILE_TOO_LARGE" };
    }

    const typeResolution = resolveAllowedAttachmentType({
      mimeType: input.declaredMimeType,
      originalName: input.originalName,
    });

    if (!typeResolution.ok) {
      return {
        ok: false,
        error:
          typeResolution.reason === "incoherent_type"
            ? "INCOHERENT_TYPE"
            : "UNSUPPORTED_TYPE",
      };
    }

    const id = getIdGenerator().generateId();
    const storageKey = buildAttachmentStorageKey({
      owner,
      attachmentId: id,
      extension: typeResolution.extension,
    });
    const temporaryStorageKey = buildTemporaryAttachmentStorageKey({
      attachmentId: id,
      extension: typeResolution.extension,
    });
    const storage = getFileStorage();

    try {
      await storage.copyToTemporary({
        sourceUri: input.sourceUri,
        temporaryStorageKey,
      });
    } catch {
      return { ok: false, error: "COPY_FAILED" };
    }

    const temporarySize = await storage.getSizeBytes(temporaryStorageKey);
    if (
      temporarySize === null ||
      temporarySize > RECORD_ATTACHMENT_LIMITS.maxSizeBytes
    ) {
      await tryDelete(storage, temporaryStorageKey);
      return { ok: false, error: "FILE_TOO_LARGE" };
    }

    const createdAt = getClock().now().toISOString();
    const attachment: RecordAttachment = {
      id,
      ownerType: owner.ownerType,
      ownerId: owner.ownerId,
      attachmentKind: typeResolution.attachmentKind,
      mimeType: typeResolution.mimeType,
      originalName: normalizeOptionalText(input.originalName),
      storageKey,
      sizeBytes: temporarySize,
      createdAt,
      status: "pending",
      source: input.source,
      description: normalizeAttachmentDescription(input.description),
    };

    try {
      await attachmentRepository.insert(attachment);
    } catch {
      await tryDelete(storage, temporaryStorageKey);
      return { ok: false, error: "PERSISTENCE_FAILED" };
    }

    try {
      await storage.confirmTemporary({ temporaryStorageKey, storageKey });
      const finalSize = await storage.getSizeBytes(storageKey);
      if (
        finalSize === null ||
        finalSize > RECORD_ATTACHMENT_LIMITS.maxSizeBytes
      ) {
        await attachmentRepository.updateStatusIfCurrent(
          id,
          "pending",
          "failed",
        );
        await tryDelete(storage, storageKey);
        return { ok: false, error: "FILE_TOO_LARGE" };
      }

      await attachmentRepository.updateStatusIfCurrent(id, "pending", "ready");
    } catch {
      await attachmentRepository.updateStatusIfCurrent(id, "pending", "failed");
      return { ok: false, error: "IMPORT_INCOMPLETE" };
    }

    const readyAttachment = await attachmentRepository.findById(id);
    return {
      ok: true,
      attachment: readyAttachment ?? { ...attachment, status: "ready" },
    };
  }

  static async deleteAttachment(id: string): Promise<DeleteAttachmentResult> {
    const { attachmentRepository } = getRecordRepositories();
    const attachment = await attachmentRepository.findById(id);
    if (!attachment) {
      return { deleted: false, pendingFilesystemCleanup: false };
    }

    if (attachment.status !== "deleting") {
      assertAttachmentStatusTransition(attachment.status, "deleting");
      await attachmentRepository.updateStatusIfCurrent(
        id,
        attachment.status,
        "deleting",
      );
    }

    const storage = getFileStorage();
    try {
      await storage.delete(attachment.storageKey);
      await attachmentRepository.deleteMetadata(id);
      return { deleted: true, pendingFilesystemCleanup: false };
    } catch {
      return { deleted: false, pendingFilesystemCleanup: true };
    }
  }

  static async deleteEnrichmentForOwner(input: {
    ownerType: string;
    ownerId: string | number;
  }): Promise<DeleteOwnerEnrichmentResult> {
    const owner = createRecordOwner(input.ownerType, input.ownerId);
    const { noteRepository, attachmentRepository } = getRecordRepositories();
    const attachments = await attachmentRepository.listByOwner(owner);

    await noteRepository.deleteByOwner(owner);
    await attachmentRepository.markOwnerAttachmentsDeleting(owner);

    const storage = getFileStorage();
    const pendingFilesystemCleanup: string[] = [];
    let metadataDeleted = 0;

    for (const attachment of attachments) {
      try {
        await storage.delete(attachment.storageKey);
        await attachmentRepository.deleteMetadata(attachment.id);
        metadataDeleted += 1;
      } catch {
        pendingFilesystemCleanup.push(attachment.id);
      }
    }

    return {
      noteDeleted: true,
      attachmentsRequested: attachments.length,
      metadataDeleted,
      pendingFilesystemCleanup,
    };
  }

  static async reconcileAttachments(
    options: ReconcileAttachmentsOptions = {},
  ): Promise<ReconcileAttachmentsResult> {
    const pendingMaxAgeMs =
      options.pendingMaxAgeMs ?? DEFAULT_PENDING_MAX_AGE_MS;
    const temporaryMaxAgeMs =
      options.temporaryMaxAgeMs ?? DEFAULT_TEMPORARY_MAX_AGE_MS;
    const nowMs = getClock().now().getTime();
    const { attachmentRepository } = getRecordRepositories();
    const storage = getFileStorage();

    const result = {
      pendingMarkedMissing: 0,
      pendingMarkedReady: 0,
      readyMarkedMissing: 0,
      deletingDeleted: 0,
      temporaryDeleted: 0,
      quarantined: 0,
    };

    for (const attachment of await attachmentRepository.listByStatus("ready")) {
      if (!(await storage.exists(attachment.storageKey))) {
        await transitionAttachment(attachment, "missing");
        result.readyMarkedMissing += 1;
      }
    }

    for (const attachment of await attachmentRepository.listByStatus(
      "pending",
    )) {
      if (!isOlderThan(attachment.createdAt, nowMs, pendingMaxAgeMs)) {
        continue;
      }

      if (await storage.exists(attachment.storageKey)) {
        await transitionAttachment(attachment, "ready");
        result.pendingMarkedReady += 1;
      } else {
        await transitionAttachment(attachment, "missing");
        result.pendingMarkedMissing += 1;
      }
    }

    for (const attachment of await attachmentRepository.listByStatus(
      "deleting",
    )) {
      try {
        await storage.delete(attachment.storageKey);
        await attachmentRepository.deleteMetadata(attachment.id);
        result.deletingDeleted += 1;
      } catch {
        const exists = await storage.exists(attachment.storageKey);
        if (!exists) {
          await transitionAttachment(attachment, "missing");
        }
      }
    }

    for (const temporary of await storage.listTemporaryFiles()) {
      if (
        temporary.modifiedAt &&
        nowMs - temporary.modifiedAt.getTime() >= temporaryMaxAgeMs
      ) {
        await storage.delete(temporary.storageKey);
        result.temporaryDeleted += 1;
      }
    }

    const knownStorageKeys = new Set(
      (await attachmentRepository.listAll()).map(
        (attachment) => attachment.storageKey,
      ),
    );

    for (const file of await storage.listFinalFiles()) {
      if (!knownStorageKeys.has(file.storageKey)) {
        await storage.quarantine(file.storageKey);
        result.quarantined += 1;
      }
    }

    return result;

    async function transitionAttachment(
      attachment: RecordAttachment,
      status: AttachmentStatus,
    ) {
      await attachmentRepository.updateStatusIfCurrent(
        attachment.id,
        attachment.status,
        status,
      );
    }
  }
}

function getRecordRepositories() {
  const persistence = getApplicationPersistence();
  if (
    !persistence.recordNoteRepository ||
    !persistence.recordAttachmentRepository
  ) {
    throw new Error("Record repositories have not been configured");
  }

  return {
    noteRepository: persistence.recordNoteRepository,
    attachmentRepository: persistence.recordAttachmentRepository,
  };
}

function getFileStorage(): AttachmentFileStoragePort {
  const storage = getApplicationRuntime().attachmentFileStorage;
  if (!storage) {
    throw new Error("Attachment file storage has not been configured");
  }

  return storage;
}

function getIdGenerator(): IdGeneratorPort {
  const idGenerator = getApplicationRuntime().idGenerator;
  if (!idGenerator) {
    throw new Error("Id generator has not been configured");
  }

  return idGenerator;
}

function getClock(): ClockPort {
  const clock = getApplicationRuntime().clock;
  if (!clock) {
    throw new Error("Clock has not been configured");
  }

  return clock;
}

function getOwnerResolver(): RecordOwnerResolverPort {
  const resolver = getApplicationRuntime().recordOwnerResolver;
  if (!resolver) {
    throw new Error("Record owner resolver has not been configured");
  }

  return resolver;
}

async function assertOwnerExists(owner: RecordOwner): Promise<void> {
  const exists = await getOwnerResolver().exists(owner);
  if (!exists) {
    throw new Error("Record owner does not exist");
  }
}

async function tryDelete(
  storage: AttachmentFileStoragePort,
  storageKey: string,
): Promise<void> {
  try {
    await storage.delete(storageKey);
  } catch {
    // Compensation is best effort; reconciliation handles remaining managed files.
  }
}

function normalizeOptionalText(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length === 0 ? null : normalized;
}

function isOlderThan(
  isoDate: string,
  nowMs: number,
  maxAgeMs: number,
): boolean {
  const time = new Date(isoDate).getTime();
  return Number.isFinite(time) && nowMs - time >= maxAgeMs;
}
