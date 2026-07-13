import {
  configureApplicationPersistence,
  resetApplicationPersistence,
  type RecordAttachmentRepositoryPort,
  type RecordNoteRepositoryPort,
} from "../../ports/persistence";
import {
  configureApplicationRuntime,
  resetApplicationRuntime,
} from "../../runtime";
import type {
  AttachmentFileStoragePort,
  RecordOwnerResolverPort,
} from "../../ports/runtime";
import type {
  AttachmentStatus,
  RecordAttachment,
  RecordNote,
  RecordOwner,
} from "../../../domain/records";
import { RecordEnrichmentService } from "../RecordEnrichmentService";

class MemoryNoteRepository implements RecordNoteRepositoryPort {
  notes = new Map<string, RecordNote>();

  async findByOwner(owner: RecordOwner): Promise<RecordNote | null> {
    return this.notes.get(ownerKey(owner)) ?? null;
  }

  async upsert(input: {
    owner: RecordOwner;
    body: string;
    createdAt: string;
    updatedAt: string;
  }): Promise<RecordNote> {
    const existing = this.notes.get(ownerKey(input.owner));
    const note: RecordNote = {
      id: existing?.id ?? this.notes.size + 1,
      ownerType: input.owner.ownerType,
      ownerId: input.owner.ownerId,
      body: input.body.trim(),
      createdAt: existing?.createdAt ?? input.createdAt,
      updatedAt: input.updatedAt,
    };
    this.notes.set(ownerKey(input.owner), note);
    return note;
  }

  async deleteByOwner(owner: RecordOwner): Promise<void> {
    this.notes.delete(ownerKey(owner));
  }
}

class MemoryAttachmentRepository implements RecordAttachmentRepositoryPort {
  attachments = new Map<string, RecordAttachment>();
  failInsert = false;

  async findById(id: string): Promise<RecordAttachment | null> {
    return this.attachments.get(id) ?? null;
  }

  async listByOwner(owner: RecordOwner): Promise<RecordAttachment[]> {
    return Array.from(this.attachments.values()).filter(
      (attachment) =>
        attachment.ownerType === owner.ownerType &&
        attachment.ownerId === owner.ownerId,
    );
  }

  async countActiveByOwner(owner: RecordOwner): Promise<number> {
    return (await this.listByOwner(owner)).filter(
      (attachment) => attachment.status !== "deleting",
    ).length;
  }

  async insert(input: RecordAttachment): Promise<void> {
    if (this.failInsert) {
      throw new Error("insert failed");
    }
    this.attachments.set(input.id, input);
  }

  async updateStatus(id: string, status: AttachmentStatus): Promise<void> {
    const attachment = this.attachments.get(id);
    if (attachment) {
      this.attachments.set(id, { ...attachment, status });
    }
  }

  async updateStatusIfCurrent(
    id: string,
    from: AttachmentStatus,
    to: AttachmentStatus,
  ): Promise<boolean> {
    const attachment = this.attachments.get(id);
    if (!attachment || attachment.status !== from) {
      return false;
    }

    this.attachments.set(id, { ...attachment, status: to });
    return true;
  }

  async deleteMetadata(id: string): Promise<void> {
    this.attachments.delete(id);
  }

  async listByStatus(status: AttachmentStatus): Promise<RecordAttachment[]> {
    return Array.from(this.attachments.values()).filter(
      (attachment) => attachment.status === status,
    );
  }

  async listAll(): Promise<RecordAttachment[]> {
    return Array.from(this.attachments.values());
  }

  async markOwnerAttachmentsDeleting(owner: RecordOwner): Promise<number> {
    let changed = 0;
    for (const attachment of await this.listByOwner(owner)) {
      if (["ready", "failed", "missing"].includes(attachment.status)) {
        this.attachments.set(attachment.id, {
          ...attachment,
          status: "deleting",
        });
        changed += 1;
      }
    }
    return changed;
  }
}

class MemoryStorage implements AttachmentFileStoragePort {
  files = new Map<string, { size: number; modifiedAt: Date | null }>();
  failCopy = false;
  failConfirm = false;
  failDelete = false;

  async copyToTemporary(input: {
    sourceUri: string;
    temporaryStorageKey: string;
  }): Promise<{ temporaryStorageKey: string }> {
    if (this.failCopy || input.sourceUri === "missing://file") {
      throw new Error("copy failed");
    }
    this.files.set(input.temporaryStorageKey, {
      size: input.sourceUri.includes("large") ? 11 * 1024 * 1024 : 100,
      modifiedAt: new Date("2026-07-01T08:00:00.000Z"),
    });
    return { temporaryStorageKey: input.temporaryStorageKey };
  }

