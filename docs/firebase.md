# Firebase

Firebase is initialized once in `src/lib/firebase/config.ts`. The integration layer exposes Authentication, Firestore, and Storage through separate modules. Configuration is read only from `EXPO_PUBLIC_FIREBASE_*` environment variables.

Firestore collections are `users`, `assistants`, `bookings`, `activeBookings`, and `educationContent`. Booking writes use the `activeBookings/{patientId}` reservation as the transactional uniqueness boundary. Education patient reads query `published == true`; managers can manage all education documents.

Create a local `.env` from `.env.example` for development. Never add service-account credentials, Admin SDK credentials, private keys, or a committed `.env` file to the mobile project.

The repository includes `firebase.json` for local Auth, Firestore, and Storage emulators. Firebase CLI is not a project dependency; run emulator Rules tests only when the CLI is installed separately. The legacy reservation migration is isolated in `scripts/migrate-active-bookings.mjs` and requires an explicit `FIREBASE_ACCESS_TOKEN`; use `MIGRATION_DRY_RUN=1` before any write.
