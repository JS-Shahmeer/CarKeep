import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Text } from "../../src/components";
import { useTheme } from "../../src/theme";

/**
 * Screen 09 — Settings (brief section 02). Distance unit, currency and
 * notification preference wiring come in modules 4, 5 and 8. No
 * export/import actions are shown, per brief 04.1, since V1 has none.
 */
export default function SettingsScreen() {
  const theme = useTheme();

  const rows = [
    { label: "Distance unit", value: "Kilometres" },
    { label: "Currency", value: "Not set" },
    { label: "Notifications", value: "Off" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        <Text variant="title">Settings</Text>
        <Card>
          {rows.map((row, index) => (
            <View
              key={row.label}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.sm,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: theme.colors.border,
              }}
            >
              <Text variant="body">{row.label}</Text>
              <Text variant="body" muted>
                {row.value}
              </Text>
            </View>
          ))}
        </Card>
        <Text variant="caption" muted>
          CarKeep stores everything only on this device. Uninstalling the app or losing your phone
          will delete your records — there is no cloud backup in this version.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
