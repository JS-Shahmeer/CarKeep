import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";

const DATABASE_NAME = "carkeep.db";

/**
 * A single connection, opened once per process. expo-sqlite's async API
 * already serializes statements per connection, so this is also what makes
 * `runTransaction` (below) safe to use anywhere in the app.
 */
export const sqlite = SQLite.openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

// Brief 04.1: "Foreign-key rules must be explicit; never leave orphan
// attachments or jobs." SQLite does not enforce FKs unless this is set on
// every connection, so the cascading deletes in the schema would silently
// no-op without it.
sqlite.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;
