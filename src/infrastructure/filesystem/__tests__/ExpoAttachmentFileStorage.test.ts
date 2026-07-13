import { ExpoAttachmentFileStorage } from "../ExpoAttachmentFileStorage";

jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///app/",
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  moveAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
}));

type StoredFile = Readonly<{
  size: number;
  modificationTime: number;
}>;

function createFileSystem(files: Map<string, StoredFile>) {
  return {
    copyAsync: jest.fn(async ({ to }: { from: string; to: string }) => {
      files.set(to, { size: 120, modificationTime: 100 });
    }),
    deleteAsync: jest.fn(async (uri: string) => {
      files.delete(uri);
    }),
    getInfoAsync: jest.fn(async (uri: string) => {
      if (files.has(uri)) {
        const file = files.get(uri)!;
        return {
          exists: true,
          isDirectory: false,
          size: file.size,
          modificationTime: file.modificationTime,
        };
      }

      const directoryPrefix = uri.endsWith("/") ? uri : `${uri}/`;
      const hasChildren = Array.from(files.keys()).some((key) =>
        key.startsWith(directoryPrefix),
      );
      if (hasChildren) {
        return {
          exists: true,
          isDirectory: true,
          modificationTime: 100,
        };
      }

      return { exists: false, isDirectory: false };
    }),
    makeDirectoryAsync: jest.fn(async () => undefined),
    moveAsync: jest.fn(async ({ from, to }: { from: string; to: string }) => {
      const file = files.get(from);
      if (!file) {
        throw new Error("missing source");
      }
      files.delete(from);
      files.set(to, file);
    }),
    readDirectoryAsync: jest.fn(async (uri: string) => {
      const prefix = uri.endsWith("/") ? uri : `${uri}/`;
      const names = new Set<string>();
      for (const key of files.keys()) {
        if (key.startsWith(prefix)) {
          const rest = key.slice(prefix.length);
          names.add(rest.split("/")[0]);
        }
      }
      return Array.from(names);
    }),
  };
}

describe("ExpoAttachmentFileStorage", () => {
  it("copies, confirms, sizes and deletes inside the managed root", async () => {
    const files = new Map<string, StoredFile>();
    const fileSystem = createFileSystem(files);
    const storage = new ExpoAttachmentFileStorage(
      "file:///app/geotaxi/",
      fileSystem as any,
    );

    await storage.copyToTemporary({
      sourceUri: "content://picked/file",
      temporaryStorageKey: "temp/attachments/att-1.pdf",
    });
    expect(
      await storage.exists("temp/attachments/att-1.pdf"),
    ).toBe(true);
    expect(await storage.getSizeBytes("temp/attachments/att-1.pdf")).toBe(120);

    await storage.confirmTemporary({
      temporaryStorageKey: "temp/attachments/att-1.pdf",
      storageKey: "attachments/registered_service/12/att-1.pdf",
    });

    expect(
      await storage.exists("attachments/registered_service/12/att-1.pdf"),
    ).toBe(true);
    await storage.delete("attachments/registered_service/12/att-1.pdf");
    await storage.delete("attachments/registered_service/12/att-1.pdf");
    expect(
      await storage.exists("attachments/registered_service/12/att-1.pdf"),
    ).toBe(false);
  });

  it("rejects traversal and never resolves outside managed directories", async () => {
    const storage = new ExpoAttachmentFileStorage(
      "file:///app/geotaxi/",
      createFileSystem(new Map()) as any,
    );

    expect(() => storage.resolveUri("../secret.pdf")).toThrow(
      "Invalid managed storage key",
    );
    await expect(
      storage.copyToTemporary({
        sourceUri: "content://picked/file",
        temporaryStorageKey: "attachments/not-temp.pdf",
      }),
    ).rejects.toThrow("Attachment storage key must be temporary");
  });

  it("lists managed temporary and final files", async () => {
    const files = new Map<string, StoredFile>([
      [
        "file:///app/geotaxi/temp/attachments/att-1.pdf",
        { size: 1, modificationTime: 100 },
      ],
      [
        "file:///app/geotaxi/attachments/registered_service/12/att-2.pdf",
        { size: 1, modificationTime: 200 },
      ],
    ]);
    const storage = new ExpoAttachmentFileStorage(
      "file:///app/geotaxi/",
      createFileSystem(files) as any,
    );

    expect(await storage.listTemporaryFiles()).toEqual([
      {
        storageKey: "temp/attachments/att-1.pdf",
        modifiedAt: new Date(100000),
      },
    ]);
    expect(await storage.listFinalFiles()).toEqual([
      {
        storageKey: "attachments/registered_service/12/att-2.pdf",
        modifiedAt: new Date(200000),
      },
    ]);
  });
});
