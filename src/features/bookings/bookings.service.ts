import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  type Transaction,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth } from '../../lib/firebase/auth';
import { FIRESTORE_COLLECTIONS, firestore } from '../../lib/firebase/firestore';
import { isAssistantAvailable } from '../assistants/availability';
import type { Assistant, AssistantType, UnavailablePeriod } from '../../types/assistant';
import type { UserProfile } from '../../types/auth';
import type { Booking, BookingStatus } from '../../types/booking';
import type { BookingRequestInput } from './bookings.validation';

const bookingsCollection = collection(firestore, FIRESTORE_COLLECTIONS.bookings);
const assistantsCollection = collection(firestore, FIRESTORE_COLLECTIONS.assistants);
const activeBookingsCollection = collection(firestore, FIRESTORE_COLLECTIONS.activeBookings);

export type BookingServiceErrorCode =
  | 'booking-not-found'
  | 'booking-not-pending'
  | 'booking-not-confirmed'
  | 'booking-not-in-progress'
  | 'booking-not-cancellable'
  | 'unauthorized-lifecycle-action'
  | 'reservation-mismatch'
  | 'assistant-not-found'
  | 'assistant-unavailable'
  | 'assignment-unchanged'
  | 'active-booking-exists';

export class BookingServiceError extends Error {
  public constructor(
    public readonly code: BookingServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'BookingServiceError';
  }
}

type TimestampValue = { readonly toDate: () => Date };

function readTimestamp(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || !('toDate' in value)) return null;
  const timestamp = value as TimestampValue;
  return typeof timestamp.toDate === 'function' ? timestamp.toDate().toISOString() : null;
}

function readAssistant(id: string, value: unknown): Assistant | null {
  if (typeof value !== 'object' || value === null) return null;
  const data = value as Record<string, unknown>;
  if (
    typeof data.fullName !== 'string' ||
    (data.type !== 'professional' && data.type !== 'general') ||
    (typeof data.photoUrl !== 'string' && data.photoUrl !== null) ||
    typeof data.phone !== 'string' ||
    typeof data.bio !== 'string' ||
    typeof data.experience !== 'string' ||
    !Array.isArray(data.services) ||
    !data.services.every((service) => typeof service === 'string') ||
    typeof data.active !== 'boolean' ||
    !Array.isArray(data.unavailablePeriods) ||
    !data.unavailablePeriods.every((period) => {
      if (typeof period !== 'object' || period === null) return false;
      const item = period as Record<string, unknown>;
      return (
        typeof item.id === 'string' &&
        typeof item.date === 'string' &&
        typeof item.startTime === 'string' &&
        typeof item.endTime === 'string'
      );
    })
  ) {
    return null;
  }
  const createdAt = readTimestamp(data.createdAt);
  const updatedAt = readTimestamp(data.updatedAt);
  if (createdAt === null || updatedAt === null) return null;

  return {
    id,
    fullName: data.fullName,
    type: data.type as AssistantType,
    photoUrl: data.photoUrl,
    phone: data.phone,
    bio: data.bio,
    experience: data.experience,
    services: data.services,
    active: data.active,
    unavailablePeriods: data.unavailablePeriods as UnavailablePeriod[],
    createdAt,
    updatedAt,
  };
}

function readBooking(id: string, value: unknown): Booking | null {
  if (typeof value !== 'object' || value === null) return null;
  const data = value as Record<string, unknown>;
  const createdAt = readTimestamp(data.createdAt);
  const updatedAt = readTimestamp(data.updatedAt);
  if (
    typeof data.patientId !== 'string' ||
    (typeof data.preferredAssistantId !== 'string' && data.preferredAssistantId !== null) ||
    (typeof data.assignedAssistantId !== 'string' && data.assignedAssistantId !== null) ||
    typeof data.hospitalName !== 'string' ||
    (typeof data.wardOrRoom !== 'string' && data.wardOrRoom !== null) ||
    typeof data.date !== 'string' ||
    typeof data.startTime !== 'string' ||
    typeof data.endTime !== 'string' ||
    typeof data.serviceDescription !== 'string' ||
    !['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(
      data.status as string,
    ) ||
    createdAt === null ||
    updatedAt === null
  ) {
    return null;
  }
  return {
    id,
    patientId: data.patientId,
    preferredAssistantId: data.preferredAssistantId,
    assignedAssistantId: data.assignedAssistantId,
    hospitalName: data.hospitalName,
    wardOrRoom: data.wardOrRoom,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    serviceDescription: data.serviceDescription,
    status: data.status as BookingStatus,
    createdAt,
    updatedAt,
  };
}

