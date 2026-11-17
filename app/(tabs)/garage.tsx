import { router } from "expo-router";
import { Car } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, Fab, Text } from "../../src/components";
import { useTheme } from "../../src/theme";

/**
 * Screen 03/04 entry point — Garage (brief section 02). Vehicle list and
 * cards are built in module 4 (vehicles and odometer); this lays out the
 * shell with the "Add Service or Reminder" contextual FAB.
 */
export default function GarageScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, flexGrow: 1 }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.lg }}>
          Garage
        </Text>
        <EmptyState
          icon={<Car color={theme.colors.textMuted} size={40} />}
          title="No cars yet"
          description="Add your first car to start tracking mileage and service."
          actionLabel="Add My Car"
          onAction={() => router.push("/car/edit")}
        />
      </ScrollView>
      <Fab
        accessibilityLabel="Add service or reminder"
        onPress={() => router.push("/service/new")}
        style={{ position: "absolute", right: theme.spacing.lg, bottom: theme.spacing.lg }}
      />
    </SafeAreaView>
  );
}
