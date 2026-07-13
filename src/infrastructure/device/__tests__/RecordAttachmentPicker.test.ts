import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  pickCameraAttachment,
  pickGalleryAttachment,
  pickPdfAttachment,
} from "../RecordAttachmentPicker";

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

const mockedImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockedDocumentPicker = DocumentPicker as jest.Mocked<typeof DocumentPicker>;

describe("RecordAttachmentPicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests camera permission only for camera and maps a captured image", async () => {
    mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      granted: true,
    } as any);
    mockedImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file:///camera.jpg",
          type: "image",
          fileName: "camera.jpg",
          mimeType: "image/jpeg",
          fileSize: 1234,
        },
      ],
    } as any);

    await expect(pickCameraAttachment()).resolves.toEqual({
      status: "selected",
      file: {
        sourceUri: "file:///camera.jpg",
        originalName: "camera.jpg",
        declaredMimeType: "image/jpeg",
        declaredSizeBytes: 1234,
        source: "camera",
      },
    });
    expect(mockedImagePicker.launchCameraAsync).toHaveBeenCalledWith(
      expect.objectContaining({ mediaTypes: ["images"] }),
    );
  });

  it("handles denied camera permission and picker cancellation", async () => {
    mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      granted: false,
    } as any);
    await expect(pickCameraAttachment()).resolves.toEqual({
      status: "permission_denied",
    });

    mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
    } as any);
    mockedImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: true,
      assets: null,
    } as any);
    await expect(pickGalleryAttachment()).resolves.toEqual({
      status: "cancelled",
    });
  });

  it("maps gallery images and rejects non-image picker results", async () => {
    mockedImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      granted: true,
    } as any);
    mockedImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file:///gallery.png",
          type: "image",
          fileName: "gallery.png",
          mimeType: "image/png",
          fileSize: 2048,
        },
      ],
    } as any);

    await expect(pickGalleryAttachment()).resolves.toMatchObject({
      status: "selected",
      file: {
        sourceUri: "file:///gallery.png",
        source: "gallery",
      },
    });

    mockedImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///video.mp4", type: "video" }],
    } as any);
    await expect(pickGalleryAttachment()).resolves.toEqual({
      status: "error",
      message: "Selecciona una imagen compatible.",
    });
  });

  it("maps PDF selection and cancellation", async () => {
    mockedDocumentPicker.getDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file:///ticket.pdf",
          name: "ticket.pdf",
          mimeType: undefined,
          size: 4096,
          lastModified: 0,
        },
      ],
    } as any);

    await expect(pickPdfAttachment()).resolves.toEqual({
      status: "selected",
      file: {
        sourceUri: "file:///ticket.pdf",
        originalName: "ticket.pdf",
        declaredMimeType: null,
        declaredSizeBytes: 4096,
        source: "document",
      },
    });
    expect(mockedDocumentPicker.getDocumentAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "application/pdf",
        multiple: false,
        copyToCacheDirectory: true,
      }),
    );

    mockedDocumentPicker.getDocumentAsync.mockResolvedValue({
      canceled: true,
      assets: null,
    } as any);
    await expect(pickPdfAttachment()).resolves.toEqual({
      status: "cancelled",
    });
  });
});
