export type ManagedFileEntry = Readonly<{
  storageKey: string;
  modifiedAt: Date | null;
}>;

export type AttachmentFileStorageCopyResult = Readonly<{
  temporaryStorageKey: string;
}>;

export interface AttachmentFileStoragePort {
  copyToTemporary(input: {
    sourceUri: string;
    temporaryStorageKey: string;
  }): Promise<AttachmentFileStorageCopyResult>;

  confirmTemporary(input: {
    temporaryStorageKey: string;
    storageKey: string;
  }): Promise<void>;

  exists(storageKey: string): Promise<boolean>;

  getSizeBytes(storageKey: string): Promise<number | null>;

  delete(storageKey: string): Promise<void>;

  quarantine(storageKey: string): Promise<void>;

  listTemporaryFiles(): Promise<ManagedFileEntry[]>;

  listFinalFiles(): Promise<ManagedFileEntry[]>;

  resolveUri(storageKey: string): string;
}
