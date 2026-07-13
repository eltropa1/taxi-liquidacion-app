import * as FileSystem from "expo-file-system/legacy";
import type {
  AttachmentFileStorageCopyResult,
  AttachmentFileStoragePort,
  ManagedFileEntry,
} from "../../application/ports/runtime";
import { assertManagedStorageKey } from "../../domain/records";

type FileSystemLike = Pick<
  typeof FileSystem,
  | "copyAsync"
  | "deleteAsync"
  | "getInfoAsync"
  | "makeDirectoryAsync"
  | "moveAsync"
  | "readDirectoryAsync"
>;

type FileInfo = Awaited<ReturnType<FileSystemLike["getInfoAsync"]>>;

const DEFAULT_ROOT_NAME = "geotaxi";
const QUARANTINE_ROOT = "quarantine";

export class ExpoAttachmentFileStorage implements AttachmentFileStoragePort {
  constructor(
    private readonly rootUri = `${FileSystem.documentDirectory}${DEFAULT_ROOT_NAME}/`,
    private readonly fileSystem: FileSystemLike = FileSystem,
  ) {}

  async copyToTemporary(input: {
    sourceUri: string;
    temporaryStorageKey: string;
  }): Promise<AttachmentFileStorageCopyResult> {
    this.assertTemporaryKey(input.temporaryStorageKey);
    const destinationUri = this.resolveUri(input.temporaryStorageKey);
    await this.ensureParentDirectory(destinationUri);
    await this.fileSystem.copyAsync({
      from: input.sourceUri,
      to: destinationUri,
    });

    return { temporaryStorageKey: input.temporaryStorageKey };
  }

  async confirmTemporary(input: {
    temporaryStorageKey: string;
    storageKey: string;
  }): Promise<void> {
    this.assertTemporaryKey(input.temporaryStorageKey);
    this.assertFinalKey(input.storageKey);
    const from = this.resolveUri(input.temporaryStorageKey);
    const to = this.resolveUri(input.storageKey);
    await this.ensureParentDirectory(to);
    await this.fileSystem.moveAsync({ from, to });
  }

  async exists(storageKey: string): Promise<boolean> {
    const info = await this.getInfo(storageKey);
    return info.exists;
  }

  async getSizeBytes(storageKey: string): Promise<number | null> {
    const info = await this.getInfo(storageKey);
    if (!info.exists) {
      return null;
    }

    return typeof info.size === "number" ? info.size : null;
  }

  async delete(storageKey: string): Promise<void> {
    this.assertManagedKey(storageKey);
    await this.fileSystem.deleteAsync(this.resolveUri(storageKey), {
      idempotent: true,
    });
  }

  async quarantine(storageKey: string): Promise<void> {
    this.assertFinalKey(storageKey);
    const sourceUri = this.resolveUri(storageKey);
    const quarantineKey = `${QUARANTINE_ROOT}/${storageKey}`;
    const destinationUri = this.resolveUri(quarantineKey);
    await this.ensureParentDirectory(destinationUri);
    const exists = await this.exists(storageKey);
    if (exists) {
      await this.fileSystem.moveAsync({ from: sourceUri, to: destinationUri });
    }
  }

  async listTemporaryFiles(): Promise<ManagedFileEntry[]> {
    return this.listRecursive("temp/attachments");
  }

  async listFinalFiles(): Promise<ManagedFileEntry[]> {
    return this.listRecursive("attachments");
  }

  resolveUri(storageKey: string): string {
    this.assertManagedKey(storageKey);
    const uri = `${this.rootUri}${storageKey}`;
    if (!uri.startsWith(this.rootUri)) {
      throw new Error("Resolved attachment URI escaped managed root");
    }

    return uri;
  }

  private async listRecursive(storageKey: string): Promise<ManagedFileEntry[]> {
    this.assertManagedKey(storageKey);
    const rootUri = this.resolveUri(storageKey);
    const rootInfo = await this.fileSystem.getInfoAsync(rootUri);
    if (!rootInfo.exists) {
      return [];
    }

    const entries: ManagedFileEntry[] = [];
    await this.collectEntries(storageKey, entries);
    return entries;
  }

  private async collectEntries(
    storageKey: string,
    entries: ManagedFileEntry[],
  ): Promise<void> {
    const uri = this.resolveUri(storageKey);
    const names = await this.fileSystem.readDirectoryAsync(uri);

    for (const name of names) {
      const childKey = `${storageKey}/${name}`;
      this.assertManagedKey(childKey);
      const info = await this.fileSystem.getInfoAsync(this.resolveUri(childKey));

      if (info.exists && info.isDirectory) {
        await this.collectEntries(childKey, entries);
        continue;
      }

      if (info.exists) {
        entries.push({
          storageKey: childKey,
          modifiedAt:
            typeof info.modificationTime === "number"
              ? new Date(info.modificationTime * 1000)
              : null,
        });
      }
    }
  }

  private async getInfo(storageKey: string): Promise<FileInfo> {
    this.assertManagedKey(storageKey);
    return this.fileSystem.getInfoAsync(this.resolveUri(storageKey));
  }

  private async ensureParentDirectory(uri: string): Promise<void> {
    const parentUri = uri.substring(0, uri.lastIndexOf("/") + 1);
    if (!parentUri.startsWith(this.rootUri)) {
      throw new Error("Attachment directory escaped managed root");
    }

    await this.fileSystem.makeDirectoryAsync(parentUri, {
      intermediates: true,
    });
  }

  private assertFinalKey(storageKey: string): void {
    this.assertManagedKey(storageKey);
    if (!storageKey.startsWith("attachments/")) {
      throw new Error("Attachment storage key must be final");
    }
  }

  private assertTemporaryKey(storageKey: string): void {
    this.assertManagedKey(storageKey);
    if (!storageKey.startsWith("temp/attachments/")) {
      throw new Error("Attachment storage key must be temporary");
    }
  }

  private assertManagedKey(storageKey: string): void {
    assertManagedStorageKey(storageKey);
    if (
      storageKey !== "attachments" &&
      !storageKey.startsWith("attachments/") &&
      storageKey !== "temp/attachments" &&
      !storageKey.startsWith("temp/attachments/") &&
      !storageKey.startsWith(`${QUARANTINE_ROOT}/attachments/`)
    ) {
      throw new Error("Attachment storage key is outside managed roots");
    }
  }
}
