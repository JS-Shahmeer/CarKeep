import * as DocumentPicker from "expo-document-picker";
import { eq } from "drizzle-orm";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { db, documents } from "../../db";
import { deleteReceiptFile } from "../../lib/files";
import { logger } from "../../lib/logger";
import { ALLOWED_MIME_TYPES, type PickedFile } from "./domain";

/** Opens the OS photo picker. Returns null if the user cancels. */
export async function pickReceiptPhoto(): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? "image/jpeg",
    bytes: asset.fileSize ?? 0,
    name: asset.fileName ?? "receipt.jpg",
  };
}

/** Opens the OS document picker, restricted to the brief's allowed receipt types. */
export async function pickReceiptDocument(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [...ALLOWED_MIME_TYPES],
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? "application/octet-stream",
    bytes: asset.size ?? 0,
    name: asset.name,
  };
}

export async function shareReceipt(localPath: string, mimeType: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    logger.warn("sharing_unavailable");
    return;
  }
  await Sharing.shareAsync(localPath, { mimeType });
}

/**
 * Deletes a document's row and its on-disk file together. Used both for
 * "remove this receipt" and as part of deleting a service record (CK-07:
 * "Deleting service record removes associated app-managed file").
 */
export async function deleteDocument(id: string): Promise<void> {
  const row = await db.select().from(documents).where(eq(documents.id, id)).get();
  if (!row) return;

  await db.delete(documents).where(eq(documents.id, id));
  await deleteReceiptFile(row.localPath);
}

export async function getDocumentsForService(serviceId: string) {
  return db.select().from(documents).where(eq(documents.serviceId, serviceId));
}
