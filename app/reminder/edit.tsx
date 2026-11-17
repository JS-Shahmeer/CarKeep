import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { Button, DatePicker, NumberField, Text, TextField } from "../../src/components";
import {
  REMINDER_TYPE_LABELS,
  REMINDER_TYPES,
  reminderFormSchema,
  useCreateReminder,
  useReminder,
  useUpdateReminder,
  type ReminderFormValues,
} from "../../src/features/reminders";
import { useDistanceUnit } from "../../src/features/settings/hooks";
import { useVehicles } from "../../src/features/vehicles";
import { displayToMeters, metersToDisplay } from "../../src/lib/units";
import { formatDateOnly, parseDateOnly } from "../../src/lib/time";
import { useTheme } from "../../src/theme";

/** Screen 06 — Add / Edit Reminder (CK-04, CK-05). Pass ?id= to edit, or ?vehicleId= to preset a car. */
export default function EditReminderScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string; vehicleId?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const presetVehicleId = Array.isArray(params.vehicleId) ? params.vehicleId[0] : params.vehicleId;

  const { data: vehicles = [] } = useVehicles();
  const { unit } = useDistanceUnit();
  const { data: existing, isLoading } = useReminder(id);
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      vehicleId: presetVehicleId ?? vehicles[0]?.id ?? "",
      type: "custom",
      title: "",
      leadDays: 7,
    },
  });

  React.useEffect(() => {
    if (!existing) return;
    reset({
      vehicleId: existing.vehicleId,
      type: existing.type as ReminderFormValues["type"],
      title: existing.title,
      dueDate: existing.dueDate ?? undefined,
      targetOdometer:
        existing.targetMeters !== null ? metersToDisplay(existing.targetMeters, unit) : undefined,
      leadDays: existing.leadDays,
    });
  }, [existing, unit, reset]);

  const selectedVehicleId = useWatch({ control, name: "vehicleId" });
  const selectedType = useWatch({ control, name: "type" });
  const dueDate = useWatch({ control, name: "dueDate" });

  const onSubmit = handleSubmit(async (values) => {
    const input = {
      vehicleId: values.vehicleId,
      type: values.type,
      title: values.title,
      dueDate: values.dueDate,
      targetMeters:
        values.targetOdometer !== undefined
          ? displayToMeters(values.targetOdometer, unit)
          : undefined,
      leadDays: values.leadDays,
    };
    try {
      if (id) {
        await updateReminder.mutateAsync({ ...input, id });
      } else {
        await createReminder.mutateAsync(input);
      }
      router.back();
    } catch {
      // Already surfaced via toast in the mutation hook.
    }
  });

  if (vehicles.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.xl,
        }}
      >
        <Text variant="subtitle" style={{ textAlign: "center" }}>
          Add a car first
        </Text>
        <Text variant="body" muted style={{ textAlign: "center", marginTop: theme.spacing.sm }}>
          Reminders belong to a car. Add one from the Garage tab, then come back here.
        </Text>
      </View>
    );
  }

  if (id && isLoading) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        {vehicles.length > 1 && (
          <View style={{ gap: theme.spacing.xs }}>
            <Text variant="label" muted>
              Car
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
              {vehicles.map((vehicle) => {
                const selected = selectedVehicleId === vehicle.id;
                return (
                  <Pressable
                    key={vehicle.id}
                    onPress={() => setValue("vehicleId", vehicle.id)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: theme.spacing.md,
                      borderRadius: theme.radii.pill,
                      backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
                    }}
                  >
                    <Text
                      variant="label"
                      style={{ color: selected ? theme.colors.textOnPrimary : theme.colors.text }}
                    >
                      {vehicle.nickname}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ gap: theme.spacing.xs }}>
          <Text variant="label" muted>
            Type
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
            {REMINDER_TYPES.map((type) => {
              const selected = selectedType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setValue("type", type)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: theme.spacing.md,
                    borderRadius: theme.radii.pill,
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
                  }}
                >
                  <Text
                    variant="label"
                    style={{ color: selected ? theme.colors.textOnPrimary : theme.colors.text }}
                  >
                    {REMINDER_TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              label="Title"
              required
              placeholder="e.g. Annual inspection"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.title?.message}
            />
          )}
        />

        <Text variant="caption" muted>
          Set a due date, a mileage target, or both — the reminder fires on whichever comes first.
        </Text>

        <View style={{ gap: theme.spacing.xs }}>
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <DatePicker
                label="Due date"
                value={field.value ? parseDateOnly(field.value) : undefined}
                onChange={(date) => field.onChange(formatDateOnly(date))}
                onClear={() => field.onChange(undefined)}
              />
            )}
          />
          {errors.dueDate && (
            <Text variant="caption" color={theme.colors.statusOverdue}>
              {errors.dueDate.message}
            </Text>
          )}
        </View>

        {dueDate && (
          <Controller
            control={control}
            name="leadDays"
            render={({ field }) => (
              <NumberField
                label="Alert lead time (days before)"
                value={field.value}
                onChangeValue={(value) => field.onChange(value ?? 0)}
              />
            )}
          />
        )}

        <Controller
          control={control}
          name="targetOdometer"
          render={({ field }) => (
            <NumberField
              label="Mileage target (optional)"
              suffix={unit}
              value={field.value}
              onChangeValue={field.onChange}
            />
          )}
        />

        <Button
          label="Save reminder"
          onPress={() => onSubmit()}
          loading={isSubmitting || createReminder.isPending || updateReminder.isPending}
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
