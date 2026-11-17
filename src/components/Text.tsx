import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from "react-native";
import { useTheme } from "../theme";

export type TextVariant = "title" | "subtitle" | "body" | "label" | "caption";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  muted?: boolean;
}

/**
 * Thin wrapper over RN Text that applies our type scale and respects the
 * user's system font scaling (brief 01.4) because it never sets
 * allowFontScaling=false.
 */
export function Text({ variant = "body", color, muted, style, ...rest }: TextProps) {
  const theme = useTheme();
  const sizeByVariant: Record<TextVariant, number> = {
    title: theme.typography.size.xl,
    subtitle: theme.typography.size.lg,
    body: theme.typography.size.md,
    label: theme.typography.size.sm,
    caption: theme.typography.size.xs,
  };
  const weightByVariant: Record<TextVariant, string> = {
    title: theme.typography.fontFamily.bold,
    subtitle: theme.typography.fontFamily.semiBold,
    body: theme.typography.fontFamily.regular,
    label: theme.typography.fontFamily.medium,
    caption: theme.typography.fontFamily.regular,
  };

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize: sizeByVariant[variant],
          fontFamily: weightByVariant[variant],
          color: color ?? (muted ? theme.colors.textMuted : theme.colors.text),
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
