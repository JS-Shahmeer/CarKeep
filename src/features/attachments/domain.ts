/** CK-07: "Validate file type/size and keep in app-private storage." */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024; // 10 MB

export interface AttachmentValidationError {
  code: "unsupported_type" | "too_large";
  message: string;
}

export function validateAttachment(
  mimeType: string,
  bytes: number,
): AttachmentValidationError | undefined {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
    return { code: "unsupported_type", message: "Only JPEG, PNG or PDF receipts are supported." };
  }
  if (bytes > MAX_RECEIPT_BYTES) {
    return { code: "too_large", message: "Receipts must be 10 MB or smaller." };
  }
  return undefined;
}

export interface PickedFile {
  uri: string;
  mimeType: string;
  bytes: number;
  name: string;
}
