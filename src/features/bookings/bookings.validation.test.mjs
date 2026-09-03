import assert from 'node:assert/strict';
import test from 'node:test';

import { isActiveBookingStatus, isAllowedManagerTransition } from './booking-state.ts';

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
});
