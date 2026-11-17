import { CalendarClock } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, Text } from "../../src/components";
import { useTheme } from "../../src/theme";

/**
 * Screen 03 — Home (brief section 02). The due list and hero card are
 * built in module 7 (reminders engine); this lays out the shell.
 */
export default function HomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, flexGrow: 1 }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.lg }}>
          Home
        </Text>
        <EmptyState
          icon={<CalendarClock color={theme.colors.textMuted} size={40} />}
          title="No reminders yet"
          description="Add a car and a reminder to see upcoming and overdue items here."
        />
      </ScrollView>
    </SafeAreaView>
  );
}
