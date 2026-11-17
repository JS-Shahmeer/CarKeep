import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import {
  Button,
  Card,
  ComingSoon,
  ConfirmSheet,
  NumberField,
  StatusChip,
  Text,
} from "../../src/components";
import {
  REMINDER_TYPE_LABELS,
  computeReminderStatus,
  useCompleteReminder,
  useDeleteReminder,
  useReminders,
  useSnoozeReminder,
  type ReminderType,
} from "../../src/features/reminders";
import { useDistanceUnit } from "../../src/features/settings/hooks";
import {
  SERVICE_TYPE_LABELS,
  useServiceRecords,
  type ServiceType,
} from "../../src/features/services";
import {
  odometerUpdateNeedsConfirmation,
  useDeleteVehicle,
  useUpdateOdometer,
  useVehicle,
} from "../../src/features/vehicles";
import { formatDateOnly, parseDateOnly } from "../../src/lib/time";
import { displayToMeters, formatDistance } from "../../src/lib/units";
import { useTheme } from "../../src/theme";

/** Screen 04 — Car Detail (CK-01, CK-02). */
export default function CarDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: vehicle, isLoading } = useVehicle(id);
  const { unit } = useDistanceUnit();
  const updateOdometer = useUpdateOdometer();
  const deleteVehicle = useDeleteVehicle();
  const { data: recentRecords = [] } = useServiceRecords({ vehicleId: id });
  const { data: reminders = [] } = useReminders({ vehicleId: id });
  const completeReminder = useCompleteReminder();
  const deleteReminder = useDeleteReminder();
  const snoozeReminder = useSnoozeReminder();

  const [odometerInput, setOdometerInput] = useState<number | undefined>(undefined);
  const [pendingCorrection, setPendingCorrection] = useState<number | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteReminder, setConfirmDeleteReminder] = useState<string | undefined>(undefined);
  const [snoozeTargetId, setSnoozeTargetId] = useState<string | undefined>(undefined);

  if (isLoading || !vehicle) {
    return <ComingSoon title="Loading car…" module="module 4 — Vehicles and odometer" />;
  }

  const commitOdometer = (meters: number) => {
    updateOdometer.mutate({ id: vehicle.id, meters });
    setOdometerInput(undefined);
  };

  const onSaveOdometer = () => {
    if (odometerInput === undefined) return;
    const meters = displayToMeters(odometerInput, unit);

    if (odometerUpdateNeedsConfirmation(vehicle.odometerMeters, meters)) {
      setPendingCorrection(meters);
      return;
    }
    commitOdometer(meters);
  };

  const subtitle = [vehicle.make, vehicle.model, vehicle.year ? String(vehicle.year) : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
      <Card>
        <View style={{ gap: theme.spacing.xs }}>
          <Text variant="title">{vehicle.nickname}</Text>
          {subtitle ? (
            <Text variant="body" muted>
              {subtitle}
            </Text>
          ) : null}
          {vehicle.plate ? (
            <Text variant="caption" muted>
              Plate: {vehicle.plate}
            </Text>
          ) : null}
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.sm,
            marginTop: theme.spacing.md,
          }}
        >
          <Button
            label="Edit"
            variant="secondary"
            icon={<Pencil size={16} color={theme.colors.text} />}
            onPress={() => router.push({ pathname: "/car/edit", params: { id: vehicle.id } })}
          />
          <Button
            label="Delete"
            variant="ghost"
            icon={<Trash2 size={16} color={theme.colors.statusOverdue} />}
            onPress={() => setConfirmDelete(true)}
          />
        </View>
      </Card>

      <Card>
        <Text variant="subtitle" style={{ marginBottom: theme.spacing.sm }}>
          Odometer
        </Text>
        <Text variant="title" style={{ marginBottom: theme.spacing.md }}>
          {vehicle.odometerMeters !== null
            ? formatDistance(vehicle.odometerMeters, unit)
            : "Not set"}
        </Text>
        <NumberField
          label="Update odometer"
          suffix={unit}
          value={odometerInput}
          onChangeValue={setOdometerInput}
          placeholder="Enter latest reading"
        />
        <View style={{ marginTop: theme.spacing.md }}>
          <Button
            label="Save reading"
            onPress={onSaveOdometer}
            loading={updateOdometer.isPending}
            disabled={odometerInput === undefined}
          />
        </View>
        {vehicle.odometerUpdatedAt && (
          <Text variant="caption" muted style={{ marginTop: theme.spacing.sm }}>
            Last updated {new Date(vehicle.odometerUpdatedAt).toLocaleDateString()}
          </Text>
        )}
      </Card>

      <Card>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.sm,
          }}
        >
          <Text variant="subtitle">Reminders</Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/reminder/edit", params: { vehicleId: vehicle.id } })
            }
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Plus size={16} color={theme.colors.primary} />
            <Text variant="label" color={theme.colors.primary}>
              Add reminder
            </Text>
          </Pressable>
        </View>
        {reminders.length === 0 ? (
          <Text variant="body" muted>
            No reminders set for this car yet.
          </Text>
        ) : (
          reminders.map((reminder, index) => {
            const status = computeReminderStatus(reminder, vehicle.odometerMeters, new Date());
            return (
              <View
                key={reminder.id}
                style={{
                  paddingVertical: theme.spacing.sm,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: theme.colors.border,
                  gap: theme.spacing.xs,
                }}
              >
                <Pressable
                  onPress={() =>
                    router.push({ pathname: "/reminder/edit", params: { id: reminder.id } })
                  }
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="body">{reminder.title}</Text>
                    <Text variant="caption" muted>
                      {REMINDER_TYPE_LABELS[reminder.type as ReminderType] ?? reminder.type}
                      {reminder.dueDate
                        ? ` · ${parseDateOnly(reminder.dueDate).toLocaleDateString()}`
                        : ""}
                      {reminder.targetMeters !== null
                        ? ` · ${formatDistance(reminder.targetMeters, unit)}`
                        : ""}
                    </Text>
                  </View>
                  <StatusChip status={status.state} />
                </Pressable>
                {status.state !== "completed" && (
                  <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                    <Button
                      label="Snooze"
                      variant="ghost"
                      onPress={() => setSnoozeTargetId(reminder.id)}
                    />
                    <Button
                      label="Mark completed"
                      variant="ghost"
                      onPress={() => completeReminder.mutate(reminder.id)}
                    />
                    <Button
                      label="Delete"
                      variant="ghost"
                      onPress={() => setConfirmDeleteReminder(reminder.id)}
                    />
                  </View>
                )}
              </View>
            );
          })
        )}
      </Card>

      <Card>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.sm,
          }}
        >
          <Text variant="subtitle">Recent history</Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/service/new", params: { vehicleId: vehicle.id } })
            }
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Plus size={16} color={theme.colors.primary} />
            <Text variant="label" color={theme.colors.primary}>
              Add service
            </Text>
          </Pressable>
        </View>
        {recentRecords.length === 0 ? (
          <Text variant="body" muted>
            No service recorded yet for this car.
          </Text>
        ) : (
          recentRecords.slice(0, 5).map((record, index) => (
            <Pressable
              key={record.id}
              onPress={() => router.push(`/service/${record.id}`)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.sm,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: theme.colors.border,
              }}
            >
              <View>
                <Text variant="body">
                  {SERVICE_TYPE_LABELS[record.type as ServiceType] ?? record.type}
                </Text>
                <Text variant="caption" muted>
                  {parseDateOnly(record.serviceOn).toLocaleDateString()}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </Pressable>
          ))
        )}
      </Card>

      <ConfirmSheet
        visible={pendingCorrection !== undefined}
        title="Correct previous reading?"
        description="The new reading is lower than the current odometer. Confirm this is a correction, not a mistake."
        confirmLabel="Yes, use this reading"
        onConfirm={() => {
          if (pendingCorrection !== undefined) commitOdometer(pendingCorrection);
          setPendingCorrection(undefined);
        }}
        onCancel={() => setPendingCorrection(undefined)}
      />

      <ConfirmSheet
        visible={confirmDelete}
        title={`Delete ${vehicle.nickname}?`}
        description="This also deletes its service history, reminders and receipts. This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          deleteVehicle.mutate(vehicle.id);
          router.back();
        }}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmSheet
        visible={confirmDeleteReminder !== undefined}
        title="Delete this reminder?"
        description="This also cancels its scheduled notification. This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (confirmDeleteReminder) deleteReminder.mutate(confirmDeleteReminder);
          setConfirmDeleteReminder(undefined);
        }}
        onCancel={() => setConfirmDeleteReminder(undefined)}
      />

      <Modal
        visible={snoozeTargetId !== undefined}
        transparent
        animationType="fade"
        onRequestClose={() => setSnoozeTargetId(undefined)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: "flex-end" }}
          onPress={() => setSnoozeTargetId(undefined)}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
              padding: theme.spacing.xl,
              gap: theme.spacing.md,
            }}
          >
            <Text variant="subtitle">Snooze until…</Text>
            <Text variant="body" muted>
              Hides this reminder&apos;s alert until the date you pick. Its original due date or
              mileage target stays visible in its details.
            </Text>
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                label={`${days} days`}
                variant="secondary"
                fullWidth
                onPress={() => {
                  if (!snoozeTargetId) return;
                  const until = new Date();
                  until.setDate(until.getDate() + days);
                  snoozeReminder.mutate({
                    id: snoozeTargetId,
                    snoozedUntil: formatDateOnly(until),
                  });
                  setSnoozeTargetId(undefined);
                }}
              />
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
