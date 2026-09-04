/* global console, fetch, URL */

import process from 'node:process';
import { pathToFileURL } from 'node:url';

export const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED', 'IN_PROGRESS']);

export function planReservations(bookings, reservations) {
  const activeBookings = bookings.filter((booking) => ACTIVE_STATUSES.has(booking.status));
  const byPatient = new Map();
  for (const booking of activeBookings) {
    const patientBookings = byPatient.get(booking.patientId) ?? [];
    patientBookings.push(booking);
    byPatient.set(booking.patientId, patientBookings);
  }

  const actions = [];
  const conflicts = [];
  const reservationMismatches = [];
  let reservationsAlreadyPresent = 0;
  for (const [patientId, patientBookings] of byPatient) {
    if (patientBookings.length > 1) {
      conflicts.push({ patientId, bookingIds: patientBookings.map((booking) => booking.id) });
      continue;
    }
    const existing = reservations.get(patientId);
    if (existing) {
      if (existing.bookingId !== patientBookings[0].id) {
        reservationMismatches.push({
          patientId,
          expectedBookingId: patientBookings[0].id,
          actualBookingId: existing.bookingId ?? null,
        });
        continue;
      }
      reservationsAlreadyPresent += 1;
      continue;
    }
    actions.push({ patientId, bookingId: patientBookings[0].id });
  }

  return {
    bookingsScanned: bookings.length,
    activeBookingsFound: activeBookings.length,
    terminalBookingsSkipped: bookings.length - activeBookings.length,
    reservationsAlreadyPresent,
    reservationsToCreate: actions,
    conflicts,
    reservationMismatches,
  };
}

function firestoreValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  return undefined;
}

function documentData(document) {
  return Object.fromEntries(
    Object.entries(document.fields ?? {}).map(([key, value]) => [key, firestoreValue(value)]),
  );
}

function documentId(name) {
  return name.slice(name.lastIndexOf('/') + 1);
}

function requiredEnvironment() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const accessToken = process.env.FIREBASE_ACCESS_TOKEN;
  if (!projectId || !accessToken) {
    throw new Error(
      'Set FIREBASE_PROJECT_ID (or EXPO_PUBLIC_FIREBASE_PROJECT_ID) and FIREBASE_ACCESS_TOKEN before running the migration.',
    );
  }
  return {
    projectId,
    accessToken,
    databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
  };
}

async function firestoreRequest(url, accessToken, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Firestore REST request failed (${response.status}): ${detail}`);
  }
  return response.status === 204 ? null : response.json();
}

async function listDocuments(collectionName, environment) {
  const documents = [];
  let pageToken = '';
  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${environment.projectId}/databases/${environment.databaseId}/documents/${collectionName}`,
    );
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const result = await firestoreRequest(url, environment.accessToken);
    documents.push(...(result.documents ?? []));
    pageToken = result.nextPageToken ?? '';
  } while (pageToken);
  return documents;
}

async function createReservation(environment, patientId, bookingId) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${environment.projectId}/databases/${environment.databaseId}/documents/activeBookings/${encodeURIComponent(patientId)}`,
  );
  url.searchParams.append('updateMask.fieldPaths', 'bookingId');
  url.searchParams.append('updateMask.fieldPaths', 'patientId');
  url.searchParams.set('currentDocument.exists', 'false');
  return firestoreRequest(url, environment.accessToken, {
    method: 'PATCH',
    body: JSON.stringify({
      fields: {
        bookingId: { stringValue: bookingId },
        patientId: { stringValue: patientId },
      },
    }),
  });
}

export async function runMigration(environment = requiredEnvironment()) {
  const bookingDocuments = await listDocuments('bookings', environment);
  const reservationDocuments = await listDocuments('activeBookings', environment);
  const bookings = bookingDocuments.map((document) => ({
    id: documentId(document.name),
    ...documentData(document),
  }));
  const reservations = new Map(
    reservationDocuments.map((document) => [documentId(document.name), documentData(document)]),
  );
  const plan = planReservations(bookings, reservations);
  const created = [];
  const dryRun = process.env.MIGRATION_DRY_RUN === '1';

  if (!dryRun) {
    for (const action of plan.reservationsToCreate) {
      try {
        await createReservation(environment, action.patientId, action.bookingId);
        created.push(action);
      } catch (error) {
        if (error instanceof Error && error.message.includes('(409)')) continue;
        throw error;
      }
    }
  }

  return {
    ...plan,
    reservationsCreated: dryRun ? 0 : created.length,
    dryRun,
  };
}

function printSummary(summary) {
  console.log(`Bookings scanned: ${summary.bookingsScanned}`);
  console.log(`Active bookings found: ${summary.activeBookingsFound}`);
  console.log(`Reservations already present: ${summary.reservationsAlreadyPresent}`);
  console.log(`Reservations created: ${summary.reservationsCreated}`);
  console.log(`Terminal bookings skipped: ${summary.terminalBookingsSkipped}`);
  console.log(`Conflicting patients: ${summary.conflicts.length}`);
  for (const conflict of summary.conflicts) {
    console.log(`Conflict ${conflict.patientId}: ${conflict.bookingIds.join(', ')}`);
  }
  console.log(`Reservation mismatches: ${summary.reservationMismatches.length}`);
  for (const mismatch of summary.reservationMismatches) {
    console.log(
      `Reservation mismatch ${mismatch.patientId}: expected ${mismatch.expectedBookingId}, found ${mismatch.actualBookingId ?? 'none'}`,
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    printSummary(await runMigration());
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
