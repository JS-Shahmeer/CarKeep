import React from "react";
import { View } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type ReminderStatus =
  "upcoming" | "due_soon" | "overdue" | "reached" | "completed" | "snoozed";

/** R05: the mileage criterion uses "Reached" wording, distinct from a date's "Overdue". */
const LABEL: Record<ReminderStatus, string> = {
  upcoming: "Upcoming",
  due_soon: "Due Soon",
  overdue: "Overdue",
  reached: "Reached",
  completed: "Completed",
  snoozed: "Snoozed",
};

/**
 * A reminder's state is never shown by colour alone: the label text is
 * always present (brief 01.4), so this is safe for colour-blind users too.
 */
export function StatusChip({ status }: { status: ReminderStatus }) {
  const theme = useTheme();

  const colorByStatus: Record<ReminderStatus, string> = {
    upcoming: theme.colors.statusUpcoming,
    due_soon: theme.colors.statusDueSoon,
    overdue: theme.colors.statusOverdue,
    reached: theme.colors.statusOverdue,
    completed: theme.colors.statusDone,
    snoozed: theme.colors.statusSnoozed,
  };
  const color = colorByStatus[status];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: color + "22",
        borderRadius: theme.radii.pill,
        paddingVertical: 4,
        paddingHorizontal: theme.spacing.md,
        gap: 6,
      }}
      accessibilityLabel={`Status: ${LABEL[status]}`}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text variant="caption" style={{ color, fontFamily: theme.typography.fontFamily.semiBold }}>
        {LABEL[status]}
      </Text>
    </View>
  );
}
