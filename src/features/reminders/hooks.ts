import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "../../components";
import { logger } from "../../lib/logger";
import { useVehicles } from "../vehicles";
import { computeReminderStatus, type Reminder, type ReminderStatus } from "./domain";
import {
  clearSnooze,
  completeReminder,
  createReminder,
  deleteReminder,
  getReminder,
  listReminders,
  reopenReminder,
  snoozeReminder,
  updateReminder,
  type CreateReminderInput,
  type ReminderFilters,
  type UpdateReminderInput,
} from "./repo";

export const reminderKeys = {
  all: ["reminders"] as const,
  list: (filters: ReminderFilters) => ["reminders", "list", filters] as const,
  detail: (id: string) => ["reminders", id] as const,
};

export function useReminders(filters: ReminderFilters = {}) {
  return useQuery({
    queryKey: reminderKeys.list(filters),
    queryFn: () => listReminders(filters),
  });
}

export function useReminder(id: string | undefined) {
  return useQuery({
    queryKey: reminderKeys.detail(id ?? ""),
    queryFn: () => getReminder(id as string),
    enabled: !!id,
  });
}

function invalidateReminders(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: reminderKeys.all });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReminderInput) => createReminder(input),
    onSuccess: () => {
      invalidateReminders(queryClient);
      toast.show("Reminder saved.", "success");
    },
    onError: () => {
      logger.error("reminder_create_failed");
      toast.show("Couldn't save the reminder. Please try again.", "error");
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateReminderInput) => updateReminder(input),
    onSuccess: (_data, variables) => {
      invalidateReminders(queryClient);
      queryClient.invalidateQueries({ queryKey: reminderKeys.detail(variables.id) });
      toast.show("Reminder saved.", "success");
    },
    onError: () => {
      logger.error("reminder_update_failed");
      toast.show("Couldn't save your changes. Please try again.", "error");
    },
  });
}

export function useSnoozeReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, snoozedUntil }: { id: string; snoozedUntil: string }) =>
      snoozeReminder(id, snoozedUntil),
    onSuccess: () => {
      invalidateReminders(queryClient);
      toast.show("Reminder snoozed.", "success");
    },
    onError: () => {
      logger.error("reminder_snooze_failed");
      toast.show("Couldn't snooze the reminder. Please try again.", "error");
    },
  });
}

export function useClearSnooze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clearSnooze(id),
    onSuccess: () => invalidateReminders(queryClient),
    onError: () => logger.error("reminder_unsnooze_failed"),
  });
}

export function useCompleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeReminder(id),
    onSuccess: () => {
      invalidateReminders(queryClient);
      toast.show("Reminder completed.", "success");
    },
    onError: () => {
      logger.error("reminder_complete_failed");
      toast.show("Couldn't complete the reminder. Please try again.", "error");
    },
  });
}

export function useReopenReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reopenReminder(id),
    onSuccess: () => invalidateReminders(queryClient),
    onError: () => logger.error("reminder_reopen_failed"),
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      invalidateReminders(queryClient);
      toast.show("Reminder deleted.", "success");
    },
    onError: () => {
      logger.error("reminder_delete_failed");
      toast.show("Couldn't delete the reminder. Please try again.", "error");
    },
  });
}

export interface ReminderWithStatus extends Reminder {
  status: ReminderStatus;
  vehicleNickname: string;
  currentOdometerMeters: number | null;
}

const STATE_PRIORITY: Record<ReminderStatus["state"], number> = {
  overdue: 0,
  reached: 1,
  due_soon: 2,
  upcoming: 3,
  snoozed: 4,
  completed: 5,
};

/**
 * Home's due list and hero card (screen 03): every open reminder across
 * every car, with its status recomputed from each car's latest known
 * odometer (R03 — this never runs on a timer, only when the app renders
 * with fresh data), sorted most urgent first.
 */
export function useDueReminders() {
  const remindersQuery = useReminders();
  const vehiclesQuery = useVehicles();

  const items = useMemo((): ReminderWithStatus[] => {
    if (!remindersQuery.data || !vehiclesQuery.data) return [];
    const vehicleById = new Map(vehiclesQuery.data.map((vehicle) => [vehicle.id, vehicle]));
    const today = new Date();

    return remindersQuery.data
      .map((reminder) => {
        const vehicle = vehicleById.get(reminder.vehicleId);
        const status = computeReminderStatus(reminder, vehicle?.odometerMeters ?? null, today);
        return {
          ...reminder,
          status,
          vehicleNickname: vehicle?.nickname ?? "Unknown car",
          currentOdometerMeters: vehicle?.odometerMeters ?? null,
        };
      })
      .filter((reminder) => reminder.status.state !== "completed")
      .sort((a, b) => STATE_PRIORITY[a.status.state] - STATE_PRIORITY[b.status.state]);
  }, [remindersQuery.data, vehiclesQuery.data]);

  return {
    items,
    isLoading: remindersQuery.isLoading || vehiclesQuery.isLoading,
  };
}
