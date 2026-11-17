import React from "react";
import { View } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

/**
 * Placeholder body for routes whose real screen ships in a later module.
 * Brief 01: "unbuilt features must not appear as active controls" — so
 * these screens show no buttons that look live yet.
 */
export function ComingSoon({ title, module }: { title: string; module: string }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.xl,
        gap: theme.spacing.sm,
      }}
    >
      <Text variant="subtitle" style={{ textAlign: "center" }}>
        {title}
      </Text>
      <Text variant="body" muted style={{ textAlign: "center" }}>
        Built in {module}.
      </Text>
    </View>
  );
}
