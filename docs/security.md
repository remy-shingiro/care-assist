# Security

`firestore.rules` and `storage.rules` start deny-by-default for sensitive writes. Signed-in users can access only their own user document; signed-in users may read assistant and education records. Booking writes remain denied until server-authoritative lifecycle and active-booking protections are specified.

Route guards are not security boundaries. Future rules must distinguish patient and manager claims/profile roles, protect assignment and status fields, and prevent patients from accessing other patients. The active-booking invariant may require a transaction plus an authoritative validation service; it must not depend on a client-side hidden button.
