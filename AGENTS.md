# Care Assist Engineering Guide

Care Assist is an Android-first Expo application for coordinating non-clinical patient assistance. Patients request support; managers coordinate and confirm; assistants are business records and never use the application.

## Boundaries

- Keep patient and manager roles explicit as `UserRole`.
- Keep domain types independent from Firebase SDK types.
- Do not add clinical records, diagnosis, prescribing, chat, payments, GPS, or assistant authentication.
- Client route checks are UX only. Authorization belongs in Firebase Security Rules and, where required, a server-authoritative mechanism.

## Commands

- `npm run start` starts Expo.
- `npm run android` starts Expo and opens Android.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs strict TypeScript checking.
- `npm run format` formats tracked source/config files.
- `npm run format:check` verifies formatting.

The project uses Expo Router under `src/app`, Firebase modules under `src/lib/firebase`, and domain contracts under `src/types`.
