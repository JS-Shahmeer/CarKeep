import React from "react";
import { Linking, Platform, Pressable, ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Text, toast } from "../../src/components";
import { useDistanceUnit, useNotificationsEnabled } from "../../src/features/settings/hooks";
import { useTheme } from "../../src/theme";

/**
 * Screen 09 — Settings (brief section 02). No export/import actions are
 * shown, per brief 04.1, since V1 has none. Notifications toggle is wired
 * (module 8); currency stays a placeholder, out of scope for this version.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const { unit, setUnit } = useDistanceUnit();
  const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled } =
    useNotificationsEnabled();

  const onToggleNotifications = async (next: boolean) => {
    const actual = await setNotificationsEnabled(next);
    if (next && !actual) {
      // Brief 06: "If denied, keep the underlying event visible and show
      // device-settings guidance" — the toggle itself just stays off.
      toast.show("Notifications are off in your device settings for CarKeep.", "error");
    }
  };

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
              alignItems: "center",
              paddingVertical: theme.spacing.sm,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
            }}
          >
            <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
              <Text variant="body">Reminder notifications</Text>
              <Text variant="caption" muted>
                Date-based reminders only. Mileage reminders never push — open the app to check
                them.
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            />
          </View>
        </Card>
        {Platform.OS !== "web" && (
          <Pressable onPress={() => Linking.openSettings()}>
            <Text variant="caption" color={theme.colors.primary}>
              Open device notification settings
            </Text>
          </Pressable>
        )}
        <Text variant="caption" muted>
          CarKeep stores everything only on this device. Uninstalling the app or losing your phone
          will delete your records — there is no cloud backup in this version.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
