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

Service records, reminders, attachments, notifications and release are still placeholder
routes and land in modules 5–9 — see the
[module breakdown doc](https://claude.ai/artifact/Ki4aXKXrzvy5UBRgdtLv2S).

### Testing notes

This sandbox has no Android emulator or device, so modules 3–4 were verified by: TypeScript +
ESLint across all new code, unit tests for the pure business rules (`tests/`), running the
actual generated SQL migration against real SQLite to confirm the schema and the CK-08
cascade-delete behaviour, and a browser smoke test of the UI/navigation layer via Playwright.
The database itself was not exercised end-to-end in a real Expo/React Native runtime — do that
on a device or emulator before considering modules 3–4 release-ready.

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
