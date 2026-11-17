import { router } from "expo-router";
import { ChevronRight, Wrench } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, EmptyState, Text } from "../../src/components";
import { SERVICE_TYPES, SERVICE_TYPE_LABELS, useServiceRecords } from "../../src/features/services";
import { useVehicles } from "../../src/features/vehicles";
import { formatMinor } from "../../src/lib/money";
import { parseDateOnly } from "../../src/lib/time";
import { useTheme } from "../../src/theme";

/** Screen 07 — Maintenance History (CK-07): completed work only, filterable by car and type. */
export default function HistoryScreen() {
  const theme = useTheme();
  const { data: vehicles = [] } = useVehicles();
  const [vehicleId, setVehicleId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);
  const { data: records = [], isLoading } = useServiceRecords({ vehicleId, type });

  const vehicleById = Object.fromEntries(vehicles.map((v) => [v.id, v.nickname]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
            <Text variant="title">History</Text>
            {vehicles.length > 1 && (
              <FilterRow
                options={[
                  { id: undefined, label: "All cars" },
                  ...vehicles.map((v) => ({ id: v.id, label: v.nickname })),
                ]}
                selected={vehicleId}
                onSelect={setVehicleId}
              />
            )}
            <FilterRow
              options={[
                { id: undefined, label: "All types" },
                ...SERVICE_TYPES.map((t) => ({ id: t, label: SERVICE_TYPE_LABELS[t] })),
              ]}
              selected={type}
              onSelect={setType}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? undefined : (
            <EmptyState
              icon={<Wrench color={theme.colors.textMuted} size={40} />}
              title="No service records yet"
              description="Completed maintenance will show up here, filterable by car and type."
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/service/${item.id}`)}>
            <Card style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle">
                  {SERVICE_TYPE_LABELS[item.type as keyof typeof SERVICE_TYPE_LABELS] ?? item.type}
                </Text>
                <Text variant="caption" muted>
                  {vehicleById[item.vehicleId] ?? "Unknown car"} ·{" "}
                  {parseDateOnly(item.serviceOn).toLocaleDateString()}
                  {item.priceMinor !== null ? ` · $${formatMinor(item.priceMinor)}` : ""}
                </Text>
              </View>
              <ChevronRight color={theme.colors.textMuted} size={20} />
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function FilterRow<T extends string | undefined>({
  options,
  selected,
  onSelect,
}: {
  options: { id: T; label: string }[];
  selected: T;
  onSelect: (id: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
      {options.map((option) => {
        const isSelected = option.id === selected;
        return (
          <Pressable
            key={option.label}
            onPress={() => onSelect(option.id)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radii.pill,
              backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceAlt,
            }}
          >
            <Text
              variant="caption"
              style={{ color: isSelected ? theme.colors.textOnPrimary : theme.colors.text }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