  async confirmTemporary(input: {
    temporaryStorageKey: string;
    storageKey: string;
  }): Promise<void> {
    if (this.failConfirm) {
      throw new Error("confirm failed");
    }
    const file = this.files.get(input.temporaryStorageKey);
    if (!file) {
      throw new Error("missing temporary");
    }
    this.files.delete(input.temporaryStorageKey);
    this.files.set(input.storageKey, file);
  }

  async exists(storageKey: string): Promise<boolean> {
    return this.files.has(storageKey);
  }

  async getSizeBytes(storageKey: string): Promise<number | null> {
    return this.files.get(storageKey)?.size ?? null;
  }

  async delete(storageKey: string): Promise<void> {
    if (this.failDelete) {
      throw new Error("delete failed");
    }
    this.files.delete(storageKey);
  }

  async quarantine(storageKey: string): Promise<void> {
    const file = this.files.get(storageKey);
    if (file) {
      this.files.delete(storageKey);
      this.files.set(`quarantine/${storageKey}`, file);
    }
  }

  async listTemporaryFiles() {
    return Array.from(this.files.entries())
      .filter(([key]) => key.startsWith("temp/attachments/"))
      .map(([storageKey, file]) => ({
        storageKey,
        modifiedAt: file.modifiedAt,
      }));
  }

  async listFinalFiles() {
    return Array.from(this.files.entries())
      .filter(([key]) => key.startsWith("attachments/"))
      .map(([storageKey, file]) => ({
        storageKey,
        modifiedAt: file.modifiedAt,
      }));
  }

  resolveUri(storageKey: string): string {
    return `file:///app/geotaxi/${storageKey}`;
  }
}

