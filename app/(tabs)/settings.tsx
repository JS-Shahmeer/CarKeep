import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Text } from "../../src/components";
import { useDistanceUnit } from "../../src/features/settings/hooks";
import { useTheme } from "../../src/theme";

/**
 * Screen 09 — Settings (brief section 02). Currency and notification
 * preference wiring come in modules 5 and 8. No export/import actions are
 * shown, per brief 04.1, since V1 has none.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const { unit, setUnit } = useDistanceUnit();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        <Text variant="title">Settings</Text>
        <Card>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: theme.spacing.sm,
            }}
          >
            <Text variant="body">Distance unit</Text>
            <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
              {(["km", "mi"] as const).map((option) => {
                const selected = unit === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setUnit(option)}
                    style={{
                      minHeight: 36,
                      paddingHorizontal: theme.spacing.md,
                      borderRadius: theme.radii.pill,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
                    }}
                  >
                    <Text
                      variant="label"
                      style={{ color: selected ? theme.colors.textOnPrimary : theme.colors.text }}
                    >
                      {option === "km" ? "Kilometres" : "Miles"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: theme.spacing.sm,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
            }}
          >
            <Text variant="body">Currency</Text>
            <Text variant="body" muted>
              Not set
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: theme.spacing.sm,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
            }}
          >
            <Text variant="body">Notifications</Text>
            <Text variant="body" muted>
              Off
            </Text>
          </View>
        </Card>
        <Text variant="caption" muted>
          CarKeep stores everything only on this device. Uninstalling the app or losing your phone
          will delete your records — there is no cloud backup in this version.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
