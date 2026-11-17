import { Plus } from "lucide-react-native";
import React from "react";
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../theme";

export interface FabProps extends Omit<PressableProps, "style"> {
  accessibilityLabel: string;
  /** Positioning only (e.g. absolute placement above the tab bar); visual styling is fixed. */
  style?: StyleProp<ViewStyle>;
}

/**
 * The contextual "+ Add Service or Reminder" action (brief 01 nav model).
 * Positioned by the screen that renders it, not fixed here, so it can sit
 * above the tab bar consistently per platform.
 */
export function Fab({ accessibilityLabel, style, ...rest }: FabProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: theme.colors.primary,
          opacity: pressed ? 0.85 : 1,
          width: 56,
          height: 56,
          borderRadius: theme.radii.pill,
        },
        theme.shadow.card,
        style,
      ]}
      {...rest}
    >
      <Plus color={theme.colors.textOnPrimary} size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});
