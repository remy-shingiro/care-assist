# Firebase

Firebase is initialized once in `src/lib/firebase/config.ts`. The integration layer exposes Authentication, Firestore, and Storage through separate modules. Configuration is read only from `EXPO_PUBLIC_FIREBASE_*` environment variables.

Conceptual Firestore collections are `users`, `assistants`, `bookings`, and `educationContent`. Mapping and CRUD behavior are not implemented in this scaffold.

Create a local `.env` from `.env.example` for development. Never add service-account credentials, Admin SDK credentials, private keys, or a committed `.env` file to the mobile project.
