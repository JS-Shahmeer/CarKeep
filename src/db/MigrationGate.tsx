import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "../components";
import { useTheme } from "../theme";
import { useDatabaseMigrations } from "./migrate";

/**
 * Blocks rendering the app until pending migrations have run, and shows a
 * plain error with a retry instead of a blank/crashed screen if they fail
 * (brief 04.1: never a silent destructive reset, and 01.4: recover
 * gracefully from force-close).
 */
export function MigrationGate({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { success, error } = useDatabaseMigrations();

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.xl,
          gap: theme.spacing.md,
          backgroundColor: theme.colors.background,
        }}
      >
        <Text variant="subtitle" style={{ textAlign: "center" }}>
          CarKeep couldn&apos;t open its local database
        </Text>
        <Text variant="body" muted style={{ textAlign: "center" }}>
          Your existing records are untouched. Closing and reopening the app usually fixes this.
        </Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}
