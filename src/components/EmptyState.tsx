import React from "react";
import { View } from "react-native";
import { useTheme } from "../theme";
import { Button } from "./Button";
import { Text } from "./Text";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.xxl,
        gap: theme.spacing.sm,
      }}
    >
      {icon}
      <Text variant="subtitle" style={{ textAlign: "center" }}>
        {title}
      </Text>
      {description ? (
        <Text variant="body" muted style={{ textAlign: "center" }}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: theme.spacing.md }}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
