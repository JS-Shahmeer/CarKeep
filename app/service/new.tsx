import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { FileText, Image as ImageIcon, X } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import {
  Button,
  Card,
  DatePicker,
  NumberField,
  Text,
  TextField,
  toast,
} from "../../src/components";
import { validateAttachment } from "../../src/features/attachments/domain";
import { pickReceiptDocument, pickReceiptPhoto } from "../../src/features/attachments/repo";
import { useDistanceUnit } from "../../src/features/settings/hooks";
import { useCreateServiceRecord } from "../../src/features/services";
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPES,
  serviceRecordFormSchema,
  type ServiceRecordFormValues,
} from "../../src/features/services/domain";
import { useVehicles } from "../../src/features/vehicles";
import { copyToReceiptsDir } from "../../src/lib/files";
import { displayToMeters } from "../../src/lib/units";
import { formatDateOnly, parseDateOnly, todayDateOnly } from "../../src/lib/time";
import { useTheme } from "../../src/theme";

/** Screen 05 — Add Service Record (CK-03). Pass ?vehicleId= to preselect a car. */
export default function NewServiceScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const presetVehicleId = Array.isArray(params.vehicleId) ? params.vehicleId[0] : params.vehicleId;

  const { data: vehicles = [] } = useVehicles();
  const { unit } = useDistanceUnit();
  const createServiceRecord = useCreateServiceRecord();

  const [attachment, setAttachment] = useState<{
    uri: string;
    mimeType: string;
    bytes: number;
    name: string;
  } | null>(null);
  const [attaching, setAttaching] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRecordFormValues>({
    resolver: zodResolver(serviceRecordFormSchema),
    defaultValues: {
      vehicleId: presetVehicleId ?? vehicles[0]?.id ?? "",
      type: "oil_change",
      serviceOn: todayDateOnly(),
    },
  });

  const selectedVehicleId = useWatch({ control, name: "vehicleId" });
  const selectedType = useWatch({ control, name: "type" });

  const onAttach = async (source: "photo" | "document") => {
    setAttaching(true);
    try {
      const picked = source === "photo" ? await pickReceiptPhoto() : await pickReceiptDocument();
      if (!picked) return;

      const problem = validateAttachment(picked.mimeType, picked.bytes);
      if (problem) {
        toast.show(problem.message, "error");
        return;
      }
      setAttachment(picked);
    } finally {
      setAttaching(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      let receipt;
      if (attachment) {
        const copied = await copyToReceiptsDir(attachment.uri, attachment.mimeType);
        receipt = {
          label: attachment.name,
          mimeType: attachment.mimeType,
          localPath: copied.localPath,
          bytes: copied.bytes,
        };
      }

      await createServiceRecord.mutateAsync({
        ...values,
        odometerMeters:
          values.odometer !== undefined ? displayToMeters(values.odometer, unit) : undefined,
        receipt,
      });
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
          Service records belong to a car. Add one from the Garage tab, then come back here.
        </Text>
      </View>
    );
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
            {errors.vehicleId && (
              <Text variant="caption" color={theme.colors.statusOverdue}>
                {errors.vehicleId.message}
              </Text>
            )}
          </View>
        )}

        <View style={{ gap: theme.spacing.xs }}>
          <Text variant="label" muted>
            Service type
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
            {SERVICE_TYPES.map((type) => {
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
                    {SERVICE_TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Controller
          control={control}
          name="serviceOn"
          render={({ field }) => (
            <DatePicker
              label="Service date"
              required
              value={field.value ? parseDateOnly(field.value) : undefined}
              onChange={(date) => field.onChange(formatDateOnly(date))}
            />
          )}
        />

        <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="odometer"
              render={({ field }) => (
                <NumberField
                  label="Odometer at service"
                  suffix={unit}
                  value={field.value}
                  onChangeValue={field.onChange}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <NumberField
                  label="Cost"
                  allowDecimal
                  value={field.value}
                  onChangeValue={field.onChange}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="provider"
          render={({ field }) => (
            <TextField
              label="Shop / provider"
              value={field.value ?? ""}
              onChangeText={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <TextField
              label="Notes"
              multiline
              numberOfLines={3}
              value={field.value ?? ""}
              onChangeText={field.onChange}
            />
          )}
        />

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label" muted>
            Receipt (optional)
          </Text>
          {attachment ? (
            <Card style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
              {attachment.mimeType === "application/pdf" ? (
                <FileText color={theme.colors.primary} size={20} />
              ) : (
                <ImageIcon color={theme.colors.primary} size={20} />
              )}
              <Text variant="body" style={{ flex: 1 }} numberOfLines={1}>
                {attachment.name}
              </Text>
              <Pressable onPress={() => setAttachment(null)} accessibilityLabel="Remove attachment">
                <X color={theme.colors.textMuted} size={20} />
              </Pressable>
            </Card>
          ) : (
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <Button
                label="Add photo"
                variant="secondary"
                onPress={() => onAttach("photo")}
                loading={attaching}
              />
              <Button
                label="Add PDF"
                variant="secondary"
                onPress={() => onAttach("document")}
                loading={attaching}
              />
            </View>
          )}
        </View>

        <Button
          label="Save service record"
          onPress={() => onSubmit()}
          loading={isSubmitting || createServiceRecord.isPending}
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
