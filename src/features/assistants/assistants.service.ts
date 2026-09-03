import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import type { Assistant, AssistantType, UnavailablePeriod } from '../../types/assistant';
import { FIRESTORE_COLLECTIONS, firestore } from '../../lib/firebase/firestore';
import { isValidDate, isValidTimeRange } from './availability';
import type { AssistantInput } from './assistants.validation';

const assistantsCollection = collection(firestore, FIRESTORE_COLLECTIONS.assistants);

type TimestampValue = { readonly toDate: () => Date };

function isTimestampValue(value: unknown): value is TimestampValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  );
}

function readTimestamp(value: unknown): string | null {
  return isTimestampValue(value) ? value.toDate().toISOString() : null;
}

function readUnavailablePeriods(value: unknown): UnavailablePeriod[] | null {
  if (!Array.isArray(value)) return null;

  const periods: UnavailablePeriod[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) return null;
    const data = item as Record<string, unknown>;
    if (
      typeof data.id !== 'string' ||
      typeof data.date !== 'string' ||
      typeof data.startTime !== 'string' ||
      typeof data.endTime !== 'string' ||
      !isValidDate(data.date) ||
      !isValidTimeRange(data.startTime, data.endTime)
    ) {
      return null;
    }
    periods.push({
      id: data.id,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    });
  }
  return periods;
}

function readAssistant(id: string, value: unknown): Assistant | null {
  if (typeof value !== 'object' || value === null) return null;
  const data = value as Record<string, unknown>;
  const unavailablePeriods = readUnavailablePeriods(data.unavailablePeriods);
  const createdAt = readTimestamp(data.createdAt);
  const updatedAt = readTimestamp(data.updatedAt);

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
    unavailablePeriods === null ||
    createdAt === null ||
    updatedAt === null
  ) {
    return null;
  }

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
    unavailablePeriods,
    createdAt,
    updatedAt,
  };
}

const assistantFields = (input: AssistantInput) => ({
  fullName: input.fullName.trim(),
  type: input.type,
  photoUrl: input.photoUrl,
  phone: input.phone.trim(),
  bio: input.bio.trim(),
  experience: input.experience.trim(),
  services: input.services,
});

export async function listAssistants(activeOnly = false): Promise<Assistant[]> {
  const assistantQuery = activeOnly
    ? query(assistantsCollection, where('active', '==', true))
    : query(assistantsCollection, orderBy('fullName'));
  const snapshot = await getDocs(assistantQuery);
  return snapshot.docs
    .flatMap((item) => {
      const assistant = readAssistant(item.id, item.data());
      return assistant === null ? [] : [assistant];
    })
    .sort((first, second) => first.fullName.localeCompare(second.fullName));
}

export async function getAssistant(id: string): Promise<Assistant | null> {
  const snapshot = await getDoc(doc(assistantsCollection, id));
  return snapshot.exists() ? readAssistant(snapshot.id, snapshot.data()) : null;
}

export async function createAssistant(input: AssistantInput): Promise<string> {
  const reference = await addDoc(assistantsCollection, {
    ...assistantFields(input),
    active: true,
    unavailablePeriods: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateAssistant(id: string, input: AssistantInput): Promise<void> {
  await updateDoc(doc(assistantsCollection, id), {
    ...assistantFields(input),
    updatedAt: serverTimestamp(),
  });
}

export async function setAssistantActive(id: string, active: boolean): Promise<void> {
  await updateDoc(doc(assistantsCollection, id), { active, updatedAt: serverTimestamp() });
}

export async function setUnavailablePeriods(
  id: string,
  unavailablePeriods: readonly UnavailablePeriod[],
): Promise<void> {
  await updateDoc(doc(assistantsCollection, id), {
    unavailablePeriods,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAssistant(id: string): Promise<void> {
  await deleteDoc(doc(assistantsCollection, id));
}
