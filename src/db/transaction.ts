import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { db } from "./client";
import * as schema from "./schema";

export type Tx = Parameters<Parameters<ExpoSQLiteDatabase<typeof schema>["transaction"]>[0]>[0];

/**
 * Brief 04.1: "Persist new/edited records in one database transaction,
 * including references to locally copied files." Every multi-table write
 * (e.g. a service record plus its receipt document row) must go through
 * this, never through separate top-level `db.insert(...)` calls.
 */
export async function runTransaction<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(work);
}
