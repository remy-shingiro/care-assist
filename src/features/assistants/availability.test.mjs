import assert from 'node:assert/strict';
import test from 'node:test';

import { isAssistantAvailable, isValidTimeRange, periodsOverlap } from './availability.ts';

const assistant = (
  active,
  periods = [{ id: 'period-1', date: '2026-09-10', startTime: '10:00', endTime: '14:00' }],
) => ({
  active,
  unavailablePeriods: periods,
});

test('requests completely before or after an unavailable period do not overlap', () => {
  assert.equal(periodsOverlap('08:00', '10:00', '10:00', '14:00'), false);
  assert.equal(periodsOverlap('14:00', '16:00', '10:00', '14:00'), false);
});

test('requests touching either boundary remain available', () => {
  assert.equal(periodsOverlap('10:00', '11:00', '11:00', '14:00'), false);
  assert.equal(periodsOverlap('14:00', '16:00', '10:00', '14:00'), false);
});

test('requests overlapping either side or containing the period overlap', () => {
  assert.equal(periodsOverlap('09:00', '11:00', '10:00', '14:00'), true);
  assert.equal(periodsOverlap('13:00', '15:00', '10:00', '14:00'), true);
  assert.equal(periodsOverlap('09:00', '15:00', '10:00', '14:00'), true);
  assert.equal(periodsOverlap('11:00', '12:00', '10:00', '14:00'), true);
});

test('invalid time ranges are rejected', () => {
  assert.equal(isValidTimeRange('10:00', '10:00'), false);
  assert.equal(isValidTimeRange('14:00', '10:00'), false);
  assert.equal(isValidTimeRange('9:00', '10:00'), false);
});

test('availability requires an active assistant and no conflict', () => {
  assert.equal(isAssistantAvailable(assistant(false), '2026-09-10', '08:00', '09:00'), false);
  assert.equal(isAssistantAvailable(assistant(true), '2026-09-10', '08:00', '09:00'), true);
  assert.equal(isAssistantAvailable(assistant(true), '2026-09-10', '13:59', '15:00'), false);
  assert.equal(isAssistantAvailable(assistant(true), '2026-09-09', '10:00', '12:00'), true);
});
