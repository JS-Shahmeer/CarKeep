import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

/**
 * Schema from brief section 04. Distance stored as whole metres (R01).
 * Money stored as integer minor units (e.g. cents) to avoid float drift.
 * Dates are calendar dates (TEXT, ISO "YYYY-MM-DD"); timestamps are UTC
 * ISO strings.
 */

export const vehicles = sqliteTable("vehicles", {
  id: text("id").primaryKey(),
  nickname: text("nickname").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  plate: text("plate"),
  photoPath: text("photo_path"),
  odometerMeters: integer("odometer_meters"),
  odometerUpdatedAt: text("odometer_updated_at"),
  createdAt: text("created_at").notNull(),
});

export const serviceRecords = sqliteTable(
  "service_records",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    serviceOn: text("service_on").notNull(),
    odometerMeters: integer("odometer_meters"),
    priceMinor: integer("price_minor"),
    provider: text("provider"),
    notes: text("notes"),
    receiptDocumentId: text("receipt_document_id"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("service_records_vehicle_id_idx").on(table.vehicleId)],
);

export const reminders = sqliteTable(
  "reminders",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    dueDate: text("due_date"),
    targetMeters: integer("target_meters"),
    leadDays: integer("lead_days").notNull().default(7),
    state: text("state").notNull().default("upcoming"),
    snoozedUntil: text("snoozed_until"),
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("reminders_vehicle_id_idx").on(table.vehicleId)],
);

export const documents = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    serviceId: text("service_id").references(() => serviceRecords.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    mimeType: text("mime_type").notNull(),
    localPath: text("local_path").notNull(),
    bytes: integer("bytes").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("documents_vehicle_id_idx").on(table.vehicleId),
    index("documents_service_id_idx").on(table.serviceId),
  ],
);

export const notificationJobs = sqliteTable(
  "notification_jobs",
  {
    id: text("id").primaryKey(),
    reminderId: text("reminder_id")
      .notNull()
      .references(() => reminders.id, { onDelete: "cascade" }),
    plannedAtUtc: text("planned_at_utc").notNull(),
    state: text("state").notNull().default("scheduled"),
  },
  (table) => [index("notification_jobs_reminder_id_idx").on(table.reminderId)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
