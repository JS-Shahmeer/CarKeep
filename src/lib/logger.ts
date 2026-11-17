/**
 * App-wide logger. Brief 01.4: "Never log personal records, photos,
 * receipts, customer details or full notes in production diagnostics."
 *
 * Callers pass an `event` name plus a flat, non-sensitive `context` object.
 * Never pass vehicle nicknames, plates, notes, provider names or file
 * paths/contents here — pass counts, ids, or enum-like fields instead.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: string | number | boolean | undefined;
}

const DISALLOWED_KEYS = [
  "nickname",
  "plate",
  "notes",
  "provider",
  "path",
  "receipt",
  "email",
  "name",
];

function sanitize(context: LogContext | undefined): LogContext | undefined {
  if (!context) return context;
  const safe: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    const lower = key.toLowerCase();
    if (DISALLOWED_KEYS.some((bad) => lower.includes(bad))) {
      if (__DEV__) {
        console.warn(`[logger] dropped likely-sensitive field "${key}" from log context`);
      }
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

function write(level: LogLevel, event: string, context?: LogContext) {
  const safeContext = sanitize(context);
  if (!__DEV__ && level === "debug") return;

  console[level === "debug" ? "log" : level](`[${event}]`, safeContext ?? {});
}

export const logger = {
  debug: (event: string, context?: LogContext) => write("debug", event, context),
  info: (event: string, context?: LogContext) => write("info", event, context),
  warn: (event: string, context?: LogContext) => write("warn", event, context),
  error: (event: string, context?: LogContext) => write("error", event, context),
};
