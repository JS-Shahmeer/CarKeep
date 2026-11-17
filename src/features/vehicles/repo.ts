import { desc, eq } from "drizzle-orm";
import { db, vehicles } from "../../db";
import { generateId } from "../../lib/uuid";
import { nowIso } from "../../lib/time";
import { cancelNotificationsForVehicle } from "../reminders/repo";
import type { Vehicle, VehicleFormValues } from "./domain";

function toVehicle(row: typeof vehicles.$inferSelect): Vehicle {
  return row;
}

export async function listVehicles(): Promise<Vehicle[]> {
  const rows = await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  return rows.map(toVehicle);
}

export async function getVehicle(id: string): Promise<Vehicle | undefined> {
  const row = await db.select().from(vehicles).where(eq(vehicles.id, id)).get();
  return row ? toVehicle(row) : undefined;
}

export interface CreateVehicleInput extends VehicleFormValues {
  /** Already converted to canonical meters by the caller (R01). */
  odometerMeters?: number;
}

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const id = generateId();
  const now = nowIso();

  const row = {
    id,
    nickname: input.nickname,
    make: input.make ?? null,
    model: input.model ?? null,
    year: input.year ?? null,
    plate: input.plate ?? null,
    photoPath: null,
    odometerMeters: input.odometerMeters ?? null,
    odometerUpdatedAt: input.odometerMeters !== undefined ? now : null,
    createdAt: now,
  };

  await db.insert(vehicles).values(row);
  return row;
}

export interface UpdateVehicleInput extends VehicleFormValues {
  id: string;
}

export async function updateVehicle(input: UpdateVehicleInput): Promise<void> {
  await db
    .update(vehicles)
    .set({
      nickname: input.nickname,
      make: input.make ?? null,
      model: input.model ?? null,
      year: input.year ?? null,
      plate: input.plate ?? null,
    })
    .where(eq(vehicles.id, input.id));
}

/**
 * CK-08 / brief 04.1: deleting a vehicle cascades to its service records,
 * reminders, documents and notification jobs at the database level (FK
 * `ON DELETE CASCADE`, enforced because `PRAGMA foreign_keys = ON` is set
 * on the connection) — deleting one car must never touch another car's
 * records.
 */
export async function deleteVehicle(id: string): Promise<void> {
  await cancelNotificationsForVehicle(id);
  await db.delete(vehicles).where(eq(vehicles.id, id));
}

/**
 * R02/R03/R04: this is the only write path for the odometer. It always
 * stores canonical meters and always stamps `odometerUpdatedAt`, so every
 * mileage-based reminder check (module 7) can trust the timestamp.
 */
export async function updateOdometer(id: string, meters: number): Promise<void> {
  await db
    .update(vehicles)
    .set({ odometerMeters: meters, odometerUpdatedAt: nowIso() })
    .where(eq(vehicles.id, id));
}
