import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
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
      if (mountedRef.current) {
        setLoading(false);
      }
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

    Alert.alert("Descartar la nota sin guardar?", "", [
      { text: "Seguir editando", style: "cancel" },
      {
        text: "Descartar nota",
        style: "destructive",
        onPress: () => {
          setEditingNote(false);
          setNoteInput(note?.body ?? "");
          setNoteError(null);
        },
      },
    ]);
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
      if (mountedRef.current) {
        setSavingNote(false);
      }
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
      if (mountedRef.current) {
        setImporting(null);
      }
    }
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
      if (mountedRef.current) {
        setBusyAttachmentId(null);
      }
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
      if (mountedRef.current) {
        setBusyAttachmentId(null);
      }
    }
  }

  function confirmDeleteAttachment(item: RecordAttachmentListItem) {
    Alert.alert("Eliminar adjunto", "El adjunto se eliminara de este servicio.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar adjunto",
        style: "destructive",
        onPress: () => deleteAttachment(item.id),
      },
    ]);
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
      if (mountedRef.current) {
        setBusyAttachmentId(null);
      }
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Notas y adjuntos</Text>
        <Text style={styles.counter}>{projection.attachmentCountLabel}</Text>
      </View>

      {loading ? <Text style={styles.helper}>Cargando enriquecimientos...</Text> : null}
      {loadError ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{loadError}</Text>
          <Button title="Reintentar" onPress={load} />
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
                  placeholder="Escribe una nota para este servicio"
                  style={styles.input}
                />
                {noteError ? <Text style={styles.error}>{noteError}</Text> : null}
                <View style={styles.buttonRow}>
                  <Button
                    title={savingNote ? "Guardando nota..." : "Guardar nota"}
                    disabled={savingNote}
                    onPress={saveNote}
                  />
                  <Button
                    title="Cancelar"
                    disabled={savingNote}
                    onPress={cancelNoteEdit}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={projection.hasNote ? styles.noteText : styles.helper}>
                  {projection.noteLabel}
                </Text>
                <Button
                  title={projection.hasNote ? "Editar nota" : "Anadir nota"}
                  onPress={beginEditNote}
                />
              </>
            )}
          </View>

          <View style={styles.attachmentBlock}>
            <Text style={styles.label}>Adjuntos</Text>
            <Text style={styles.helper}>{projection.limitLabel}</Text>
            <View style={styles.buttonRow}>
              <Button
                title={importing === "camera" ? "Importando..." : "Tomar foto"}
                disabled={Boolean(importing) || !projection.canAddAttachment}
                onPress={() => addFromPicker("camera")}
              />
              <Button
                title={importing === "gallery" ? "Importando..." : "Galeria"}
                disabled={Boolean(importing) || !projection.canAddAttachment}
                onPress={() => addFromPicker("gallery")}
              />
              <Button
                title={importing === "pdf" ? "Importando..." : "Adjuntar PDF"}
                disabled={Boolean(importing) || !projection.canAddAttachment}
                onPress={() => addFromPicker("pdf")}
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
    </View>
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
  return (
    <View style={styles.attachmentRow}>
      <View style={styles.attachmentText}>
        <Text style={styles.attachmentTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.helper}>
          {item.kindLabel} - {item.sizeLabel} - {item.statusLabel}
        </Text>
      </View>
      <View style={styles.attachmentActions}>
        {item.actions.includes("open") ? (
          <Pressable disabled={busy} onPress={onOpen}>
            <Text style={styles.link}>{busy ? "..." : "Abrir"}</Text>
          </Pressable>
        ) : null}
        {item.actions.includes("share") ? (
          <Pressable disabled={busy} onPress={onShare}>
            <Text style={styles.link}>Compartir</Text>
          </Pressable>
        ) : null}
        {item.actions.includes("delete") ? (
          <Pressable disabled={busy} onPress={onDelete}>
            <Text style={styles.deleteLink}>Eliminar</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
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
    borderColor: "#e2d8cb",
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1f1a17",
  },
  counter: {
    fontSize: 12,
    color: "#5f564d",
    fontWeight: "800",
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2b2521",
  },
  noteBlock: {
    gap: 8,
  },
  attachmentBlock: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8d0c5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#1f1a17",
  },
  noteText: {
    color: "#211b17",
    fontSize: 14,
    lineHeight: 20,
  },
  helper: {
    fontSize: 12,
    color: "#6b6258",
    lineHeight: 17,
  },
  error: {
    color: "#b42318",
    fontSize: 12,
    fontWeight: "700",
  },
  errorBox: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  attachmentRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee6da",
    paddingTop: 10,
    gap: 8,
  },
  attachmentText: {
    gap: 2,
  },
  attachmentTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#211b17",
  },
  attachmentActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  link: {
    color: "#0066cc",
    fontWeight: "800",
  },
  deleteLink: {
    color: "#b42318",
    fontWeight: "800",
  },
});
