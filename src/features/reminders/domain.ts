import { z } from "zod";
import { daysBetween, parseDateOnly } from "../../lib/time";

/** CK-04: category is informational; "title" is what's shown and is always required. */
export const REMINDER_TYPES = [
  "oil_change",
  "tyres",
  "brakes",
  "battery",
  "inspection",
  "registration",
  "custom",
] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  oil_change: "Oil change",
  tyres: "Tyres",
  brakes: "Brakes",
  battery: "Battery",
  inspection: "Inspection",
  registration: "Registration",
  custom: "Custom",
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * CK-04 / the reminders table invariant: "at least one of due_date or
 * target_meters is required." `targetOdometer` is a display-unit value;
 * the repo converts it to canonical meters (R01), same as the odometer form.
 */
export const reminderFormSchema = z
  .object({
    vehicleId: z.string().min(1, "Choose a car"),
    type: z.enum(REMINDER_TYPES),
    title: z.string().trim().min(1, "Title is required").max(80),
    dueDate: z.string().regex(DATE_ONLY, "Pick a date").optional(),
    targetOdometer: z.number().int().min(0).optional(),
    leadDays: z.number().int().min(0).max(365),
  })
  .refine((data) => data.dueDate !== undefined || data.targetOdometer !== undefined, {
    message: "Set a due date, a mileage target, or both",
    path: ["dueDate"],
  });

export type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export interface Reminder {
  id: string;
  vehicleId: string;
  type: string;
  title: string;
  dueDate: string | null;
  targetMeters: number | null;
  leadDays: number;
  state: string;
  snoozedUntil: string | null;
  completedAt: string | null;
  createdAt: string;
}

export const DEFAULT_DUE_SOON_WINDOW_DAYS = 7;

export type ReminderDisplayState =
  "upcoming" | "due_soon" | "overdue" | "reached" | "snoozed" | "completed";

export type ReminderTrigger = "date" | "mileage" | "both" | null;

export interface ReminderStatus {
  /** What to show in a due list / the Home hero card (R07: snooze hides it here). */
  state: ReminderDisplayState;
  /** Which criterion is satisfied, independent of snooze (R07: kept visible in details). */
  trigger: ReminderTrigger;
  reachedByDate: boolean;
  reachedByMileage: boolean;
}

/**
 * The reminders engine's pure status rule (CK-04, CK-05, R02–R07). Takes no
 * clock or odometer of its own — the caller supplies "now" and the
 * vehicle's last-known odometer, so this is cheap to unit test and only
 * ever reruns when the app opens or the odometer changes (R03), never on a
 * timer.
 */
export function computeReminderStatus(
  reminder: Pick<
    Reminder,
    "dueDate" | "targetMeters" | "leadDays" | "snoozedUntil" | "completedAt"
  >,
  currentOdometerMeters: number | null,
  today: Date,
  dueSoonWindowDays: number = DEFAULT_DUE_SOON_WINDOW_DAYS,
): ReminderStatus {
  const reachedByDate =
    reminder.dueDate !== null && daysBetween(today, parseDateOnly(reminder.dueDate)) <= 0;
  const reachedByMileage =
    reminder.targetMeters !== null &&
    currentOdometerMeters !== null &&
    currentOdometerMeters >= reminder.targetMeters;

  const trigger: ReminderTrigger =
    reachedByDate && reachedByMileage
      ? "both"
      : reachedByDate
        ? "date"
        : reachedByMileage
          ? "mileage"
          : null;

  if (reminder.completedAt !== null) {
    return { state: "completed", trigger, reachedByDate, reachedByMileage };
  }

  const isDueSoon =
    !reachedByDate &&
    reminder.dueDate !== null &&
    daysBetween(today, parseDateOnly(reminder.dueDate)) <= dueSoonWindowDays;

  // R05: date criterion uses "Overdue" wording; mileage criterion uses "Reached".
  const rawState: ReminderDisplayState = reachedByDate
    ? "overdue"
    : reachedByMileage
      ? "reached"
      : isDueSoon
        ? "due_soon"
        : "upcoming";

  // R07: snooze only hides the alert until the chosen date; the real
  // criterion (trigger/reachedBy*) is unaffected, so a detail screen can
  // still show it.
  const isSnoozed =
    reminder.snoozedUntil !== null && daysBetween(today, parseDateOnly(reminder.snoozedUntil)) > 0;

  return {
    state: isSnoozed ? "snoozed" : rawState,
    trigger,
    reachedByDate,
    reachedByMileage,
  };
}

/** Whether a date-based alert should be scheduled for this reminder at all (CK-06, R03). */
export function needsDateNotification(
  reminder: Pick<Reminder, "dueDate" | "completedAt">,
): boolean {
  return reminder.dueDate !== null && reminder.completedAt === null;
}

const NOTIFICATION_HOUR_LOCAL = 9;

/**
 * CK-04/CK-06: fires `leadDays` before the due date, at a fixed local hour
 * so it doesn't depend on what time of day the reminder happened to be
 * created. Mileage-only reminders never call this (R03/CK-06).
 */
export function computeNotificationFireDate(dueDate: string, leadDays: number): Date {
  const due = parseDateOnly(dueDate);
  return new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate() - leadDays,
    NOTIFICATION_HOUR_LOCAL,
    0,
    0,
  );
}

/**
 * R07: a snooze re-surfaces the alert on the chosen date instead of the
 * original lead-days schedule, which is what CK-T08 means by "snooze
 * cancels/reschedules" — it doesn't just silence the reminder forever.
 */
export function computeSnoozeFireDate(snoozedUntil: string): Date {
  const date = parseDateOnly(snoozedUntil);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    NOTIFICATION_HOUR_LOCAL,
    0,
    0,
  );
}
