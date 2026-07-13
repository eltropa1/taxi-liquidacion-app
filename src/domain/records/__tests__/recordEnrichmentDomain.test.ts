import {
  RECORD_ATTACHMENT_LIMITS,
  assertAttachmentStatusTransition,
  assertManagedStorageKey,
  buildAttachmentStorageKey,
  createRecordOwner,
  isRecordOwnerType,
  normalizeRecordNoteBody,
  resolveAllowedAttachmentType,
} from "../";

describe("record enrichment domain", () => {
  it("accepts only the approved owner type catalog", () => {
    expect(isRecordOwnerType("registered_service")).toBe(true);
    expect(isRecordOwnerType("expense")).toBe(true);
    expect(isRecordOwnerType("free_text")).toBe(false);
  });

  it("normalizes owner ids as non-empty text", () => {
    expect(createRecordOwner("registered_service", 42)).toEqual({
      ownerType: "registered_service",
      ownerId: "42",
    });
    expect(() => createRecordOwner("registered_service", " ")).toThrow(
      "Invalid record owner id",
    );
  });

  it("normalizes note body and treats blank text as delete", () => {
    expect(normalizeRecordNoteBody("  taxi receipt  ")).toBe("taxi receipt");
    expect(normalizeRecordNoteBody("   ")).toBeNull();
  });

  it("centralizes attachment limits and supported types", () => {
    expect(RECORD_ATTACHMENT_LIMITS.maxAttachmentsPerOwner).toBe(5);
    expect(RECORD_ATTACHMENT_LIMITS.maxSizeBytes).toBe(10 * 1024 * 1024);

    expect(
      resolveAllowedAttachmentType({
        mimeType: "image/jpeg",
        originalName: "ticket.jpg",
      }),
    ).toEqual({
      ok: true,
      mimeType: "image/jpeg",
      attachmentKind: "image",
      extension: "jpg",
    });

    expect(
      resolveAllowedAttachmentType({
        mimeType: null,
        originalName: "document.pdf",
      }),
    ).toEqual({
      ok: true,
      mimeType: "application/pdf",
      attachmentKind: "document",
      extension: "pdf",
    });

    expect(
      resolveAllowedAttachmentType({
        mimeType: "image/jpeg",
        originalName: "ticket.pdf",
      }),
    ).toEqual({ ok: false, reason: "incoherent_type" });
  });

  it("builds canonical relative storage keys and rejects traversal", () => {
    const owner = createRecordOwner("registered_service", "trip:12");
    expect(
      buildAttachmentStorageKey({
        owner,
        attachmentId: "abc-123",
        extension: "pdf",
      }),
    ).toBe("attachments/registered_service/trip_12/abc-123.pdf");

    expect(() => assertManagedStorageKey("../outside.pdf")).toThrow(
      "Invalid managed storage key",
    );
  });

  it("allows only approved status transitions", () => {
    expect(() =>
      assertAttachmentStatusTransition("pending", "ready"),
    ).not.toThrow();
    expect(() =>
      assertAttachmentStatusTransition("ready", "pending"),
    ).toThrow("Invalid attachment status transition");
  });
});
