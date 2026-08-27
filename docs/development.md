# Development

Requirements: Node.js, npm, Expo tooling, and an Android emulator or physical Android device. Install dependencies with `npm install`, then use `npm run start` or `npm run android`.

Quality checks are `npm run lint`, `npm run typecheck`, and `npm run format:check`. Firebase credentials are required for real Firebase operations, but this scaffold does not require Firebase emulators.

Current status: Expo Router skeleton, strict domain types, Firebase initialization modules, baseline rules, UI primitives, and documentation are present. Authentication implementation and all patient/manager business workflows are intentionally out of scope for this phase.
