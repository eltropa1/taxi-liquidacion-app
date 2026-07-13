import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RecordEnrichmentService } from "../../application/records";
import type { RecordAttachment, RecordNote } from "../../domain/records";
import {
  buildRecordEnrichmentProjection,
  type RecordAttachmentListItem,
} from "../../presentation";
import {
  openAttachmentUri,
  pickCameraAttachment,
  pickGalleryAttachment,
  pickPdfAttachment,
  shareAttachmentUri,
  type PickedRecordAttachment,
} from "../../infrastructure/device";

type EnrichmentOwner = Readonly<{
  ownerType: "registered_service";
  ownerId: string;
}>;

export function RecordEnrichmentSection({
  owner,
  onDirtyChange,
}: {
  owner: EnrichmentOwner;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const { ownerType, ownerId } = owner;
  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [note, setNote] = useState<RecordNote | null>(null);
  const [attachments, setAttachments] = useState<RecordAttachment[]>([]);
  const [editingNote, setEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [addOptionsVisible, setAddOptionsVisible] = useState(false);
  const [importing, setImporting] = useState<null | "camera" | "gallery" | "pdf">(
    null,
  );
  const [busyAttachmentId, setBusyAttachmentId] = useState<string | null>(null);

  const noteDirty = editingNote && noteInput.trim() !== (note?.body ?? "");

  useEffect(() => {
    onDirtyChange?.(noteDirty);
  }, [noteDirty, onDirtyChange]);

  const projection = useMemo(
    () => buildRecordEnrichmentProjection({ note, attachments }),
    [attachments, note],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const enrichment = await RecordEnrichmentService.getEnrichment({
        ownerType,
        ownerId,
      });
      if (!mountedRef.current) return;
      setNote(enrichment.note);
      setAttachments(enrichment.attachments);
      setNoteInput(enrichment.note?.body ?? "");
    } catch {
      if (!mountedRef.current) return;
      setLoadError(
        "No se han podido cargar notas y adjuntos. El servicio sigue disponible.",
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [ownerId, ownerType]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  function beginEditNote() {
    setNoteError(null);
    setNoteInput(note?.body ?? "");
    setEditingNote(true);
  }

  function cancelNoteEdit() {
    if (!noteDirty) {
      setEditingNote(false);
      setNoteInput(note?.body ?? "");
      setNoteError(null);
      return;
    }

    Alert.alert(
      "Descartar la nota?",
      "El texto que has escrito no se guardara.",
      [
        { text: "Seguir editando", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => {
            setEditingNote(false);
            setNoteInput(note?.body ?? "");
            setNoteError(null);
          },
        },
      ],
    );
  }

  async function saveNote() {
    if (savingNote) return;
    setSavingNote(true);
    setNoteError(null);
    try {
      const result = await RecordEnrichmentService.updateNote({
        ownerType,
        ownerId,
        body: noteInput,
      });
      if (!mountedRef.current) return;
      setNote(result.note);
      setNoteInput(result.note?.body ?? "");
      setEditingNote(false);
    } catch {
      if (!mountedRef.current) return;
      setNoteError("No se ha podido guardar la nota. El texto se conserva.");
    } finally {
      if (mountedRef.current) setSavingNote(false);
    }
  }

  async function importPickedAttachment(
    file: PickedRecordAttachment,
  ): Promise<void> {
    const result = await RecordEnrichmentService.importAttachment({
      ownerType,
      ownerId,
      sourceUri: file.sourceUri,
      originalName: file.originalName,
      declaredMimeType: file.declaredMimeType,
      declaredSizeBytes: file.declaredSizeBytes,
      source: file.source,
    });

    if (!mountedRef.current) return;

    if (!result.ok) {
      setAttachmentError(mapImportError(result.error));
      return;
    }

    setAttachmentError(null);
    await load();
  }

  async function addFromPicker(kind: "camera" | "gallery" | "pdf") {
    if (importing || !projection.canAddAttachment) {
      if (!projection.canAddAttachment) {
        setAttachmentError("Has alcanzado el limite de 5 adjuntos.");
      }
      return;
    }

    setImporting(kind);
    setAttachmentError(null);
    try {
      const result =
        kind === "camera"
          ? await pickCameraAttachment()
          : kind === "gallery"
            ? await pickGalleryAttachment()
            : await pickPdfAttachment();

      if (!mountedRef.current) return;
      if (result.status === "cancelled") return;
      if (result.status === "permission_denied") {
        setAttachmentError("Permiso denegado para acceder a esta funcion.");
        return;
      }
      if (result.status === "error") {
        setAttachmentError(result.message);
        return;
      }

      await importPickedAttachment(result.file);
    } catch {
      if (mountedRef.current) {
        setAttachmentError("No se ha podido importar el adjunto.");
      }
    } finally {
      if (mountedRef.current) setImporting(null);
    }
  }

  function showAddAttachmentOptions() {
    if (!projection.canAddAttachment) {
      setAttachmentError("Has alcanzado el limite de 5 adjuntos.");
      return;
    }

    setAddOptionsVisible(true);
  }

  function selectAddOption(kind: "camera" | "gallery" | "pdf") {
    setAddOptionsVisible(false);
    void addFromPicker(kind);
  }

  async function openAttachment(item: RecordAttachmentListItem) {
    if (busyAttachmentId) return;
    setBusyAttachmentId(item.id);
    setAttachmentError(null);
    try {
      const resolved = await RecordEnrichmentService.resolveAttachmentUri(item.id);
      if (!mountedRef.current) return;
      if (!resolved.ok) {
        setAttachmentError(mapResolveError(resolved.error));
        await load();
        return;
      }

      const result = await openAttachmentUri({
        uri: resolved.uri,
        mimeType: resolved.mimeType,
      });
      if (!result.ok) {
        setAttachmentError("No se ha podido abrir el adjunto en Android.");
      }
    } finally {
      if (mountedRef.current) setBusyAttachmentId(null);
    }
  }

  async function shareAttachment(item: RecordAttachmentListItem) {
    if (busyAttachmentId) return;
    setBusyAttachmentId(item.id);
    setAttachmentError(null);
    try {
      const resolved = await RecordEnrichmentService.resolveAttachmentUri(item.id);
      if (!mountedRef.current) return;
      if (!resolved.ok) {
        setAttachmentError(mapResolveError(resolved.error));
        await load();
        return;
      }

      const result = await shareAttachmentUri({
        uri: resolved.uri,
        mimeType: resolved.mimeType,
        dialogTitle: resolved.originalName,
      });
      if (!result.ok) {
        setAttachmentError(
          result.error === "UNAVAILABLE"
            ? "Compartir no esta disponible en este dispositivo."
            : "No se ha podido compartir el adjunto.",
        );
      }
    } finally {
      if (mountedRef.current) setBusyAttachmentId(null);
    }
  }

  function confirmDeleteAttachment(item: RecordAttachmentListItem) {
    Alert.alert(
      "Eliminar este adjunto?",
      "El adjunto se eliminara de este servicio.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteAttachment(item.id),
        },
      ],
    );
  }

  async function deleteAttachment(id: string) {
    if (busyAttachmentId) return;
    setBusyAttachmentId(id);
    setAttachmentError(null);
    try {
      const result = await RecordEnrichmentService.deleteAttachment(id);
      if (!mountedRef.current) return;
      if (result.pendingFilesystemCleanup) {
        setAttachmentError(
          "El adjunto queda pendiente de limpieza. Se reintentara por reconciliacion.",
        );
      }
      await load();
    } catch {
      if (mountedRef.current) {
        setAttachmentError("No se ha podido eliminar el adjunto.");
      }
    } finally {
      if (mountedRef.current) setBusyAttachmentId(null);
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.sectionHeaderTitle}>
          <MaterialIcons name="description" size={18} color="#0f766e" />
          <Text style={styles.sectionTitle}>Notas y adjuntos</Text>
        </View>
        <Text style={styles.counter}>{projection.attachmentCountLabel}</Text>
      </View>

      {loading ? <Text style={styles.helper}>Cargando enriquecimientos...</Text> : null}
      {loadError ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{loadError}</Text>
          <ActionButton label="Reintentar" onPress={load} variant="secondary" />
        </View>
      ) : null}

      {!loading && !loadError ? (
        <>
          <View style={styles.noteBlock}>
            <Text style={styles.label}>Nota</Text>
            {editingNote ? (
              <>
                <TextInput
                  value={noteInput}
                  onChangeText={setNoteInput}
                  autoFocus
                  multiline
                  placeholder="Escribe una nota para este servicio"
                  placeholderTextColor="#8a9691"
                  style={styles.input}
                />
                {noteError ? <Text style={styles.error}>{noteError}</Text> : null}
                <View style={styles.buttonRow}>
                  <ActionButton
                    label={savingNote ? "Guardando nota..." : "Guardar nota"}
                    disabled={savingNote}
                    onPress={saveNote}
                    variant="primary"
                  />
                  <ActionButton
                    label="Cancelar"
                    disabled={savingNote}
                    onPress={cancelNoteEdit}
                    variant="secondary"
                  />
                </View>
              </>
            ) : (
              <>
                <Text
                  style={projection.hasNote ? styles.noteText : styles.helper}
                  numberOfLines={projection.hasNote ? 5 : undefined}
                >
                  {projection.noteLabel}
                </Text>
                <ActionButton
                  label={projection.hasNote ? "Editar" : "Anadir nota"}
                  onPress={beginEditNote}
                  variant="secondary"
                />
              </>
            )}
          </View>

          <View style={styles.attachmentBlock}>
            <View style={styles.attachmentHeader}>
              <View style={styles.attachmentHeaderText}>
                <Text style={styles.label}>Adjuntos</Text>
                <Text style={styles.helper}>{projection.limitLabel}</Text>
              </View>
              <ActionButton
                label={importing ? "Importando..." : "Anadir"}
                disabled={Boolean(importing) || !projection.canAddAttachment}
                onPress={showAddAttachmentOptions}
                variant="primary"
                icon="add"
              />
            </View>
            {!projection.canAddAttachment ? (
              <Text style={styles.error}>Limite de adjuntos alcanzado.</Text>
            ) : null}
            {attachmentError ? (
              <Text style={styles.error}>{attachmentError}</Text>
            ) : null}

            {projection.attachments.length === 0 ? (
              <Text style={styles.helper}>Sin adjuntos</Text>
            ) : (
              projection.attachments.map((item) => (
                <AttachmentRow
                  key={item.id}
                  item={item}
                  busy={busyAttachmentId === item.id}
                  onOpen={() => openAttachment(item)}
                  onShare={() => shareAttachment(item)}
                  onDelete={() => confirmDeleteAttachment(item)}
                />
              ))
            )}
          </View>
        </>
      ) : null}
      <AttachmentSourceDialog
        visible={addOptionsVisible}
        onClose={() => setAddOptionsVisible(false)}
        onCamera={() => selectAddOption("camera")}
        onGallery={() => selectAddOption("gallery")}
        onPdf={() => selectAddOption("pdf")}
      />
    </View>
  );
}

function AttachmentSourceDialog({
  visible,
  onClose,
  onCamera,
  onGallery,
  onPdf,
}: {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onPdf: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalPanel} accessibilityRole="menu">
          <Text style={styles.modalTitle}>Anadir adjunto</Text>
          <Text style={styles.modalHelper}>Elige el origen del archivo.</Text>
          <DialogOption label="Tomar foto" icon="photo-camera" onPress={onCamera} />
          <DialogOption label="Elegir imagen" icon="image" onPress={onGallery} />
          <DialogOption label="Adjuntar PDF" icon="picture-as-pdf" onPress={onPdf} />
          <DialogOption label="Cancelar" icon="close" onPress={onClose} muted />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DialogOption({
  label,
  icon,
  onPress,
  muted,
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.dialogOption}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={muted ? "#66736f" : "#0f766e"}
      />
      <Text style={[styles.dialogOptionText, muted && styles.dialogOptionMuted]}>
        {label}
      </Text>
    </Pressable>
  );
}

function AttachmentRow({
  item,
  busy,
  onOpen,
  onShare,
  onDelete,
}: {
  item: RecordAttachmentListItem;
  busy: boolean;
  onOpen: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  function showActions() {
    const actions = [];
    if (item.actions.includes("open")) actions.push({ text: "Abrir", onPress: onOpen });
    if (item.actions.includes("share")) {
      actions.push({ text: "Compartir", onPress: onShare });
    }
    if (item.actions.includes("delete")) {
      actions.push({
        text: "Eliminar",
        style: "destructive" as const,
        onPress: onDelete,
      });
    }
    actions.push({ text: "Cancelar", style: "cancel" as const });
    Alert.alert(item.title, item.statusLabel, actions);
  }

  return (
    <Pressable
      onPress={item.actions.includes("open") ? onOpen : showActions}
      disabled={busy || item.status === "pending"}
      style={styles.attachmentRow}
      accessibilityRole="button"
      accessibilityLabel={`Adjunto ${item.title}`}
    >
      <View style={styles.attachmentIcon}>
        <MaterialIcons
          name={item.kindLabel === "Imagen" ? "image" : "picture-as-pdf"}
          size={21}
          color="#0f766e"
        />
      </View>
      <View style={styles.attachmentText}>
        <Text style={styles.attachmentTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.attachmentMeta} numberOfLines={1}>
          {item.kindLabel} - {item.sizeLabel}
        </Text>
      </View>
      <View style={styles.statusAndActions}>
        <Text style={[styles.statusText, statusTone(item.status)]}>
          {busy ? "..." : item.statusLabel}
        </Text>
        {item.actions.length > 0 ? (
          <Pressable
            disabled={busy}
            onPress={showActions}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={`Acciones de ${item.title}`}
          >
            <MaterialIcons name="more-vert" size={22} color="#26302d" />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
  variant,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant: "primary" | "secondary";
  icon?: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.actionButton,
        variant === "primary" ? styles.actionButtonPrimary : styles.actionButtonSecondary,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon ? (
        <MaterialIcons
          name={icon}
          size={17}
          color={variant === "primary" ? "#ffffff" : "#0f766e"}
        />
      ) : null}
      <Text
        style={
          variant === "primary"
            ? styles.actionButtonPrimaryText
            : styles.actionButtonSecondaryText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function statusTone(status: string) {
  if (status === "failed" || status === "missing") return styles.statusError;
  if (status === "pending" || status === "deleting") return styles.statusMuted;
  return styles.statusReady;
}

function mapImportError(error: string): string {
  switch (error) {
    case "OWNER_NOT_FOUND":
      return "El servicio ya no esta disponible.";
    case "ATTACHMENT_LIMIT_REACHED":
      return "Has alcanzado el limite de 5 adjuntos.";
    case "UNSUPPORTED_TYPE":
    case "INCOHERENT_TYPE":
      return "Tipo de archivo no admitido. Usa JPEG, PNG, WebP o PDF.";
    case "FILE_TOO_LARGE":
      return "El archivo supera el limite de 10 MB.";
    case "COPY_FAILED":
      return "No se ha podido copiar el archivo seleccionado.";
    case "PERSISTENCE_FAILED":
      return "No se han podido guardar los metadatos del adjunto.";
    default:
      return "La importacion quedo incompleta. Puedes intentarlo de nuevo.";
  }
}

function mapResolveError(error: string): string {
  switch (error) {
    case "NOT_FOUND":
      return "El adjunto ya no existe.";
    case "NOT_READY":
      return "El adjunto no esta disponible para abrirse.";
    default:
      return "El archivo no esta disponible en el dispositivo.";
  }
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dce3df",
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  sectionHeaderTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#171c1a",
  },
  counter: {
    fontSize: 12,
    color: "#66736f",
    fontWeight: "900",
  },
  label: {
    fontSize: 13,
    fontWeight: "900",
    color: "#26302d",
  },
  noteBlock: {
    gap: 8,
  },
  attachmentBlock: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#dce3df",
    paddingTop: 12,
  },
  attachmentHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  attachmentHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: "#dce3df",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    fontSize: 15,
    color: "#171c1a",
    textAlignVertical: "top",
  },
  noteText: {
    color: "#26302d",
    fontSize: 14,
    lineHeight: 20,
  },
  helper: {
    fontSize: 12,
    color: "#66736f",
    lineHeight: 17,
  },
  error: {
    color: "#b42318",
    fontSize: 12,
    fontWeight: "800",
  },
  errorBox: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  actionButtonPrimary: {
    backgroundColor: "#0f766e",
  },
  actionButtonSecondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce3df",
  },
  actionButtonPrimaryText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  actionButtonSecondaryText: {
    color: "#0f766e",
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.55,
  },
  attachmentRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#edf1ef",
    paddingTop: 10,
  },
  attachmentIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#dff4ef",
  },
  attachmentText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  attachmentTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#26302d",
  },
  attachmentMeta: {
    fontSize: 12,
    color: "#66736f",
  },
  statusAndActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
    maxWidth: 84,
  },
  statusReady: {
    color: "#0f766e",
  },
  statusMuted: {
    color: "#66736f",
  },
  statusError: {
    color: "#b42318",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    padding: 16,
  },
  modalPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#171c1a",
  },
  modalHelper: {
    fontSize: 13,
    color: "#66736f",
    marginBottom: 4,
  },
  dialogOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  dialogOptionText: {
    color: "#0f766e",
    fontWeight: "900",
    fontSize: 15,
  },
  dialogOptionMuted: {
    color: "#66736f",
  },
});
