import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { Linking, Platform } from "react-native";

export type AttachmentFileActionResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; error: "UNAVAILABLE" | "FAILED" }>;

const ACTION_VIEW = "android.intent.action.VIEW";
const FLAG_GRANT_READ_URI_PERMISSION = 1;

export async function openAttachmentUri(input: {
  uri: string;
  mimeType: string;
}): Promise<AttachmentFileActionResult> {
  try {
    const contentUri =
      input.uri.startsWith("file://") && FileSystem.getContentUriAsync
        ? await FileSystem.getContentUriAsync(input.uri)
        : input.uri;

    if (Platform.OS === "android") {
      await IntentLauncher.startActivityAsync(ACTION_VIEW, {
        data: contentUri,
        type: input.mimeType,
        flags: FLAG_GRANT_READ_URI_PERMISSION,
      });
    } else {
      await Linking.openURL(contentUri);
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "FAILED" };
  }
}

export async function shareAttachmentUri(input: {
  uri: string;
  mimeType: string;
  dialogTitle?: string | null;
}): Promise<AttachmentFileActionResult> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return { ok: false, error: "UNAVAILABLE" };
  }

  try {
    await Sharing.shareAsync(input.uri, {
      mimeType: input.mimeType,
      dialogTitle: input.dialogTitle ?? undefined,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "FAILED" };
  }
}
