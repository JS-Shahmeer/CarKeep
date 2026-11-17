import { router, useLocalSearchParams } from "expo-router";
import { Pencil, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Card, ComingSoon, ConfirmSheet, NumberField, Text } from "../../src/components";
import { useDistanceUnit } from "../../src/features/settings/hooks";
import {
  odometerUpdateNeedsConfirmation,
  useDeleteVehicle,
  useUpdateOdometer,
  useVehicle,
} from "../../src/features/vehicles";
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

  const [odometerInput, setOdometerInput] = useState<number | undefined>(undefined);
  const [pendingCorrection, setPendingCorrection] = useState<number | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
        <Text variant="subtitle">Upcoming maintenance</Text>
        <Text variant="body" muted style={{ marginTop: theme.spacing.xs }}>
          Built in module 7 — Reminders engine.
        </Text>
      </Card>

      <Card>
        <Text variant="subtitle">Recent history</Text>
        <Text variant="body" muted style={{ marginTop: theme.spacing.xs }}>
          Built in module 5 — Service records and history.
        </Text>
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
    </ScrollView>
  );
}
