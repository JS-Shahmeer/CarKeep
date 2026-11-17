import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import React, { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export interface DatePickerProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  required?: boolean;
  minimumDate?: Date;
  placeholder?: string;
  /** Shows a "Clear" action next to the field, for an optional date (e.g. CK-04's due date). */
  onClear?: () => void;
}

/**
 * All dates in CarKeep are calendar dates (brief section 04): the picker
 * works in local wall-clock time, never UTC-shifted.
 */
export function DatePicker({
  label,
  value,
  onChange,
  required,
  minimumDate,
  placeholder = "Select a date",
  onClear,
}: DatePickerProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const showPicker = () => setOpen(true);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="label" muted>
          {label}
          {required ? " *" : ""}
        </Text>
        {onClear && value && (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label}`}
          >
            <Text variant="label" color={theme.colors.primary}>
              Clear
            </Text>
          </Pressable>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={showPicker}
        style={{
          minHeight: theme.touchTarget,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.sm,
          paddingHorizontal: theme.spacing.md,
          justifyContent: "center",
          backgroundColor: theme.colors.surface,
        }}
      >
        <Text color={value ? theme.colors.text : theme.colors.textMuted}>
          {value ? format(value, "d MMM yyyy") : placeholder}
        </Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          minimumDate={minimumDate}
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(event, selected) => {
            setOpen(Platform.OS === "ios");
            if (event.type === "set" && selected) {
              onChange(selected);
            }
          }}
        />
      )}
    </View>
  );
}
