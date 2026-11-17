import React, { useEffect } from "react";
import { View } from "react-native";
import { create } from "zustand";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type ToastKind = "info" | "success" | "error";

interface ToastState {
  message: string | null;
  kind: ToastKind;
  show: (message: string, kind?: ToastKind) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  kind: "info",
  show: (message, kind = "info") => set({ message, kind }),
  hide: () => set({ message: null }),
}));

/** Imperative helper so repositories/hooks can surface storage errors (CK-08) without prop drilling. */
export const toast = {
  show: (message: string, kind: ToastKind = "info") => useToastStore.getState().show(message, kind),
};

/** Mount once near the root, inside ThemeProvider. */
export function ToastHost() {
  const theme = useTheme();
  const { message, kind, hide } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, 3000);
    return () => clearTimeout(timer);
  }, [message, hide]);

  if (!message) return null;

  const colorByKind: Record<ToastKind, string> = {
    info: theme.colors.text,
    success: theme.colors.statusDone,
    error: theme.colors.statusOverdue,
  };

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        bottom: theme.spacing.xxl,
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          maxWidth: "100%",
        }}
      >
        <Text variant="label" style={{ color: colorByKind[kind] }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
