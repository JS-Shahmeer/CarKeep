import { and, desc, eq, type SQL } from "drizzle-orm";
import { db, documents, runTransaction, serviceRecords } from "../../db";
import { deleteDocument } from "../attachments/repo";
import { deleteReceiptFile } from "../../lib/files";
import { generateId } from "../../lib/uuid";
import { nowIso } from "../../lib/time";
import { majorToMinor } from "../../lib/money";
import type { ServiceRecord, ServiceRecordFormValues } from "./domain";

export interface ServiceRecordFilters {
  vehicleId?: string;
  type?: string;
}

export async function listServiceRecords(
  filters: ServiceRecordFilters = {},
): Promise<ServiceRecord[]> {
  const conditions: SQL[] = [];
  if (filters.vehicleId) conditions.push(eq(serviceRecords.vehicleId, filters.vehicleId));
  if (filters.type) conditions.push(eq(serviceRecords.type, filters.type));

  const base = db.select().from(serviceRecords);
  const filtered = conditions.length > 0 ? base.where(and(...conditions)) : base;
  return filtered.orderBy(desc(serviceRecords.serviceOn));
}

export async function getServiceRecord(id: string): Promise<ServiceRecord | undefined> {
  return db.select().from(serviceRecords).where(eq(serviceRecords.id, id)).get();
}

export interface ReceiptToAttach {
  label: string;
  mimeType: string;
  localPath: string;
  bytes: number;
}

export interface CreateServiceRecordInput extends ServiceRecordFormValues {
  /** Already converted to canonical meters by the caller (R01). */
  odometerMeters?: number;
  receipt?: ReceiptToAttach;
}

/**
 * Brief 04.1: "Persist new/edited records in one database transaction,
 * including references to locally copied files." The receipt file is
 * copied to app-private storage by the caller *before* this runs; if the
 * DB transaction then fails, we clean that copy up so it's never orphaned.
 */
export async function createServiceRecord(input: CreateServiceRecordInput): Promise<ServiceRecord> {
  const id = generateId();
  const now = nowIso();

  const record: ServiceRecord = {
    id,
    vehicleId: input.vehicleId,
    type: input.type,
    serviceOn: input.serviceOn,
    odometerMeters: input.odometerMeters ?? null,
    priceMinor: input.price !== undefined ? majorToMinor(input.price) : null,
    provider: input.provider ?? null,
    notes: input.notes ?? null,
    receiptDocumentId: null,
    createdAt: now,
  };

  try {
    await runTransaction(async (tx) => {
      await tx.insert(serviceRecords).values(record);

      if (input.receipt) {
        const documentId = generateId();
        await tx.insert(documents).values({
          id: documentId,
          vehicleId: input.vehicleId,
          serviceId: id,
          label: input.receipt.label,
          mimeType: input.receipt.mimeType,
          localPath: input.receipt.localPath,
          bytes: input.receipt.bytes,
          createdAt: now,
        });
        await tx
          .update(serviceRecords)
          .set({ receiptDocumentId: documentId })
          .where(eq(serviceRecords.id, id));
        record.receiptDocumentId = documentId;
      }
    });
  } catch (error) {
    if (input.receipt) {
      await deleteReceiptFile(input.receipt.localPath);
    }
    throw error;
  }

  return record;
}

export interface UpdateServiceRecordInput extends ServiceRecordFormValues {
  id: string;
}

export async function updateServiceRecord(input: UpdateServiceRecordInput): Promise<void> {
  await db
    .update(serviceRecords)
    .set({
      vehicleId: input.vehicleId,
      type: input.type,
      serviceOn: input.serviceOn,
      provider: input.provider ?? null,
      notes: input.notes ?? null,
      priceMinor: input.price !== undefined ? majorToMinor(input.price) : null,
    })
    .where(eq(serviceRecords.id, input.id));
}

/**
 * CK-07: "Deleting service record removes associated app-managed file."
 * The document row would cascade automatically via the FK, but its file on
 * disk would not — so the document (and its file) is deleted explicitly
 * first.
 */
export async function deleteServiceRecord(id: string): Promise<void> {
  const record = await getServiceRecord(id);
  if (!record) return;

  if (record.receiptDocumentId) {
    await deleteDocument(record.receiptDocumentId);
  }

  await db.delete(serviceRecords).where(eq(serviceRecords.id, id));
}
