/** UTC timestamp for `created_at` / `*_updated_at` columns (brief section 04). */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Calendar date (no time component) for `due_date` / `service_on` columns. */
export function todayDateOnly(): string {
  return formatDateOnly(new Date());
}

/**
 * Formats a Date as "YYYY-MM-DD" using its *local* calendar fields. Brief
 * section 04: "DATE values are calendar dates" — not a UTC-shifted instant,
 * so this must never go through `toISOString()`, which can land on the
 * wrong day west of Greenwich.
 */
export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses a "YYYY-MM-DD" string as a local-midnight Date (the inverse of `formatDateOnly`). */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
