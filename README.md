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

Reminders, notifications and release are still placeholder routes and land in modules 7–9 —
see the [module breakdown doc](https://claude.ai/artifact/Ki4aXKXrzvy5UBRgdtLv2S).

### Testing notes

This sandbox has no Android emulator or device, so modules 3–6 were verified by: TypeScript +
ESLint across all new code, 17 unit tests for the pure business rules (`tests/`), and running
the actual generated SQL migration against real SQLite to confirm the schema plus the CK-08
(vehicle delete) and CK-07 (service-record delete cascades its document row) behaviour.
Modules 1–2 were also smoke-tested in a browser via Playwright; from module 3 onward the app
pulls in `expo-sqlite`, which this environment's web target can't bundle (a missing WASM asset
— an `expo-sqlite`/web packaging gap, not an app bug), so the UI built in modules 3–6 has only
been typechecked and statically reviewed, not clicked through. **Test the full Add Car → Add
Service Record (with a receipt) → History → Delete flow on a real Android device or emulator**
before treating modules 3–6 as release-ready.

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
