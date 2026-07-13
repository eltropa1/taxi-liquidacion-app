import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { Linking, Platform } from "react-native";
import { openAttachmentUri, shareAttachmentUri } from "../AttachmentFileActions";

jest.mock("expo-file-system/legacy", () => ({
  getContentUriAsync: jest.fn(),
}));

jest.mock("expo-intent-launcher", () => ({
  startActivityAsync: jest.fn(),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock("react-native", () => ({
  Linking: {
    openURL: jest.fn(),
  },
  Platform: {
    OS: "android",
  },
}));

const mockedFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockedIntentLauncher = IntentLauncher as jest.Mocked<typeof IntentLauncher>;
const mockedSharing = Sharing as jest.Mocked<typeof Sharing>;
const mockedLinking = Linking as jest.Mocked<typeof Linking>;

describe("AttachmentFileActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "android";
    mockedFileSystem.getContentUriAsync?.mockResolvedValue(
      "content://com.taxiliquidacionapp.FileSystemFileProvider/item",
    );
    mockedIntentLauncher.startActivityAsync.mockResolvedValue({
      resultCode: 0,
    } as any);
    mockedSharing.isAvailableAsync.mockResolvedValue(true);
    mockedSharing.shareAsync.mockResolvedValue(undefined);
  });

  it.each([
    ["JPEG", "image/jpeg"],
    ["PNG", "image/png"],
    ["WebP", "image/webp"],
    ["PDF", "application/pdf"],
  ])("opens %s attachments with MIME and temporary read permission", async (_, mimeType) => {
    await expect(
      openAttachmentUri({
        uri: "file:///app/geotaxi/attachments/file",
        mimeType,
      }),
    ).resolves.toEqual({ ok: true });

    expect(mockedFileSystem.getContentUriAsync).toHaveBeenCalledWith(
      "file:///app/geotaxi/attachments/file",
    );
    expect(mockedIntentLauncher.startActivityAsync).toHaveBeenCalledWith(
      "android.intent.action.VIEW",
      {
        data: "content://com.taxiliquidacionapp.FileSystemFileProvider/item",
        type: mimeType,
        flags: 1,
      },
    );
    expect(mockedLinking.openURL).not.toHaveBeenCalled();
  });

  it("returns a controlled error when Android rejects the view intent", async () => {
    mockedIntentLauncher.startActivityAsync.mockRejectedValue(
      new Error("No activity found"),
    );

    await expect(
      openAttachmentUri({
        uri: "file:///app/geotaxi/attachments/file",
        mimeType: "image/png",
      }),
    ).resolves.toEqual({ ok: false, error: "FAILED" });
  });

  it("keeps sharing delegated to expo-sharing with the original file URI", async () => {
    await expect(
      shareAttachmentUri({
        uri: "file:///app/geotaxi/attachments/file.pdf",
        mimeType: "application/pdf",
        dialogTitle: "ticket.pdf",
      }),
    ).resolves.toEqual({ ok: true });

    expect(mockedSharing.shareAsync).toHaveBeenCalledWith(
      "file:///app/geotaxi/attachments/file.pdf",
      {
        mimeType: "application/pdf",
        dialogTitle: "ticket.pdf",
      },
    );
  });

  it("reports unavailable sharing without attempting to share", async () => {
    mockedSharing.isAvailableAsync.mockResolvedValue(false);

    await expect(
      shareAttachmentUri({
        uri: "file:///app/geotaxi/attachments/file.pdf",
        mimeType: "application/pdf",
      }),
    ).resolves.toEqual({ ok: false, error: "UNAVAILABLE" });

    expect(mockedSharing.shareAsync).not.toHaveBeenCalled();
  });
});
