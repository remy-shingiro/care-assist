# Architecture

Care Assist is a React Native and Expo mobile application written in TypeScript. Expo Router owns navigation. The `src/app` route groups are `(auth)`, `(patient)`, and `(manager)`, with shared booking routes under `booking`.

Feature code belongs in `src/features`; shared primitives belong in `src/components`; Firebase initialization and SDK adapters belong in `src/lib/firebase`; domain contracts belong in `src/types`.

This phase contains route placeholders only. It does not implement booking creation, role resolution, management workflows, or feature UI.
