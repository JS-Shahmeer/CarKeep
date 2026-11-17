import React from "react";
import { Modal, Pressable, View } from "react-native";
import { useTheme } from "../theme";
import { Button } from "./Button";
import { Text } from "./Text";

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Used for every destructive or ambiguous action the brief calls out:
 * deleting a vehicle/record (CK-08), confirming a lower odometer reading
 * (R04), and any action that removes app-managed files.
 */
export function ConfirmSheet({
  visible,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: "flex-end" }}
        onPress={onCancel}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radii.lg,
            borderTopRightRadius: theme.radii.lg,
            padding: theme.spacing.xl,
            gap: theme.spacing.md,
          }}
        >
          <Text variant="subtitle">{title}</Text>
          {description ? (
            <Text variant="body" muted>
              {description}
            </Text>
          ) : null}
          <View
            style={{ flexDirection: "row", gap: theme.spacing.md, marginTop: theme.spacing.sm }}
          >
            <View style={{ flex: 1 }}>
              <Button label={cancelLabel} variant="secondary" fullWidth onPress={onCancel} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label={confirmLabel}
                variant={destructive ? "destructive" : "primary"}
                fullWidth
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
