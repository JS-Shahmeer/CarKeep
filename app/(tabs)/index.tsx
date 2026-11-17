import { router } from "expo-router";
import { CalendarClock, ChevronRight } from "lucide-react-native";
import React, { useEffect } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, EmptyState, StatusChip, Text } from "../../src/components";
import { useDueReminders, type ReminderWithStatus } from "../../src/features/reminders";
import { useDistanceUnit } from "../../src/features/settings/hooks";
import { useVehicles } from "../../src/features/vehicles";
import { formatDistance } from "../../src/lib/units";
import { parseDateOnly } from "../../src/lib/time";
import { useTheme } from "../../src/theme";

/**
 * Screen 03 — Home (brief section 02). The due list and hero card for the
 * next due item are built in module 7 (CK-04, CK-05, R02–R07); still gates
 * first-run users to Welcome (screen 01) until they have a car.
 */
export default function HomeScreen() {
  const theme = useTheme();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { unit } = useDistanceUnit();
  const { items, isLoading: remindersLoading } = useDueReminders();

  useEffect(() => {
    if (!vehiclesLoading && vehicles && vehicles.length === 0) {
      router.replace("/welcome");
    }
  }, [vehiclesLoading, vehicles]);

  if (vehiclesLoading || !vehicles || vehicles.length === 0) {
    return null;
  }

  const [hero, ...rest] = items;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
            <Text variant="title">Home</Text>
            {hero && <HeroCard reminder={hero} unit={unit} />}
            {rest.length > 0 && (
              <Text variant="label" muted>
                Also due
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          remindersLoading || hero ? undefined : (
            <EmptyState
              icon={<CalendarClock color={theme.colors.textMuted} size={40} />}
              title="No reminders yet"
              description="Add a reminder from your car's page to see upcoming and overdue items here."
            />
          )
        }
        renderItem={({ item }) => <ReminderRow reminder={item} unit={unit} />}
      />
    </SafeAreaView>
  );
}

function HeroCard({ reminder, unit }: { reminder: ReminderWithStatus; unit: "km" | "mi" }) {
  const theme = useTheme();
  const progress =
    reminder.targetMeters !== null && reminder.currentOdometerMeters !== null
      ? Math.min(1, reminder.currentOdometerMeters / reminder.targetMeters)
      : undefined;

  return (
    <Pressable onPress={() => router.push(`/car/${reminder.vehicleId}`)}>
      <Card
        style={{ backgroundColor: theme.colors.primaryTint, borderColor: theme.colors.primary }}
      >
        <View style={{ gap: theme.spacing.sm }}>
          <StatusChip status={reminder.status.state} />
          <Text variant="title">{reminder.title}</Text>
          <Text variant="body" muted>
            {reminder.vehicleNickname}
          </Text>
          <TriggerLine reminder={reminder} unit={unit} />
          {progress !== undefined && (
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.colors.surfaceAlt,
                overflow: "hidden",
                marginTop: theme.spacing.xs,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${Math.round(progress * 100)}%`,
                  borderRadius: 4,
                  backgroundColor: theme.colors.primary,
                }}
              />
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

function ReminderRow({ reminder, unit }: { reminder: ReminderWithStatus; unit: "km" | "mi" }) {
  const theme = useTheme();
  return (
    <Pressable onPress={() => router.push(`/car/${reminder.vehicleId}`)}>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="subtitle">{reminder.title}</Text>
          <Text variant="caption" muted>
            {reminder.vehicleNickname}
          </Text>
          <TriggerLine reminder={reminder} unit={unit} />
        </View>
        <StatusChip status={reminder.status.state} />
        <ChevronRight color={theme.colors.textMuted} size={18} />
      </Card>
    </Pressable>
  );
}

function TriggerLine({ reminder, unit }: { reminder: ReminderWithStatus; unit: "km" | "mi" }) {
  const parts: string[] = [];
  if (reminder.dueDate) {
    parts.push(parseDateOnly(reminder.dueDate).toLocaleDateString());
  }
  if (reminder.targetMeters !== null) {
    parts.push(formatDistance(reminder.targetMeters, unit));
  }
  if (parts.length === 0) return null;
  return (
    <Text variant="caption" muted>
      {parts.join(" · ")}
    </Text>
  );
}
