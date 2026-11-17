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
}: DatePickerProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const showPicker = () => setOpen(true);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="label" muted>
        {label}
        {required ? " *" : ""}
      </Text>
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
