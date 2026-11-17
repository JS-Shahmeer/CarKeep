import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "./migrations/migrations";
import { db } from "./client";

/**
 * Runs pending migrations once, in order, on top of whatever schema version
 * the device already has (brief 04.1: "Local schema migration must preserve
 * existing records after an app update; no silent destructive reset" — a
 * forward-only migration runner is how that promise is kept).
 */
export function useDatabaseMigrations() {
  return useMigrations(db, migrations);
}
