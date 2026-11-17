# CarKeep

Offline-first car maintenance log and reminders app (React Native + Expo). See the
[developer brief](../CarKeep_Final_Developer_Brief.docx) in the project files for full scope.

## Status

Modules built so far:

- **M1 — Project foundation and app shell:** Expo + TypeScript, Expo Router with the
  Home / Garage / History / Settings tabs, Welcome screen, safe logger.
- **M2 — Design system and UI kit:** "Midnight Teal" theme tokens (light/dark) and the
  core UI kit (Button, Card, TextField, NumberField, DatePicker, StatusChip, ConfirmSheet,
  EmptyState, Fab, Toast).
- **M3 — Database and storage:** Drizzle schema for all 6 tables with indexes and cascading
  foreign keys, a generated SQL migration, the Expo SQLite client/migrator
  (`src/db/MigrationGate.tsx` blocks the app until migrations finish), a transaction helper,
  and a settings key/value store.
- **M4 — Vehicles and odometer:** Add/Edit/Delete Car (CK-01), a real Garage list, Car Detail
  with the odometer update flow and its "Correct previous reading?" confirmation (R04), and
  the Home screen gates first-run users to Welcome until a car exists.
- **M5 — Service records and history:** Add Service Record (CK-03) with a service-type picker,
  a real History tab filterable by car and type (CK-07), Record Detail, and a "Recent history"
  list on Car Detail.
- **M6 — Attachments:** pick a receipt photo or PDF, validated for type and size, copied into
  app-private storage inside the same transaction as the service record (brief 04.1), previewed
  or shared from Record Detail, and deleted along with its file when the record is deleted.
- **M7 — Reminders engine:** pure status rule (Upcoming / Due Soon / Overdue / Reached / Snoozed
  / Completed) that identifies which criterion — date, mileage, or both — fired first (CK-04,
  R02–R07); Add/Edit Reminder, snooze, mark-completed (never auto-creates a history entry, R06),
  and the Home due list with a hero card for the next item.
- **M8 — Local notifications:** a Settings toggle is the only place notification permission is
  ever requested, contextually, when turned on (CK-06, brief 06); date-based reminders schedule
  one local alert at `due date − lead days`; mileage-only reminders never push one. Every app
  launch rebuilds all scheduled jobs from the current reminders, which covers edits, a reboot and
  a timezone change without tracking each case separately. Deleting a reminder, a car, snoozing,
  or completing all cancel the matching scheduled alert.
- **M9 — QA:** 18 new unit tests cover every reminder business rule (R02–R08) and the
  notification fire-time math; the full suite (typecheck, lint, 35 tests) is green. Release
  build, signing and the store listing are **not done** — this sandbox can't produce or sign an
  Android build; see "Testing notes" below for what that leaves unverified.

### Testing notes

This sandbox has no Android emulator or device, so modules 3–9 were verified by: TypeScript +
ESLint across all code, 35 unit tests for the pure business rules (`tests/`), and running the
actual generated SQL migration against real SQLite to confirm the schema plus the CK-08
(vehicle delete only removes its own reminders, notification jobs and documents) and CK-07
(service-record delete cascades its document row) behaviour.
Modules 1–2 were also smoke-tested in a browser via Playwright; from module 3 onward the app
pulls in `expo-sqlite`, which this environment's web target can't bundle (a missing WASM asset
— an `expo-sqlite`/web packaging gap, not an app bug), so the UI built in modules 3–9 has only
been typechecked and statically reviewed, not clicked through — this includes the actual
scheduling and firing of a local notification, which needs a real device. **Before treating this
as release-ready, test on a real Android device or emulator:** Add Car → Add Service Record
(with a receipt) → set a reminder with a near-term due date → turn Settings notifications on and
confirm the OS permission prompt and a delivered alert → History → Delete.

## Getting started

```bash
npm install
npm run start   # then press a (Android) or scan the QR code
```

Useful scripts:

```bash
npm run typecheck
npm run lint
npm run test
```

## Project structure

```
app/            Expo Router routes (screens)
src/theme/      Design tokens and ThemeProvider
src/components/ Shared UI kit
src/lib/        Units, uuid, logger
src/db/         Drizzle schema (module 3)
src/features/   Feature modules (screens/hooks/domain/repo per feature)
tests/          Unit tests
```
