import { Wrench } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, Text } from "../../src/components";
import { useTheme } from "../../src/theme";

/**
 * Screen 07 — Maintenance History (brief section 02). Filters and the
 * record list are built in module 5 (service records and history).
 */
export default function HistoryScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, flexGrow: 1 }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.lg }}>
          History
        </Text>
        <EmptyState
          icon={<Wrench color={theme.colors.textMuted} size={40} />}
          title="No service records yet"
          description="Completed maintenance will show up here, filterable by car and type."
        />
      </ScrollView>
    </SafeAreaView>
  );
}
