import type {
  RecordAttachmentInsertInput,
  RecordAttachmentRepositoryPort,
} from "../../../application/ports/persistence";
import {
  assertAttachmentStatusTransition,
  assertValidFinalStorageKey,
  createRecordOwner,
  isAttachmentKind,
  isAttachmentSource,
  isAttachmentStatus,
  type AttachmentStatus,
  type RecordAttachment,
  type RecordOwner,
} from "../../../domain/records";
import type { PersistenceDatabase } from "../database";

type RecordAttachmentRow = {
  id: string;
  ownerType: string;
  ownerId: string;
  attachmentKind: string;
  mimeType: string;
  originalName: string | null;
  storageKey: string;
  sizeBytes: number;
  createdAt: string;
  status: string;
  source: string;
  description: string | null;
};

export class SqliteRecordAttachmentRepository
  implements RecordAttachmentRepositoryPort
{
  constructor(private readonly database: PersistenceDatabase) {}

  async findById(id: string): Promise<RecordAttachment | null> {
    const row = await this.database.getFirstAsync<RecordAttachmentRow>(
      `
      SELECT *
      FROM record_attachments
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    return row ? mapRecordAttachmentRow(row) : null;
  }

  async listByOwner(owner: RecordOwner): Promise<RecordAttachment[]> {
    const normalizedOwner = createRecordOwner(owner.ownerType, owner.ownerId);
    const rows = await this.database.getAllAsync<RecordAttachmentRow>(
      `
      SELECT *
      FROM record_attachments
      WHERE ownerType = ? AND ownerId = ?
      ORDER BY createdAt ASC
      `,
      [normalizedOwner.ownerType, normalizedOwner.ownerId],
    );

    return rows.map(mapRecordAttachmentRow);
  }

  async countActiveByOwner(owner: RecordOwner): Promise<number> {
    const normalizedOwner = createRecordOwner(owner.ownerType, owner.ownerId);
    const row = await this.database.getFirstAsync<{ total: number }>(
      `
      SELECT COUNT(*) AS total
      FROM record_attachments
      WHERE ownerType = ? AND ownerId = ? AND status <> 'deleting'
      `,
      [normalizedOwner.ownerType, normalizedOwner.ownerId],
    );

    return Number(row?.total ?? 0);
  }

  async insert(input: RecordAttachmentInsertInput): Promise<void> {
    const attachment = mapRecordAttachmentRow(input);
    await this.database.runAsync(
      `
      INSERT INTO record_attachments (
        id,
        ownerType,
        ownerId,
        attachmentKind,
        mimeType,
        originalName,
        storageKey,
        sizeBytes,
        createdAt,
        status,
        source,
        description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        attachment.id,
        attachment.ownerType,
        attachment.ownerId,
        attachment.attachmentKind,
        attachment.mimeType,
        attachment.originalName,
        attachment.storageKey,
        attachment.sizeBytes,
        attachment.createdAt,
        attachment.status,
        attachment.source,
        attachment.description,
      ],
    );
  }

  async updateStatus(id: string, status: AttachmentStatus): Promise<void> {
    const attachment = await this.findById(id);
    if (!attachment) {
      return;
    }

    assertAttachmentStatusTransition(attachment.status, status);
    await this.database.runAsync(
      `
      UPDATE record_attachments
      SET status = ?
      WHERE id = ?
      `,
      [status, id],
    );
  }

  async updateStatusIfCurrent(
    id: string,
    from: AttachmentStatus,
    to: AttachmentStatus,
  ): Promise<boolean> {
    assertAttachmentStatusTransition(from, to);
    const result = await this.database.runAsync(
      `
      UPDATE record_attachments
      SET status = ?
      WHERE id = ? AND status = ?
      `,
      [to, id, from],
    );

    return Number(result.changes ?? 0) > 0;
  }

  async deleteMetadata(id: string): Promise<void> {
    await this.database.runAsync(
      `
      DELETE FROM record_attachments
      WHERE id = ?
      `,
      [id],
    );
  }

  async listByStatus(status: AttachmentStatus): Promise<RecordAttachment[]> {
    const rows = await this.database.getAllAsync<RecordAttachmentRow>(
      `
      SELECT *
      FROM record_attachments
      WHERE status = ?
      ORDER BY createdAt ASC
      `,
      [status],
    );

    return rows.map(mapRecordAttachmentRow);
  }

  async listAll(): Promise<RecordAttachment[]> {
    const rows = await this.database.getAllAsync<RecordAttachmentRow>(
      `
      SELECT *
      FROM record_attachments
      ORDER BY createdAt ASC
      `,
    );

    return rows.map(mapRecordAttachmentRow);
  }

  async markOwnerAttachmentsDeleting(owner: RecordOwner): Promise<number> {
    const normalizedOwner = createRecordOwner(owner.ownerType, owner.ownerId);
    const result = await this.database.runAsync(
      `
      UPDATE record_attachments
      SET status = 'deleting'
      WHERE ownerType = ? AND ownerId = ? AND status IN ('ready', 'failed', 'missing')
      `,
      [normalizedOwner.ownerType, normalizedOwner.ownerId],
    );

    return Number(result.changes ?? 0);
  }
}

function mapRecordAttachmentRow(row: RecordAttachmentRow): RecordAttachment {
  const owner = createRecordOwner(row.ownerType, row.ownerId);
  assertValidFinalStorageKey(row.storageKey);

  if (!isAttachmentKind(row.attachmentKind)) {
    throw new Error("Invalid attachment kind in database");
  }

  if (!isAttachmentStatus(row.status)) {
    throw new Error("Invalid attachment status in database");
  }

  if (!isAttachmentSource(row.source)) {
    throw new Error("Invalid attachment source in database");
  }

  if (!Number.isFinite(row.sizeBytes) || row.sizeBytes < 0) {
    throw new Error("Invalid attachment size in database");
  }

  return {
    id: row.id,
    ownerType: owner.ownerType,
    ownerId: row.ownerId,
    attachmentKind: row.attachmentKind,
    mimeType: row.mimeType,
    originalName: row.originalName,
    storageKey: row.storageKey,
    sizeBytes: row.sizeBytes,
    createdAt: row.createdAt,
    status: row.status,
    source: row.source,
    description: row.description,
  };
}
