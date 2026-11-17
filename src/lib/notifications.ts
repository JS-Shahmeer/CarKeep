import * as Notifications from "expo-notifications";
import { logger } from "./logger";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function hasNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted;
}

/**
 * Brief 06: "Ask notification permission contextually after a user enables
 * an alert." This is called only from the Settings "Reminder notifications"
 * toggle, never on app launch.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export interface ScheduleInput {
  /** Caller-chosen id, reused as the OS notification's own identifier so it can be cancelled later without a lookup table. */
  id: string;
  title: string;
  body: string;
  fireAt: Date;
}

/**
 * CK-06: only ever called for date-based criteria. Returns false if the
 * fire time has already passed (nothing to schedule — the item is simply
 * shown as due in the app already) or scheduling itself fails.
 */
export async function scheduleReminderNotification(input: ScheduleInput): Promise<boolean> {
  if (input.fireAt.getTime() <= Date.now()) return false;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: input.id,
      content: { title: input.title, body: input.body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: input.fireAt },
    });
    return true;
  } catch {
    logger.error("notification_schedule_failed");
    return false;
  }
}

export async function cancelReminderNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already fired, already cancelled, or never scheduled — nothing to do.
  }
}

export async function cancelAllReminderNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    logger.error("notification_cancel_all_failed");
  }
}
