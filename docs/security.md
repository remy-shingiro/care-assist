# Security

`firestore.rules` and `storage.rules` start deny-by-default for sensitive writes. Signed-in users can access only their own user document; patients can read only published education, while managers can manage education content. Assistant and booking writes are constrained to their established field shapes and lifecycle transitions.

Route guards are not security boundaries. Booking creation is restricted to a signed-in non-manager creating a PENDING booking for their own patient ID; manager updates are limited to approved pending decisions, confirmed reassignment, and confirmed cancellation. Patient lifecycle updates are limited to cancellation, start, and completion. The `activeBookings/{patientId}` reservation is created or removed atomically with the corresponding booking, preventing concurrent active-booking creation. Booking updates and deletes outside those transitions remain denied.

Storage remains deny-all because the product has no upload flow. Legacy reservation backfill is explicit and reports conflicting active bookings rather than choosing a winner.
