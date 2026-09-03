# Security

`firestore.rules` and `storage.rules` start deny-by-default for sensitive writes. Signed-in users can access only their own user document; signed-in users may read assistant and education records. Booking lifecycle writes remain restricted until server-authoritative protections are specified.

Route guards are not security boundaries. Booking creation is restricted to a signed-in non-manager creating a PENDING booking for their own patient ID; booking updates and deletes remain denied. Future rules must protect assignment and lifecycle fields and prevent patients from accessing other patients. The active-booking invariant may require a transaction plus an authoritative validation service; it must not depend on a client-side hidden button.