describe("RecordEnrichmentService", () => {
  let notes: MemoryNoteRepository;
  let attachments: MemoryAttachmentRepository;
  let storage: MemoryStorage;
  let ownerResolver: RecordOwnerResolverPort;
  let idCounter: number;

  beforeEach(() => {
    notes = new MemoryNoteRepository();
    attachments = new MemoryAttachmentRepository();
    storage = new MemoryStorage();
    idCounter = 0;
    ownerResolver = {
      exists: jest.fn(async (owner: RecordOwner) => owner.ownerId === "12"),
    };

    configureApplicationPersistence({
      tripRepository: {} as any,
      workdayRepository: {} as any,
      tripGeoSnapshotRepository: {} as any,
      recordNoteRepository: notes,
      recordAttachmentRepository: attachments,
    });
    configureApplicationRuntime({
      goalStorage: {} as any,
      weekConfigurationStorage: {} as any,
      geoLocation: {} as any,
      geoAdministrativeResolver: {} as any,
      tripCsvExporter: {} as any,
      attachmentFileStorage: storage,
      idGenerator: { generateId: () => `att-${++idCounter}` },
      clock: { now: () => new Date("2026-07-02T08:00:00.000Z") },
      recordOwnerResolver: ownerResolver,
    });
  });

  afterEach(() => {
    resetApplicationPersistence();
    resetApplicationRuntime();
  });

  it("creates, updates and deletes the main note with blank-as-delete semantics", async () => {
    await expect(
      RecordEnrichmentService.updateNote({
        ownerType: "registered_service",
        ownerId: "12",
        body: " first note ",
      }),
    ).resolves.toMatchObject({
      changed: true,
      note: { body: "first note" },
    });

    await expect(
      RecordEnrichmentService.updateNote({
        ownerType: "registered_service",
        ownerId: "12",
        body: "first note",
      }),
    ).resolves.toMatchObject({ changed: false });

    await expect(
      RecordEnrichmentService.updateNote({
        ownerType: "registered_service",
        ownerId: "12",
        body: "   ",
      }),
    ).resolves.toEqual({ changed: true, note: null });
    expect(notes.notes.size).toBe(0);
  });

  it("imports an allowed attachment and stores only metadata plus storageKey", async () => {
    const result = await RecordEnrichmentService.importAttachment({
      ownerType: "registered_service",
      ownerId: "12",
      sourceUri: "content://ticket",
      originalName: "ticket.pdf",
      declaredMimeType: "application/pdf",
      declaredSizeBytes: 100,
      source: "document",
    });

    expect(result).toMatchObject({
      ok: true,
      attachment: {
        id: "att-1",
        status: "ready",
        storageKey: "attachments/registered_service/12/att-1.pdf",
      },
    });
    expect(storage.files.has("attachments/registered_service/12/att-1.pdf")).toBe(
      true,
    );
  });

  it("rejects invalid owners, unsupported types, excessive sizes and attachment limits", async () => {
    await expect(
      RecordEnrichmentService.importAttachment({
        ownerType: "registered_service",
        ownerId: "99",
        sourceUri: "content://ticket",
        originalName: "ticket.pdf",
        source: "document",
      }),
    ).resolves.toEqual({ ok: false, error: "OWNER_NOT_FOUND" });

    await expect(
      RecordEnrichmentService.importAttachment({
        ownerType: "registered_service",
        ownerId: "12",
        sourceUri: "content://ticket",
        originalName: "ticket.exe",
        source: "document",
      }),
    ).resolves.toEqual({ ok: false, error: "UNSUPPORTED_TYPE" });

    await expect(
      RecordEnrichmentService.importAttachment({
        ownerType: "registered_service",
        ownerId: "12",
        sourceUri: "content://large",
        originalName: "large.pdf",
        source: "document",
      }),
    ).resolves.toEqual({ ok: false, error: "FILE_TOO_LARGE" });

    for (let index = 0; index < 5; index += 1) {
      attachments.attachments.set(`existing-${index}`, {
        id: `existing-${index}`,
        ownerType: "registered_service",
        ownerId: "12",
        attachmentKind: "document",
        mimeType: "application/pdf",
        originalName: null,
        storageKey: `attachments/registered_service/12/existing-${index}.pdf`,
        sizeBytes: 1,
        createdAt: "2026-07-01T08:00:00.000Z",
        status: "ready",
        source: "document",
        description: null,
      });
    }

    await expect(
      RecordEnrichmentService.importAttachment({
        ownerType: "registered_service",
        ownerId: "12",
        sourceUri: "content://ticket",
        originalName: "ticket.pdf",
        source: "document",
      }),
    ).resolves.toEqual({ ok: false, error: "ATTACHMENT_LIMIT_REACHED" });
  });

  it("compensates copy, persistence and confirm failures without touching owner data", async () => {
    storage.failCopy = true;
    await expect(
      RecordEnrichmentService.importAttachment({
        ownerType: "registered_service",
        ownerId: "12",
        sourceUri: "content://ticket",
        originalName: "ticket.pdf",
        source: "document",
      }),
    ).resolves.toEqual({ ok: false, error: "COPY_FAILED" });
    storage.failCopy = false;

    attachments.failInsert = true;
    await expect(
      RecordEnrichmentService.importAttachment({
        ownerType: "registered_service",
        ownerId: "12",
        sourceUri: "content://ticket",
        originalName: "ticket.pdf",
        source: "document",
      }),
    ).resolves.toEqual({ ok: false, error: "PERSISTENCE_FAILED" });
    expect(storage.files.size).toBe(0);
    attachments.failInsert = false;

    storage.failConfirm = true;
    await expect(
      RecordEnrichmentService.importAttachment({
        ownerType: "registered_service",
        ownerId: "12",
        sourceUri: "content://ticket",
        originalName: "ticket.pdf",
        source: "document",
      }),
    ).resolves.toEqual({ ok: false, error: "IMPORT_INCOMPLETE" });
    expect(attachments.attachments.get("att-3")?.status).toBe("failed");
  });

  it("deletes attachments and keeps cleanup pending when filesystem fails", async () => {
    await RecordEnrichmentService.importAttachment({
      ownerType: "registered_service",
      ownerId: "12",
      sourceUri: "content://ticket",
      originalName: "ticket.pdf",
      source: "document",
    });

    storage.failDelete = true;
    await expect(
      RecordEnrichmentService.deleteAttachment("att-1"),
    ).resolves.toEqual({
      deleted: false,
      pendingFilesystemCleanup: true,
    });
    expect(attachments.attachments.get("att-1")?.status).toBe("deleting");
  });

  it("resolves ready attachment URIs without exposing storage keys to callers", async () => {
    await RecordEnrichmentService.importAttachment({
      ownerType: "registered_service",
      ownerId: "12",
      sourceUri: "content://ticket",
      originalName: "ticket.pdf",
      source: "document",
    });

    await expect(
      RecordEnrichmentService.resolveAttachmentUri("att-1"),
    ).resolves.toEqual({
      ok: true,
      uri: "file:///app/geotaxi/attachments/registered_service/12/att-1.pdf",
      mimeType: "application/pdf",
      originalName: "ticket.pdf",
    });

    storage.files.delete("attachments/registered_service/12/att-1.pdf");
    await expect(
      RecordEnrichmentService.resolveAttachmentUri("att-1"),
    ).resolves.toEqual({ ok: false, error: "MISSING" });
    expect(attachments.attachments.get("att-1")?.status).toBe("missing");
  });

  it("deletes owner enrichment without blocking on filesystem cleanup", async () => {
    notes.notes.set("registered_service:12", {
      id: 1,
      ownerType: "registered_service",
      ownerId: "12",
      body: "note",
      createdAt: "2026-07-01T08:00:00.000Z",
      updatedAt: "2026-07-01T08:00:00.000Z",
    });
    attachments.attachments.set("att-1", {
      id: "att-1",
      ownerType: "registered_service",
      ownerId: "12",
      attachmentKind: "document",
      mimeType: "application/pdf",
      originalName: null,
      storageKey: "attachments/registered_service/12/att-1.pdf",
      sizeBytes: 1,
      createdAt: "2026-07-01T08:00:00.000Z",
      status: "ready",
      source: "document",
      description: null,
    });
    storage.files.set("attachments/registered_service/12/att-1.pdf", {
      size: 1,
      modifiedAt: new Date("2026-07-01T08:00:00.000Z"),
    });
    storage.failDelete = true;

    await expect(
      RecordEnrichmentService.deleteEnrichmentForOwner({
        ownerType: "registered_service",
        ownerId: "12",
      }),
    ).resolves.toEqual({
      noteDeleted: true,
      attachmentsRequested: 1,
      metadataDeleted: 0,
      pendingFilesystemCleanup: ["att-1"],
    });
    expect(notes.notes.size).toBe(0);
    expect(attachments.attachments.get("att-1")?.status).toBe("deleting");
  });

  it("reconciles missing, pending, deleting, temporary and orphan final files", async () => {
    attachments.attachments.set("ready-missing", {
      id: "ready-missing",
      ownerType: "registered_service",
      ownerId: "12",
      attachmentKind: "document",
      mimeType: "application/pdf",
      originalName: null,
      storageKey: "attachments/registered_service/12/ready-missing.pdf",
      sizeBytes: 1,
      createdAt: "2026-07-01T08:00:00.000Z",
      status: "ready",
      source: "document",
      description: null,
    });
    attachments.attachments.set("pending-ready", {
      id: "pending-ready",
      ownerType: "registered_service",
      ownerId: "12",
      attachmentKind: "document",
      mimeType: "application/pdf",
      originalName: null,
      storageKey: "attachments/registered_service/12/pending-ready.pdf",
      sizeBytes: 1,
      createdAt: "2026-07-01T08:00:00.000Z",
      status: "pending",
      source: "document",
      description: null,
    });
    attachments.attachments.set("delete-me", {
      id: "delete-me",
      ownerType: "registered_service",
      ownerId: "12",
      attachmentKind: "document",
      mimeType: "application/pdf",
      originalName: null,
      storageKey: "attachments/registered_service/12/delete-me.pdf",
      sizeBytes: 1,
      createdAt: "2026-07-01T08:00:00.000Z",
      status: "deleting",
      source: "document",
      description: null,
    });
    storage.files.set("attachments/registered_service/12/pending-ready.pdf", {
      size: 1,
      modifiedAt: new Date("2026-07-01T08:00:00.000Z"),
    });
    storage.files.set("attachments/registered_service/12/delete-me.pdf", {
      size: 1,
      modifiedAt: new Date("2026-07-01T08:00:00.000Z"),
    });
    storage.files.set("attachments/registered_service/12/orphan.pdf", {
      size: 1,
      modifiedAt: new Date("2026-07-01T08:00:00.000Z"),
    });
    storage.files.set("temp/attachments/old.pdf", {
      size: 1,
      modifiedAt: new Date("2026-07-01T08:00:00.000Z"),
    });

    await expect(
      RecordEnrichmentService.reconcileAttachments({
        pendingMaxAgeMs: 1,
        temporaryMaxAgeMs: 1,
      }),
    ).resolves.toEqual({
      pendingMarkedMissing: 0,
      pendingMarkedReady: 1,
      readyMarkedMissing: 1,
      deletingDeleted: 1,
      temporaryDeleted: 1,
      quarantined: 1,
    });
    expect(attachments.attachments.get("ready-missing")?.status).toBe("missing");
    expect(attachments.attachments.get("pending-ready")?.status).toBe("ready");
    expect(attachments.attachments.has("delete-me")).toBe(false);
    expect(storage.files.has("quarantine/attachments/registered_service/12/orphan.pdf")).toBe(
      true,
    );

    await expect(
      RecordEnrichmentService.reconcileAttachments({
        pendingMaxAgeMs: 1,
        temporaryMaxAgeMs: 1,
      }),
    ).resolves.toMatchObject({
      pendingMarkedReady: 0,
      deletingDeleted: 0,
      temporaryDeleted: 0,
      quarantined: 0,
    });
  });
});

function ownerKey(owner: RecordOwner): string {
  return `${owner.ownerType}:${owner.ownerId}`;
}