export async function createPendingBooking(input: BookingRequestInput): Promise<string> {
  const bookingReference = doc(bookingsCollection);
  const activeReference = doc(activeBookingsCollection, input.patientId);
  try {
    await runTransaction(firestore, async (transaction) => {
      const activeSnapshot = await transaction.get(activeReference);
      if (activeSnapshot.exists()) {
        throw new BookingServiceError(
          'active-booking-exists',
          'You already have an active assistance request.',
        );
      }
      transaction.set(activeReference, {
        bookingId: bookingReference.id,
        patientId: input.patientId,
      });
      transaction.set(bookingReference, {
        patientId: input.patientId,
        preferredAssistantId: input.preferredAssistantId,
        assignedAssistantId: null,
        hospitalName: input.hospitalName.trim(),
        wardOrRoom: input.wardOrRoom?.trim() || null,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        serviceDescription: input.serviceDescription.trim(),
        status: 'PENDING',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
    if (code === 'already-exists') {
      throw new BookingServiceError(
        'active-booking-exists',
        'You already have an active assistance request.',
      );
    }
    throw error;
  }
  return bookingReference.id;
}

export async function listBookings(status?: BookingStatus): Promise<Booking[]> {
  const bookingQuery = status
    ? query(bookingsCollection, where('status', '==', status))
    : query(bookingsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(bookingQuery);
  return snapshot.docs
    .flatMap((item) => {
      const booking = readBooking(item.id, item.data());
      return booking === null ? [] : [booking];
    })
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function listPatientBookings(patientId: string): Promise<Booking[]> {
  const snapshot = await getDocs(query(bookingsCollection, where('patientId', '==', patientId)));
  return snapshot.docs
    .flatMap((item) => {
      const booking = readBooking(item.id, item.data());
      return booking === null ? [] : [booking];
    })
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function getBooking(id: string): Promise<Booking | null> {
  const snapshot = await getDoc(doc(bookingsCollection, id));
  return snapshot.exists() ? readBooking(snapshot.id, snapshot.data()) : null;
}

async function readBookingAndAssistant(
  transaction: Transaction,
  bookingId: string,
  assistantId: string,
): Promise<{ readonly booking: Booking; readonly assistant: Assistant }> {
  const bookingSnapshot = await transaction.get(doc(bookingsCollection, bookingId));
  const assistantSnapshot = await transaction.get(doc(assistantsCollection, assistantId));
  const booking = bookingSnapshot.exists()
    ? readBooking(bookingSnapshot.id, bookingSnapshot.data())
    : null;
  if (booking === null) {
    throw new BookingServiceError('booking-not-found', 'This booking request was not found.');
  }
  const assistant = assistantSnapshot.exists()
    ? readAssistant(assistantSnapshot.id, assistantSnapshot.data())
    : null;
  if (assistant === null) {
    throw new BookingServiceError('assistant-not-found', 'The selected assistant was not found.');
  }
  return { booking, assistant };
}

export async function confirmBooking(bookingId: string, assistantId: string): Promise<void> {
  await runTransaction(firestore, async (transaction) => {
    const { booking, assistant } = await readBookingAndAssistant(
      transaction,
      bookingId,
      assistantId,
    );
    if (booking.status !== 'PENDING') {
      throw new BookingServiceError('booking-not-pending', 'This request is no longer pending.');
    }
    if (!isAssistantAvailable(assistant, booking.date, booking.startTime, booking.endTime)) {
      throw new BookingServiceError(
        'assistant-unavailable',
        'The selected assistant is not available for this period.',
      );
    }

    transaction.update(doc(bookingsCollection, bookingId), {
      assignedAssistantId: assistantId,
      status: 'CONFIRMED',
      updatedAt: serverTimestamp(),
    });
  });
}

export async function reassignBooking(bookingId: string, assistantId: string): Promise<void> {
  await runTransaction(firestore, async (transaction) => {
    const { booking, assistant } = await readBookingAndAssistant(
      transaction,
      bookingId,
      assistantId,
    );
    if (booking.status !== 'CONFIRMED') {
      throw new BookingServiceError(
        'booking-not-confirmed',
        'Only confirmed bookings can be reassigned.',
      );
    }
    if (booking.assignedAssistantId === assistantId) {
      throw new BookingServiceError(
        'assignment-unchanged',
        'Choose a different assistant to reassign this booking.',
      );
    }
    if (!isAssistantAvailable(assistant, booking.date, booking.startTime, booking.endTime)) {
      throw new BookingServiceError(
        'assistant-unavailable',
        'The selected assistant is not available for this period.',
      );
    }

    transaction.update(doc(bookingsCollection, bookingId), {
      assignedAssistantId: assistantId,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function rejectBooking(bookingId: string): Promise<void> {
  await runTransaction(firestore, async (transaction) => {
    const bookingReference = doc(bookingsCollection, bookingId);
    const bookingSnapshot = await transaction.get(bookingReference);
    if (!bookingSnapshot.exists()) {
      throw new BookingServiceError('booking-not-found', 'This booking request was not found.');
    }
    const booking = readBooking(bookingSnapshot.id, bookingSnapshot.data());
    if (booking === null || booking.status !== 'PENDING') {
      throw new BookingServiceError('booking-not-pending', 'This request is no longer pending.');
    }
    const patientActiveReference = doc(activeBookingsCollection, booking.patientId);
    const activeSnapshot = await transaction.get(patientActiveReference);
    if (activeSnapshot.exists()) transaction.delete(patientActiveReference);
    transaction.update(bookingReference, {
      assignedAssistantId: null,
      status: 'REJECTED',
      updatedAt: serverTimestamp(),
    });
  });
}

async function readLifecycleBooking(transaction: Transaction, bookingId: string) {
  const reference = doc(bookingsCollection, bookingId);
  const snapshot = await transaction.get(reference);
  const booking = snapshot.exists() ? readBooking(snapshot.id, snapshot.data()) : null;
  if (booking === null) {
    throw new BookingServiceError('booking-not-found', 'This booking was not found.');
  }
  return { booking, reference };
}

function requireCurrentUser(): string {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new BookingServiceError(
      'unauthorized-lifecycle-action',
      'You must be signed in to manage this booking.',
    );
  }
  return userId;
}

export async function cancelBookingAsPatient(bookingId: string): Promise<void> {
  const patientId = requireCurrentUser();
  await runTransaction(firestore, async (transaction) => {
    const { booking, reference } = await readLifecycleBooking(transaction, bookingId);
    if (booking.patientId !== patientId) {
      throw new BookingServiceError(
        'unauthorized-lifecycle-action',
        'You cannot change this booking.',
      );
    }
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      throw new BookingServiceError(
        'booking-not-cancellable',
        'Only pending or confirmed bookings can be cancelled.',
      );
    }
    const reservationReference = doc(activeBookingsCollection, booking.patientId);
    const reservation = await transaction.get(reservationReference);
    if (!reservation.exists() || reservation.data().bookingId !== bookingId) {
      throw new BookingServiceError('reservation-mismatch', 'This booking is no longer active.');
    }
    transaction.update(reference, { status: 'CANCELLED', updatedAt: serverTimestamp() });
    transaction.delete(reservationReference);
  });
}

export async function cancelBookingAsManager(bookingId: string): Promise<void> {
  requireCurrentUser();
  await runTransaction(firestore, async (transaction) => {
    const { booking, reference } = await readLifecycleBooking(transaction, bookingId);
    if (booking.status !== 'CONFIRMED') {
      throw new BookingServiceError(
        'booking-not-cancellable',
        'Only confirmed bookings can be cancelled by a manager.',
      );
    }
    const reservationReference = doc(activeBookingsCollection, booking.patientId);
    const reservation = await transaction.get(reservationReference);
    if (!reservation.exists() || reservation.data().bookingId !== bookingId) {
      throw new BookingServiceError('reservation-mismatch', 'This booking is no longer active.');
    }
    transaction.update(reference, { status: 'CANCELLED', updatedAt: serverTimestamp() });
    transaction.delete(reservationReference);
  });
}

export async function startBooking(bookingId: string): Promise<void> {
  const patientId = requireCurrentUser();
  await runTransaction(firestore, async (transaction) => {
    const { booking, reference } = await readLifecycleBooking(transaction, bookingId);
    if (booking.patientId !== patientId) {
      throw new BookingServiceError(
        'unauthorized-lifecycle-action',
        'You cannot start this booking.',
      );
    }
    if (booking.status !== 'CONFIRMED') {
      throw new BookingServiceError(
        'booking-not-confirmed',
        'Only confirmed bookings can be started.',
      );
    }
    const reservationReference = doc(activeBookingsCollection, booking.patientId);
    const reservation = await transaction.get(reservationReference);
    if (!reservation.exists() || reservation.data().bookingId !== bookingId) {
      throw new BookingServiceError('reservation-mismatch', 'This booking is no longer active.');
    }
    transaction.update(reference, { status: 'IN_PROGRESS', updatedAt: serverTimestamp() });
  });
}

export async function completeBooking(bookingId: string): Promise<void> {
  const patientId = requireCurrentUser();
  await runTransaction(firestore, async (transaction) => {
    const { booking, reference } = await readLifecycleBooking(transaction, bookingId);
    if (booking.patientId !== patientId) {
      throw new BookingServiceError(
        'unauthorized-lifecycle-action',
        'You cannot complete this booking.',
      );
    }
    if (booking.status !== 'IN_PROGRESS') {
      throw new BookingServiceError(
        'booking-not-in-progress',
        'Only bookings in progress can be completed.',
      );
    }
    const reservationReference = doc(activeBookingsCollection, booking.patientId);
    const reservation = await transaction.get(reservationReference);
    if (!reservation.exists() || reservation.data().bookingId !== bookingId) {
      throw new BookingServiceError('reservation-mismatch', 'This booking is no longer active.');
    }
    transaction.update(reference, { status: 'COMPLETED', updatedAt: serverTimestamp() });
    transaction.delete(reservationReference);
  });
}

export async function getPatientContact(
  patientId: string,
): Promise<Pick<UserProfile, 'fullName' | 'phone'> | null> {
  const snapshot = await getDoc(doc(collection(firestore, FIRESTORE_COLLECTIONS.users), patientId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (typeof data.fullName !== 'string' || typeof data.phone !== 'string') return null;
  return { fullName: data.fullName, phone: data.phone };
}
