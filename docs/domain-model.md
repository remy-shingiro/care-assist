# Domain Model

Authenticated roles are `patient` and `manager`. Assistants are not authenticated users. They are manager-maintained business records with `professional` or `general` types and explicit unavailable date/time periods.

Bookings use `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, and `REJECTED`. Active bookings are `PENDING`, `CONFIRMED`, and `IN_PROGRESS`; a patient may have at most one active booking.

The active-booking invariant and assignment/status transitions must be protected by server-authoritative data validation, not only by UI state or trusted client payloads. The current rules intentionally deny booking writes until those constraints are designed.
