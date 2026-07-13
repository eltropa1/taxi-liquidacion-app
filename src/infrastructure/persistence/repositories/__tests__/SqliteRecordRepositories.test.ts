import { SqliteRecordAttachmentRepository } from "../SqliteRecordAttachmentRepository";
import { SqliteRecordNoteRepository } from "../SqliteRecordNoteRepository";

describe("SQLite record enrichment repositories", () => {
  it("upserts one note per owner and never stores an empty body", async () => {
    const db = {
      runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
      getFirstAsync: jest.fn().mockResolvedValue({
        id: 1,
        ownerType: "registered_service",
        ownerId: "12",
        body: "fixed meter note",
        createdAt: "2026-07-01T08:00:00.000Z",
        updatedAt: "2026-07-01T08:00:00.000Z",
      }),
      getAllAsync: jest.fn(),
      execAsync: jest.fn(),
    };
    const repository = new SqliteRecordNoteRepository(db as any);

    const note = await repository.upsert({
      owner: { ownerType: "registered_service", ownerId: "12" },
      body: " fixed meter note ",
      createdAt: "2026-07-01T08:00:00.000Z",
      updatedAt: "2026-07-01T08:00:00.000Z",
    });

    expect(note.body).toBe("fixed meter note");
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT(ownerType, ownerId)"),
      [
        "registered_service",
        "12",
        "fixed meter note",
        "2026-07-01T08:00:00.000Z",
        "2026-07-01T08:00:00.000Z",
      ],
    );
    await expect(
      repository.upsert({
        owner: { ownerType: "registered_service", ownerId: "12" },
        body: " ",
        createdAt: "2026-07-01T08:00:00.000Z",
        updatedAt: "2026-07-01T08:00:00.000Z",
      }),
    ).rejects.toThrow("Cannot persist an empty record note");
  });

  it("inserts, counts and transitions attachments through constrained SQL", async () => {
    const db = {
      runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
      getFirstAsync: jest
        .fn()
        .mockResolvedValueOnce({ total: 1 })
        .mockResolvedValueOnce({
          id: "att-1",
          ownerType: "registered_service",
          ownerId: "12",
          attachmentKind: "document",
          mimeType: "application/pdf",
          originalName: "ticket.pdf",
          storageKey: "attachments/registered_service/12/att-1.pdf",
          sizeBytes: 120,
          createdAt: "2026-07-01T08:00:00.000Z",
          status: "ready",
          source: "document",
          description: null,
        }),
      getAllAsync: jest.fn().mockResolvedValue([]),
      execAsync: jest.fn(),
    };
    const repository = new SqliteRecordAttachmentRepository(db as any);

    await repository.insert({
      id: "att-1",
      ownerType: "registered_service",
      ownerId: "12",
      attachmentKind: "document",
      mimeType: "application/pdf",
      originalName: "ticket.pdf",
      storageKey: "attachments/registered_service/12/att-1.pdf",
      sizeBytes: 120,
      createdAt: "2026-07-01T08:00:00.000Z",
      status: "pending",
      source: "document",
      description: null,
    });
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO record_attachments"),
      expect.arrayContaining(["att-1", "registered_service", "12"]),
    );

    await expect(repository.countActiveByOwner({
      ownerType: "registered_service",
      ownerId: "12",
    })).resolves.toBe(1);

    await expect(repository.updateStatus("att-1", "pending")).rejects.toThrow(
      "Invalid attachment status transition",
    );
  });
});
