import React, { forwardRef } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export interface TextFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, required, error, helperText, style, ...rest }, ref) => {
    const theme = useTheme();

    return (
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="label" muted>
          {label}
          {required ? " *" : ""}
        </Text>
        {/* react-native's own TextInput ref type doesn't structurally match its instance type in this SDK version. */}
        <TextInput
          ref={ref as unknown as React.ComponentProps<typeof TextInput>["ref"]}
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={label}
          style={[
            {
              minHeight: theme.touchTarget,
              borderWidth: 1,
              borderColor: error ? theme.colors.statusOverdue : theme.colors.border,
              borderRadius: theme.radii.sm,
              paddingHorizontal: theme.spacing.md,
              color: theme.colors.text,
              fontSize: theme.typography.size.md,
              backgroundColor: theme.colors.surface,
            },
            style,
          ]}
          {...rest}
        />
        {error ? (
          <Text variant="caption" color={theme.colors.statusOverdue}>
            {error}
          </Text>
        ) : helperText ? (
          <Text variant="caption" muted>
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = "TextField";
