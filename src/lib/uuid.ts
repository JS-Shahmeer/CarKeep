import { randomUUID } from "expo-crypto";

/** Locally generated stable ids (brief section 04: "UUIDs can be locally generated"). */
export function generateId(): string {
  return randomUUID();
}
