# Architecture

Care Assist is a React Native and Expo mobile application written in TypeScript. Expo Router owns navigation. The `src/app` route groups are `(auth)`, `(patient)`, and `(manager)`, with shared booking routes under `booking`.

Feature code belongs in `src/features`; shared primitives belong in `src/components`; Firebase initialization and SDK adapters belong in `src/lib/firebase`; domain contracts belong in `src/types`.

Milestone 1 implements Firebase email/password authentication, patient profile creation, profile loading, logout, and role-aware routing. Booking data operations live in the bookings feature layer. Each patient has at most one active booking reservation at `activeBookings/{patientId}`. Creating a pending booking creates that reservation and the booking in one transaction; rejecting a pending booking removes the reservation in the same transaction. Confirmation and reassignment retain the reservation because the booking remains active. Future cancellation and lifecycle transitions must preserve this transaction-backed invariant. Existing bookings created before this reservation design must be backfilled before they can participate in new active-booking requests.
