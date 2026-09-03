# Security

`firestore.rules` and `storage.rules` start deny-by-default for sensitive writes. Signed-in users can access only their own user document; signed-in users may read assistant and education records. Booking lifecycle writes remain restricted until server-authoritative protections are specified.

Route guards are not security boundaries. Booking creation is restricted to a signed-in non-manager creating a PENDING booking for their own patient ID; manager updates are limited to approved pending decisions and confirmed reassignment. The `activeBookings/{patientId}` reservation is created or removed atomically with the corresponding booking, preventing concurrent active-booking creation. Booking updates and deletes outside those transitions remain denied. Future rules must protect additional lifecycle fields and preserve the reservation invariant; it must not depend on a client-side hidden button.
