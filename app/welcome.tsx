import { Car } from "lucide-react-native";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "../src/components";
import { useTheme } from "../src/theme";

/** Screen 01 — Welcome (brief section 02). */
export default function WelcomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: theme.spacing.xl,
          gap: theme.spacing.lg,
        }}
      >
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.primaryTint,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Car color={theme.colors.primary} size={44} />
        </View>
        <Text variant="title" style={{ textAlign: "center" }}>
          Keep every car on track
        </Text>
        <Text variant="body" muted style={{ textAlign: "center" }}>
          Log mileage, track service history and never miss a reminder — all stored on your phone.
        </Text>
      </View>
      <View style={{ padding: theme.spacing.xl }}>
        {/* replace, not push: Home already replaced itself with this screen, so a
            push here would leave Welcome stuck under the new car's detail page —
            pressing back after adding a car would dead-end back on "Add My Car". */}
        <Button label="Add My Car" fullWidth onPress={() => router.replace("/car/edit")} />
      </View>
    </SafeAreaView>
  );
}
