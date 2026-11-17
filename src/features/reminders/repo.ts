import { desc, eq, isNull } from "drizzle-orm";
import { db, notificationJobs, reminders, vehicles } from "../../db";
import { getSetting, SETTINGS_KEYS } from "../../db/settingsStore";
import { generateId } from "../../lib/uuid";
import { nowIso } from "../../lib/time";
import {
  cancelAllReminderNotifications,
  cancelReminderNotification,
  scheduleReminderNotification,
} from "../../lib/notifications";
import {
  computeNotificationFireDate,
  computeSnoozeFireDate,
  needsDateNotification,
  type Reminder,
  type ReminderFormValues,
} from "./domain";

export interface ReminderFilters {
  vehicleId?: string;
}

export async function listReminders(filters: ReminderFilters = {}): Promise<Reminder[]> {
  const base = db.select().from(reminders);
  const rows = filters.vehicleId
    ? await base
        .where(eq(reminders.vehicleId, filters.vehicleId))
        .orderBy(desc(reminders.createdAt))
    : await base.orderBy(desc(reminders.createdAt));
  return rows;
}

export async function getReminder(id: string): Promise<Reminder | undefined> {
  return db.select().from(reminders).where(eq(reminders.id, id)).get();
}

async function notificationsEnabled(): Promise<boolean> {
  const value = await getSetting(SETTINGS_KEYS.notificationsEnabled);
  return value === "true";
}

async function cancelJobsFor(reminderId: string): Promise<void> {
  const jobs = await db
    .select()
    .from(notificationJobs)
    .where(eq(notificationJobs.reminderId, reminderId));
  for (const job of jobs) {
    await cancelReminderNotification(job.id);
  }
  await db.delete(notificationJobs).where(eq(notificationJobs.reminderId, reminderId));
}

/**
 * Brief 06: rebuild the OS alert for one reminder after it's created,
 * edited, snoozed, un-snoozed or completed — always cancel what was there,
 * then schedule fresh. Schedules nothing when notifications are off, the
 * reminder is mileage-only, or it's already completed (CK-06, R03, R06).
 */
async function rebuildNotificationFor(reminder: Reminder): Promise<void> {
  await cancelJobsFor(reminder.id);

  if (reminder.completedAt !== null) return;
  if (!(await notificationsEnabled())) return;

  const fireAt =
    reminder.snoozedUntil !== null
      ? computeSnoozeFireDate(reminder.snoozedUntil)
      : needsDateNotification(reminder)
        ? computeNotificationFireDate(reminder.dueDate as string, reminder.leadDays)
        : undefined;
  if (!fireAt) return;

  const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, reminder.vehicleId)).get();
  const jobId = generateId();
  const scheduled = await scheduleReminderNotification({
    id: jobId,
    title: reminder.title,
    body: vehicle ? `${vehicle.nickname} — due now` : "Due now",
    fireAt,
  });
  if (scheduled) {
    await db.insert(notificationJobs).values({
      id: jobId,
      reminderId: reminder.id,
      plannedAtUtc: fireAt.toISOString(),
      state: "scheduled",
    });
  }
}

export interface CreateReminderInput extends Omit<ReminderFormValues, "targetOdometer"> {
  /** Already converted to canonical meters by the caller (R01). */
  targetMeters?: number;
}

export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const row: Reminder = {
    id: generateId(),
    vehicleId: input.vehicleId,
    type: input.type,
    title: input.title,
    dueDate: input.dueDate ?? null,
    targetMeters: input.targetMeters ?? null,
    leadDays: input.leadDays,
    state: "upcoming",
    snoozedUntil: null,
    completedAt: null,
    createdAt: nowIso(),
  };
  await db.insert(reminders).values(row);
  await rebuildNotificationFor(row);
  return row;
}

export interface UpdateReminderInput extends CreateReminderInput {
  id: string;
}

export async function updateReminder(input: UpdateReminderInput): Promise<void> {
  await db
    .update(reminders)
    .set({
      vehicleId: input.vehicleId,
      type: input.type,
      title: input.title,
      dueDate: input.dueDate ?? null,
      targetMeters: input.targetMeters ?? null,
      leadDays: input.leadDays,
    })
    .where(eq(reminders.id, input.id));

  const updated = await getReminder(input.id);
  if (updated) await rebuildNotificationFor(updated);
}

/** R07: snooze only hides the alert until `snoozedUntil` — the underlying criterion is untouched. */
export async function snoozeReminder(id: string, snoozedUntil: string): Promise<void> {
  await db.update(reminders).set({ snoozedUntil }).where(eq(reminders.id, id));
  const updated = await getReminder(id);
  if (updated) await rebuildNotificationFor(updated);
}

export async function clearSnooze(id: string): Promise<void> {
  await db.update(reminders).set({ snoozedUntil: null }).where(eq(reminders.id, id));
  const updated = await getReminder(id);
  if (updated) await rebuildNotificationFor(updated);
}

/** CK-05/R06: an explicit, standalone action — never creates or implies a service record. */
export async function completeReminder(id: string): Promise<void> {
  await db.update(reminders).set({ completedAt: nowIso() }).where(eq(reminders.id, id));
  await cancelJobsFor(id);
}

export async function reopenReminder(id: string): Promise<void> {
  await db.update(reminders).set({ completedAt: null }).where(eq(reminders.id, id));
  const updated = await getReminder(id);
  if (updated) await rebuildNotificationFor(updated);
}

export async function deleteReminder(id: string): Promise<void> {
  await cancelJobsFor(id);
  await db.delete(reminders).where(eq(reminders.id, id));
}

/**
 * CK-08: deleting a vehicle cascades its reminders at the DB level, but the
 * OS-scheduled notifications for them are not a database row — they must
 * be cancelled explicitly first, the same reasoning as the receipt-file
 * cleanup in module 6.
 */
export async function cancelNotificationsForVehicle(vehicleId: string): Promise<void> {
  const vehicleReminders = await db
    .select()
    .from(reminders)
    .where(eq(reminders.vehicleId, vehicleId));
  for (const reminder of vehicleReminders) {
    await cancelJobsFor(reminder.id);
  }
}

/**
 * Brief 06: "Rebuild future local alerts after edits, permission changes,
 * reboot or timezone change." Rather than track each of those events
 * individually, every app launch re-derives every job from scratch — the
 * cheapest way to stay correct no matter what changed while it was closed.
 */
export async function rebuildAllNotificationJobs(): Promise<void> {
  await cancelAllReminderNotifications();
  await db.delete(notificationJobs);

  if (!(await notificationsEnabled())) return;

  const active = await db.select().from(reminders).where(isNull(reminders.completedAt));
  for (const reminder of active) {
    await rebuildNotificationFor(reminder);
  }
}
