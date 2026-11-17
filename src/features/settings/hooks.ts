import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SETTINGS_KEYS, getSetting, setSetting } from "../../db";
import { logger } from "../../lib/logger";
import { requestNotificationPermission } from "../../lib/notifications";
import type { DistanceUnit } from "../../lib/units";
import { rebuildAllNotificationJobs } from "../reminders/repo";

const DEFAULT_DISTANCE_UNIT: DistanceUnit = "km";

export const settingsKeys = {
  distanceUnit: ["settings", "distanceUnit"] as const,
};

export function useDistanceUnit() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: settingsKeys.distanceUnit,
    queryFn: async (): Promise<DistanceUnit> => {
      const value = await getSetting(SETTINGS_KEYS.distanceUnit);
      return value === "mi" ? "mi" : DEFAULT_DISTANCE_UNIT;
    },
  });

  const mutation = useMutation({
    mutationFn: (unit: DistanceUnit) => setSetting(SETTINGS_KEYS.distanceUnit, unit),
    onSuccess: (_data, unit) => {
      queryClient.setQueryData(settingsKeys.distanceUnit, unit);
    },
  });

  return {
    unit: query.data ?? DEFAULT_DISTANCE_UNIT,
    isLoading: query.isLoading,
    setUnit: mutation.mutate,
  };
}

export const notificationsSettingsKeys = {
  enabled: ["settings", "notificationsEnabled"] as const,
};

/**
 * CK-06 / brief 06: this is the only place permission is ever requested —
 * contextually, when the user turns the toggle on — never on app launch.
 * Turning it off cancels every scheduled alert; turning it on (once
 * granted) rebuilds them from the current reminders.
 */
export function useNotificationsEnabled() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: notificationsSettingsKeys.enabled,
    queryFn: async (): Promise<boolean> => {
      const value = await getSetting(SETTINGS_KEYS.notificationsEnabled);
      return value === "true";
    },
  });

  const mutation = useMutation({
    mutationFn: async (nextEnabled: boolean): Promise<boolean> => {
      if (nextEnabled) {
        const granted = await requestNotificationPermission();
        if (!granted) return false;
      }
      await setSetting(SETTINGS_KEYS.notificationsEnabled, nextEnabled ? "true" : "false");
      await rebuildAllNotificationJobs();
      return nextEnabled;
    },
    onSuccess: (actualEnabled) => {
      queryClient.setQueryData(notificationsSettingsKeys.enabled, actualEnabled);
    },
    onError: () => {
      logger.error("notifications_toggle_failed");
    },
  });

  return {
    enabled: query.data ?? false,
    isLoading: query.isLoading,
    /** Resolves to the setting the toggle actually landed on, in case permission was denied. */
    setEnabled: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
