import { z } from "zod";

const currentYear = new Date().getFullYear();

/**
 * CK-01: nickname required; make/model/year/plate/photo and odometer
 * optional. Odometer here is a *display-unit* value from the form; it is
 * converted to canonical meters by the repo before it is stored (R01).
 */
export const vehicleFormSchema = z.object({
  nickname: z.string().trim().min(1, "Nickname is required").max(60),
  make: z.string().trim().max(40).optional(),
  model: z.string().trim().max(40).optional(),
  year: z
    .number()
    .int()
    .min(1900)
    .max(currentYear + 1)
    .optional(),
  plate: z.string().trim().max(20).optional(),
  odometer: z.number().int().min(0).optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export interface Vehicle {
  id: string;
  nickname: string;
  make: string | null;
  model: string | null;
  year: number | null;
  plate: string | null;
  photoPath: string | null;
  odometerMeters: number | null;
  odometerUpdatedAt: string | null;
  createdAt: string;
}

/**
 * R04: "Current odometer typically increases. For lower edit values, show
 * 'Correct previous reading?' confirmation." Returns whether the UI must
 * confirm before committing `nextMeters`.
 */
export function odometerUpdateNeedsConfirmation(
  currentMeters: number | null | undefined,
  nextMeters: number,
): boolean {
  return typeof currentMeters === "number" && nextMeters < currentMeters;
}
