import { z } from "zod";

/** CK-03: "oil change, tyres, brakes, battery, inspection, repair or custom." */
export const SERVICE_TYPES = [
  "oil_change",
  "tyres",
  "brakes",
  "battery",
  "inspection",
  "repair",
  "custom",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  oil_change: "Oil change",
  tyres: "Tyres",
  brakes: "Brakes",
  battery: "Battery",
  inspection: "Inspection",
  repair: "Repair",
  custom: "Custom",
};

export const serviceRecordFormSchema = z.object({
  vehicleId: z.string().min(1, "Choose a car"),
  type: z.enum(SERVICE_TYPES),
  serviceOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  odometer: z.number().int().min(0).optional(),
  /** Major currency units (e.g. dollars) as typed by the user; the repo converts to minor units. */
  price: z.number().min(0).optional(),
  provider: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type ServiceRecordFormValues = z.infer<typeof serviceRecordFormSchema>;

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  type: string;
  serviceOn: string;
  odometerMeters: number | null;
  priceMinor: number | null;
  provider: string | null;
  notes: string | null;
  receiptDocumentId: string | null;
  createdAt: string;
}
