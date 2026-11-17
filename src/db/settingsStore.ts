import { eq } from "drizzle-orm";
import { db } from "./client";
import { settings } from "./schema";

/** Known Settings keys (brief screen 09). Values are stored as plain strings. */
export const SETTINGS_KEYS = {
  distanceUnit: "distance_unit", // "km" | "mi"
  currency: "currency", // ISO 4217 code, e.g. "USD"
  notificationsEnabled: "notifications_enabled", // "true" | "false"
} as const;

export async function getSetting(key: string): Promise<string | undefined> {
  const row = await db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}
