import { Directory, File, Paths } from "expo-file-system";
import { generateId } from "./uuid";

function extensionFor(mimeType: string): string {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png") return "png";
  return "jpg";
}

function receiptsDir(): Directory {
  const dir = new Directory(Paths.document, "receipts");
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

/**
 * Copies a file the OS picker returned (a transient URI that can expire)
 * into app-private storage with a stable name, per brief 04.1: "Store file
 * references as app-private relative paths or stable IDs, not temporary
 * picker URLs that may expire."
 */
export async function copyToReceiptsDir(
  sourceUri: string,
  mimeType: string,
): Promise<{ localPath: string; bytes: number }> {
  const destination = new File(receiptsDir(), `${generateId()}.${extensionFor(mimeType)}`);
  const source = new File(sourceUri);
  await source.copy(destination);

  const info = destination.info();
  return { localPath: destination.uri, bytes: info.exists ? (info.size ?? 0) : 0 };
}

/** Best-effort delete — never throws, since a missing file shouldn't block a DB write/cleanup. */
export async function deleteReceiptFile(localPath: string): Promise<void> {
  try {
    new File(localPath).delete();
  } catch {
    // Nothing more we can do; the DB row is the source of truth going forward.
  }
}
