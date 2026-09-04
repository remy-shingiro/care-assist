import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isActiveBookingStatus,
  isAllowedManagerCancellation,
  isAllowedManagerTransition,
  isAllowedPatientTransition,
} from './booking-state.ts';

test('allows only the supported manager booking transitions', () => {
  assert.equal(isAllowedManagerTransition('PENDING', 'CONFIRMED'), true);
  assert.equal(isAllowedManagerTransition('PENDING', 'REJECTED'), true);
  assert.equal(isAllowedManagerTransition('CONFIRMED', 'CONFIRMED'), true);
  assert.equal(isAllowedManagerTransition('CONFIRMED', 'REJECTED'), false);
  assert.equal(isAllowedManagerTransition('CONFIRMED', 'PENDING'), false);
  assert.equal(isAllowedManagerTransition('CONFIRMED', 'IN_PROGRESS'), false);
});

test('identifies the active booking statuses', () => {
  assert.equal(isActiveBookingStatus('PENDING'), true);
  assert.equal(isActiveBookingStatus('CONFIRMED'), true);
  assert.equal(isActiveBookingStatus('IN_PROGRESS'), true);
  assert.equal(isActiveBookingStatus('REJECTED'), false);
  assert.equal(isActiveBookingStatus('COMPLETED'), false);
  assert.equal(isActiveBookingStatus('CANCELLED'), false);
});

test('allows the supported lifecycle transitions', () => {
  assert.equal(isAllowedPatientTransition('PENDING', 'CANCELLED'), true);
  assert.equal(isAllowedPatientTransition('CONFIRMED', 'CANCELLED'), true);
  assert.equal(isAllowedPatientTransition('CONFIRMED', 'IN_PROGRESS'), true);
  assert.equal(isAllowedPatientTransition('IN_PROGRESS', 'COMPLETED'), true);
  assert.equal(isAllowedManagerCancellation('CONFIRMED', 'CANCELLED'), true);
});

test('rejects forbidden lifecycle transitions', () => {
  for (const [current, next] of [
    ['PENDING', 'IN_PROGRESS'],
    ['PENDING', 'COMPLETED'],
    ['CONFIRMED', 'COMPLETED'],
    ['CONFIRMED', 'REJECTED'],
    ['IN_PROGRESS', 'CANCELLED'],
    ['IN_PROGRESS', 'CONFIRMED'],
    ['COMPLETED', 'CANCELLED'],
    ['CANCELLED', 'PENDING'],
    ['REJECTED', 'CONFIRMED'],
  ]) {
    assert.equal(isAllowedPatientTransition(current, next), false);
  }
  assert.equal(isAllowedManagerCancellation('PENDING', 'CANCELLED'), false);
  assert.equal(isAllowedManagerCancellation('IN_PROGRESS', 'CANCELLED'), false);
});
