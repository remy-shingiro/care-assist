import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { FIRESTORE_COLLECTIONS, firestore } from '../../lib/firebase/firestore';
import type { BookingRequestInput } from './bookings.validation';

const bookingsCollection = collection(firestore, FIRESTORE_COLLECTIONS.bookings);

export async function createPendingBooking(input: BookingRequestInput): Promise<string> {
  const reference = await addDoc(bookingsCollection, {
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
  return reference.id;
}
