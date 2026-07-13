import type {
  AttachmentStatus,
  RecordAttachment,
  RecordOwner,
} from "../../../domain/records";

export type RecordAttachmentInsertInput = RecordAttachment;

export interface RecordAttachmentRepositoryPort {
  findById(id: string): Promise<RecordAttachment | null>;

  listByOwner(owner: RecordOwner): Promise<RecordAttachment[]>;

  countActiveByOwner(owner: RecordOwner): Promise<number>;

  insert(input: RecordAttachmentInsertInput): Promise<void>;

  updateStatus(id: string, status: AttachmentStatus): Promise<void>;

  updateStatusIfCurrent(
    id: string,
    from: AttachmentStatus,
    to: AttachmentStatus,
  ): Promise<boolean>;

  deleteMetadata(id: string): Promise<void>;

  listByStatus(status: AttachmentStatus): Promise<RecordAttachment[]>;

  listAll(): Promise<RecordAttachment[]>;

  markOwnerAttachmentsDeleting(owner: RecordOwner): Promise<number>;
}
