import {
  RECORD_ATTACHMENT_LIMITS,
  type AttachmentStatus,
  type RecordAttachment,
  type RecordNote,
} from "../../domain/records";

export type RecordAttachmentAction =
  | "open"
  | "share"
  | "delete"
  | "retry";

export type RecordAttachmentListItem = Readonly<{
  id: string;
  title: string;
  kindLabel: string;
  sizeLabel: string;
  status: AttachmentStatus;
  statusLabel: string;
  actions: RecordAttachmentAction[];
  available: boolean;
}>;

export type RecordEnrichmentProjection = Readonly<{
  noteLabel: string;
  hasNote: boolean;
  attachments: RecordAttachmentListItem[];
  attachmentCountLabel: string;
  canAddAttachment: boolean;
  limitLabel: string;
}>;

const statusLabels: Record<AttachmentStatus, string> = {
  pending: "Importando...",
  ready: "Disponible",
  failed: "No se pudo anadir",
  missing: "Archivo no disponible",
  deleting: "Eliminando...",
};

export function buildRecordEnrichmentProjection(input: {
  note: RecordNote | null;
  attachments: RecordAttachment[];
}): RecordEnrichmentProjection {
  const visibleAttachments = input.attachments.filter(
    (attachment) => attachment.status !== "deleting",
  );
  const activeCount = input.attachments.filter(
    (attachment) => attachment.status !== "deleting",
  ).length;

  return {
    noteLabel: input.note?.body ?? "Sin nota",
    hasNote: Boolean(input.note),
    attachments: visibleAttachments.map(projectAttachment),
    attachmentCountLabel: `${activeCount}/${RECORD_ATTACHMENT_LIMITS.maxAttachmentsPerOwner}`,
    canAddAttachment:
      activeCount < RECORD_ATTACHMENT_LIMITS.maxAttachmentsPerOwner,
    limitLabel: `Maximo ${RECORD_ATTACHMENT_LIMITS.maxAttachmentsPerOwner} adjuntos de hasta ${formatBytes(
      RECORD_ATTACHMENT_LIMITS.maxSizeBytes,
    )}.`,
  };
}

function projectAttachment(
  attachment: RecordAttachment,
): RecordAttachmentListItem {
  const actions: RecordAttachmentAction[] = [];
  if (attachment.status === "ready") {
    actions.push("open", "share", "delete");
  } else if (attachment.status === "failed") {
    actions.push("delete");
  } else if (attachment.status === "missing") {
    actions.push("delete");
  }

  return {
    id: attachment.id,
    title: attachment.originalName ?? fallbackAttachmentName(attachment),
    kindLabel: attachment.attachmentKind === "image" ? "Imagen" : "PDF",
    sizeLabel: formatBytes(attachment.sizeBytes),
    status: attachment.status,
    statusLabel: statusLabels[attachment.status],
    actions,
    available: attachment.status === "ready",
  };
}

function fallbackAttachmentName(attachment: RecordAttachment): string {
  return attachment.attachmentKind === "image" ? "Imagen adjunta" : "PDF adjunto";
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${formatNumber(bytes / (1024 * 1024))} MB`;
  }

  if (bytes >= 1024) {
    return `${formatNumber(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value);
}
