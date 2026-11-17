import {
  computeNotificationFireDate,
  computeReminderStatus,
  computeSnoozeFireDate,
  needsDateNotification,
  reminderFormSchema,
  type Reminder,
} from "../src/features/reminders/domain";
import { daysBetween, formatDateOnly } from "../src/lib/time";

function baseReminder(
  overrides: Partial<Reminder> = {},
): Pick<Reminder, "dueDate" | "targetMeters" | "leadDays" | "snoozedUntil" | "completedAt"> {
  return {
    dueDate: null,
    targetMeters: null,
    leadDays: 7,
    snoozedUntil: null,
    completedAt: null,
    ...overrides,
  };
}

function daysFromNow(today: Date, days: number): string {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return formatDateOnly(date);
}

describe("reminderFormSchema (CK-04)", () => {
  const today = new Date();

  it("rejects a reminder with neither a due date nor a mileage target", () => {
    expect(
      reminderFormSchema.safeParse({
        vehicleId: "v1",
        type: "custom",
        title: "Check tyres",
        leadDays: 7,
      }).success,
    ).toBe(false);
  });

  it("accepts a reminder with only a due date", () => {
    expect(
      reminderFormSchema.safeParse({
        vehicleId: "v1",
        type: "custom",
        title: "Check tyres",
        dueDate: daysFromNow(today, 10),
        leadDays: 7,
      }).success,
    ).toBe(true);
  });

  it("accepts a reminder with only a mileage target", () => {
    expect(
      reminderFormSchema.safeParse({
        vehicleId: "v1",
        type: "custom",
        title: "Check tyres",
        targetOdometer: 10000,
        leadDays: 7,
      }).success,
    ).toBe(true);
  });
});

describe("computeReminderStatus (CK-04, CK-05, R02–R07)", () => {
  const today = new Date(2026, 5, 15); // 15 Jun 2026, local time

  it("is upcoming when neither criterion is close", () => {
    const status = computeReminderStatus(
      baseReminder({ dueDate: daysFromNow(today, 60) }),
      0,
      today,
    );
    expect(status.state).toBe("upcoming");
    expect(status.trigger).toBeNull();
  });

  it("is due_soon inside the lead-days window, but not yet overdue", () => {
    const status = computeReminderStatus(
      baseReminder({ dueDate: daysFromNow(today, 3), leadDays: 7 }),
      0,
      today,
    );
    expect(status.state).toBe("due_soon");
    expect(status.reachedByDate).toBe(false);
  });

  it("is overdue once the due date has passed (date criterion)", () => {
    const status = computeReminderStatus(
      baseReminder({ dueDate: daysFromNow(today, -1) }),
      0,
      today,
    );
    expect(status.state).toBe("overdue");
    expect(status.trigger).toBe("date");
  });

  // CK-T03 / CK-06 acceptance: "At 10,200 km, reminder target 10,000 km shows reached/due."
  it("is reached once the mileage target is crossed, even with a future due date", () => {
    const status = computeReminderStatus(
      baseReminder({ targetMeters: 10_000_000, dueDate: daysFromNow(today, 90) }),
      10_200_000,
      today,
    );
    expect(status.state).toBe("reached");
    expect(status.trigger).toBe("mileage");
  });

  it("is still upcoming when the mileage target has not been crossed", () => {
    const status = computeReminderStatus(
      baseReminder({ targetMeters: 10_000_000 }),
      8_000_000,
      today,
    );
    expect(status.state).toBe("upcoming");
    expect(status.reachedByMileage).toBe(false);
  });

  // CK-T05: "Combined due criteria triggers when either condition is reached."
  it("reports trigger 'both' when date and mileage are both reached", () => {
    const status = computeReminderStatus(
      baseReminder({ dueDate: daysFromNow(today, -2), targetMeters: 10_000_000 }),
      10_500_000,
      today,
    );
    expect(status.trigger).toBe("both");
    expect(status.state).toBe("overdue");
  });

  it("uses the earliest-met criterion when only mileage has been reached so far", () => {
    const status = computeReminderStatus(
      baseReminder({ dueDate: daysFromNow(today, 90), targetMeters: 10_000_000 }),
      10_500_000,
      today,
    );
    expect(status.trigger).toBe("mileage");
    expect(status.state).toBe("reached");
  });

  it("never reaches a mileage criterion when the odometer is unknown", () => {
    const status = computeReminderStatus(baseReminder({ targetMeters: 10_000_000 }), null, today);
    expect(status.reachedByMileage).toBe(false);
    expect(status.state).toBe("upcoming");
  });

  // R06: completion is an explicit, final state regardless of the underlying criteria.
  it("is completed once marked done, even if it would otherwise be overdue", () => {
    const status = computeReminderStatus(
      baseReminder({ dueDate: daysFromNow(today, -30), completedAt: "2026-06-01T00:00:00.000Z" }),
      0,
      today,
    );
    expect(status.state).toBe("completed");
  });

  // R07: snooze hides the alert state, but the real criterion is still reported.
  it("is snoozed while the snooze date is in the future, but still reports the real trigger", () => {
    const status = computeReminderStatus(
      baseReminder({ dueDate: daysFromNow(today, -5), snoozedUntil: daysFromNow(today, 10) }),
      0,
      today,
    );
    expect(status.state).toBe("snoozed");
    expect(status.reachedByDate).toBe(true);
    expect(status.trigger).toBe("date");
  });

  it("stops being snoozed once the snooze date arrives", () => {
    const status = computeReminderStatus(
      baseReminder({ dueDate: daysFromNow(today, -5), snoozedUntil: daysFromNow(today, 0) }),
      0,
      today,
    );
    expect(status.state).toBe("overdue");
  });
});

describe("needsDateNotification (CK-06, R03)", () => {
  it("is true only for an open reminder with a due date", () => {
    expect(needsDateNotification({ dueDate: "2026-06-01", completedAt: null })).toBe(true);
    expect(needsDateNotification({ dueDate: null, completedAt: null })).toBe(false);
    expect(
      needsDateNotification({ dueDate: "2026-06-01", completedAt: "2026-05-01T00:00:00.000Z" }),
    ).toBe(false);
  });
});

describe("computeNotificationFireDate / computeSnoozeFireDate (CK-06)", () => {
  it("fires leadDays before the due date, at a fixed local hour", () => {
    const fireDate = computeNotificationFireDate("2026-06-15", 7);
    expect(formatDateOnly(fireDate)).toBe("2026-06-08");
    expect(fireDate.getHours()).toBe(9);
  });

  it("fires on the snooze date itself", () => {
    const fireDate = computeSnoozeFireDate("2026-07-01");
    expect(formatDateOnly(fireDate)).toBe("2026-07-01");
  });
});

describe("daysBetween", () => {
  it("is stable across whole calendar days regardless of time of day", () => {
    const morning = new Date(2026, 0, 1, 1, 0, 0);
    const night = new Date(2026, 0, 1, 23, 0, 0);
    expect(daysBetween(morning, night)).toBe(0);
    expect(daysBetween(new Date(2026, 0, 1), new Date(2026, 0, 11))).toBe(10);
    expect(daysBetween(new Date(2026, 0, 11), new Date(2026, 0, 1))).toBe(-10);
  });
});
