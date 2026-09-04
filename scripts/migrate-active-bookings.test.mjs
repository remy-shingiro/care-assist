import assert from 'node:assert/strict';
import test from 'node:test';

import { planReservations } from './migrate-active-bookings.mjs';

test('plans one missing reservation without mutating bookings', () => {
  const summary = planReservations(
    [
      { id: 'pending-1', patientId: 'patient-1', status: 'PENDING' },
      { id: 'done-1', patientId: 'patient-2', status: 'COMPLETED' },
    ],
    new Map(),
  );

  assert.deepEqual(summary.reservationsToCreate, [
    { patientId: 'patient-1', bookingId: 'pending-1' },
  ]);
  assert.equal(summary.terminalBookingsSkipped, 1);
  assert.deepEqual(summary.conflicts, []);
});

test('reports conflicting active bookings and preserves existing reservations', () => {
  const summary = planReservations(
    [
      { id: 'pending-1', patientId: 'patient-1', status: 'PENDING' },
      { id: 'confirmed-1', patientId: 'patient-1', status: 'CONFIRMED' },
      { id: 'progress-1', patientId: 'patient-2', status: 'IN_PROGRESS' },
    ],
    new Map([['patient-2', { bookingId: 'progress-1' }]]),
  );

  assert.deepEqual(summary.reservationsToCreate, []);
  assert.equal(summary.reservationsAlreadyPresent, 1);
  assert.deepEqual(summary.reservationMismatches, []);
  assert.deepEqual(summary.conflicts, [
    { patientId: 'patient-1', bookingIds: ['pending-1', 'confirmed-1'] },
  ]);
});

test('reports a reservation that points to the wrong active booking', () => {
  const summary = planReservations(
    [{ id: 'pending-1', patientId: 'patient-1', status: 'PENDING' }],
    new Map([['patient-1', { bookingId: 'other-booking' }]]),
  );

  assert.deepEqual(summary.reservationsToCreate, []);
  assert.deepEqual(summary.reservationMismatches, [
    {
      patientId: 'patient-1',
      expectedBookingId: 'pending-1',
      actualBookingId: 'other-booking',
    },
  ]);
});
