import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import type { AttachmentSource } from "../../domain/records";

export type PickedRecordAttachment = Readonly<{
  sourceUri: string;
  originalName: string | null;
  declaredMimeType: string | null;
  declaredSizeBytes: number | null;
  source: AttachmentSource;
}>;

export type RecordAttachmentPickerResult =
  | Readonly<{ status: "selected"; file: PickedRecordAttachment }>
  | Readonly<{ status: "cancelled" }>
  | Readonly<{ status: "permission_denied" }>
  | Readonly<{ status: "error"; message: string }>;

export async function pickCameraAttachment(): Promise<RecordAttachmentPickerResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { status: "permission_denied" };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });

  return mapImagePickerResult(result, "camera");
}

export async function pickGalleryAttachment(): Promise<RecordAttachmentPickerResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { status: "permission_denied" };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    allowsMultipleSelection: false,
    quality: 1,
  });

  return mapImagePickerResult(result, "gallery");
}

export async function pickPdfAttachment(): Promise<RecordAttachmentPickerResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return { status: "cancelled" };
  }

  const asset = result.assets[0];
  if (!asset) {
    return { status: "error", message: "No se ha podido leer el documento." };
  }

  return {
    status: "selected",
    file: {
      sourceUri: asset.uri,
      originalName: asset.name ?? null,
      declaredMimeType: asset.mimeType ?? null,
      declaredSizeBytes: asset.size ?? null,
      source: "document",
    },
  };
}

function mapImagePickerResult(
  result: ImagePicker.ImagePickerResult,
  source: "camera" | "gallery",
): RecordAttachmentPickerResult {
  if (result.canceled) {
    return { status: "cancelled" };
  }

  const asset = result.assets[0];
  if (!asset || asset.type !== "image") {
    return { status: "error", message: "Selecciona una imagen compatible." };
  }

  return {
    status: "selected",
    file: {
      sourceUri: asset.uri,
      originalName: asset.fileName ?? null,
      declaredMimeType: asset.mimeType ?? null,
      declaredSizeBytes: asset.fileSize ?? null,
      source,
    },
  };
}
