import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "../theme";

export interface CardProps extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ padded = true, elevated = true, style, children, ...rest }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing.lg : 0,
        },
        elevated ? theme.shadow.card : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
