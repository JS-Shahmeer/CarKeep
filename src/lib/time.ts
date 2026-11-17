/** UTC timestamp for `created_at` / `*_updated_at` columns (brief section 04). */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Calendar date (no time component) for `due_date` / `service_on` columns. */
export function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}
