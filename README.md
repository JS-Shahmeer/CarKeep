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

Everything else (vehicles, service records, reminders, notifications, release) is scaffolded
as placeholder routes and lands in later modules — see the
[module breakdown doc](https://claude.ai/artifact/Ki4aXKXrzvy5UBRgdtLv2S).

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
