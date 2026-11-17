import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button, NumberField, Text, TextField, toast } from "../../src/components";
import {
  toCreateVehicleInput,
  useCreateVehicle,
  useUpdateVehicle,
  useVehicle,
  vehicleFormSchema,
  type VehicleFormValues,
} from "../../src/features/vehicles";
import { useDistanceUnit } from "../../src/features/settings/hooks";
import { metersToDisplay } from "../../src/lib/units";
import { useTheme } from "../../src/theme";

/** Screen 02 — Add / Edit Car (CK-01). Pass ?id=<vehicleId> to edit. */
export default function EditCarScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const isEditing = !!id;

  const { data: vehicle } = useVehicle(id);
  const { unit } = useDistanceUnit();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: { nickname: "" },
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        nickname: vehicle.nickname,
        make: vehicle.make ?? undefined,
        model: vehicle.model ?? undefined,
        year: vehicle.year ?? undefined,
        plate: vehicle.plate ?? undefined,
        odometer:
          vehicle.odometerMeters !== null
            ? metersToDisplay(vehicle.odometerMeters, unit)
            : undefined,
      });
    }
  }, [vehicle, unit, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing && vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, ...values });
        router.back();
      } else {
        const input = toCreateVehicleInput(values, unit);
        const created = await createVehicle.mutateAsync(input);
        toast.show(`${created.nickname} added.`, "success");
        router.replace(`/car/${created.id}`);
      }
    } catch {
      // Errors already surfaced via toast in the mutation hooks.
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="nickname"
          render={({ field }) => (
            <TextField
              label="Nickname"
              required
              placeholder="e.g. My Civic"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.nickname?.message}
            />
          )}
        />
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="make"
              render={({ field }) => (
                <TextField
                  label="Make"
                  placeholder="Honda"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="model"
              render={({ field }) => (
                <TextField
                  label="Model"
                  placeholder="Civic"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                />
              )}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="year"
              render={({ field }) => (
                <NumberField
                  label="Year"
                  value={field.value}
                  onChangeValue={field.onChange}
                  error={errors.year?.message}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="plate"
              render={({ field }) => (
                <TextField
                  label="Plate"
                  autoCapitalize="characters"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                />
              )}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="odometer"
          render={({ field }) => (
            <NumberField
              label="Current odometer"
              suffix={unit}
              value={field.value}
              onChangeValue={field.onChange}
              helperText={
                isEditing ? "To correct a lower reading, use Update Odometer instead." : undefined
              }
              editable={!isEditing}
            />
          )}
        />
        {isEditing && (
          <Text variant="caption" muted>
            Odometer changes here are disabled — use Update Odometer on the car&apos;s page so lower
            readings get the correction check.
          </Text>
        )}
        <Button
          label={isEditing ? "Save changes" : "Add car"}
          onPress={() => onSubmit()}
          loading={isSubmitting || createVehicle.isPending || updateVehicle.isPending}
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
