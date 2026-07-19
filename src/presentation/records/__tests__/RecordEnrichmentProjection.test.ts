import type { RecordAttachment, RecordNote } from "../../../domain/records";
import { buildRecordEnrichmentProjection } from "../RecordEnrichmentProjection";

const note: RecordNote = {
  id: 1,
  ownerType: "registered_service",
  ownerId: "12",
  body: "Cliente solicita justificante",
  createdAt: "2026-07-01T08:00:00.000Z",
  updatedAt: "2026-07-01T08:00:00.000Z",
};

function attachment(
  input: Partial<RecordAttachment> & Pick<RecordAttachment, "id" | "status">,
): RecordAttachment {
  return {
    id: input.id,
    ownerType: "registered_service",
    ownerId: "12",
    attachmentKind: input.attachmentKind ?? "document",
    mimeType: input.mimeType ?? "application/pdf",
    originalName: input.originalName ?? "ticket.pdf",
    storageKey: `attachments/registered_service/12/${input.id}.pdf`,
    sizeBytes: input.sizeBytes ?? 1024,
    createdAt: "2026-07-01T08:00:00.000Z",
    status: input.status,
    source: input.source ?? "document",
    description: null,
  };
}

describe("RecordEnrichmentProjection", () => {
  it("projects note, attachment count and ready actions", () => {
    const projection = buildRecordEnrichmentProjection({
      note,
      attachments: [attachment({ id: "a1", status: "ready" })],
    });

    expect(projection.noteTitle).toBe("Notas");
    expect(projection.noteLabel).toBe("Cliente solicita justificante");
    expect(projection.noteActionLabel).toBe("Editar nota");
    expect(projection.hasNote).toBe(true);
    expect(projection.attachmentCountLabel).toBe("1/5");
    expect(projection.canAddAttachment).toBe(true);
    expect(projection.attachments[0]).toEqual(
      expect.objectContaining({
        title: "ticket.pdf",
        statusLabel: "Disponible",
        actions: ["open", "share", "delete"],
        available: true,
      }),
    );
  });

  it("does not expose deleting attachments and disables add at the active limit", () => {
    const projection = buildRecordEnrichmentProjection({
      note: null,
      attachments: [
        attachment({ id: "a1", status: "ready" }),
        attachment({ id: "a2", status: "pending" }),
        attachment({ id: "a3", status: "failed" }),
        attachment({ id: "a4", status: "missing" }),
        attachment({ id: "a5", status: "ready" }),
        attachment({ id: "a6", status: "deleting" }),
      ],
    });

    expect(projection.noteTitle).toBe("Notas");
    expect(projection.noteLabel).toBe("Sin notas añadidas");
    expect(projection.noteActionLabel).toBe("Añadir nota");
    expect(projection.attachmentCountLabel).toBe("5/5");
    expect(projection.canAddAttachment).toBe(false);
    expect(projection.attachments.map((item) => item.id)).toEqual([
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
    ]);
    expect(projection.attachments.find((item) => item.id === "a2")?.actions).toEqual(
      [],
    );
    expect(projection.attachments.find((item) => item.id === "a3")?.actions).toEqual(
      ["delete"],
    );
    expect(projection.attachments.find((item) => item.id === "a4")?.actions).toEqual(
      ["delete"],
    );
  });
});
