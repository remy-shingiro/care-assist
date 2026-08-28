# Architecture

Care Assist is a React Native and Expo mobile application written in TypeScript. Expo Router owns navigation. The `src/app` route groups are `(auth)`, `(patient)`, and `(manager)`, with shared booking routes under `booking`.

Feature code belongs in `src/features`; shared primitives belong in `src/components`; Firebase initialization and SDK adapters belong in `src/lib/firebase`; domain contracts belong in `src/types`.

Milestone 1 implements Firebase email/password authentication, patient profile creation, profile loading, logout, and role-aware routing. Booking creation, management workflows, and feature UI remain deferred.
