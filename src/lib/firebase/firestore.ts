import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

import { firebaseApp } from './config';
import type { UserProfile } from '../../types/auth';

export const firestore = getFirestore(firebaseApp);

export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  assistants: 'assistants',
  bookings: 'bookings',
  activeBookings: 'activeBookings',
  educationContent: 'educationContent',
} as const;

interface UserProfileDocument {
  readonly id: string;
  readonly role: UserProfile['role'];
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly createdAt: { toDate: () => Date };
  readonly updatedAt: { toDate: () => Date };
}

const isUserRole = (value: unknown): value is UserProfile['role'] =>
  value === 'patient' || value === 'manager';

const isUserProfileDocument = (value: unknown): value is UserProfileDocument => {
  if (typeof value !== 'object' || value === null) return false;

  const data = value as Record<string, unknown>;
  return (
    typeof data.id === 'string' &&
    isUserRole(data.role) &&
    typeof data.fullName === 'string' &&
    typeof data.phone === 'string' &&
    typeof data.email === 'string' &&
    typeof data.createdAt === 'object' &&
    data.createdAt !== null &&
    'toDate' in data.createdAt &&
    typeof data.updatedAt === 'object' &&
    data.updatedAt !== null &&
    'toDate' in data.updatedAt
  );
};

const toUserProfile = (data: UserProfileDocument): UserProfile => ({
  id: data.id,
  role: data.role,
  fullName: data.fullName,
  phone: data.phone,
  email: data.email,
  createdAt: data.createdAt.toDate().toISOString(),
  updatedAt: data.updatedAt.toDate().toISOString(),
});

export async function createPatientProfile(
  uid: string,
  profile: Pick<UserProfile, 'fullName' | 'phone' | 'email'>,
): Promise<void> {
  await setDoc(doc(firestore, FIRESTORE_COLLECTIONS.users, uid), {
    id: uid,
    role: 'patient',
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(firestore, FIRESTORE_COLLECTIONS.users, uid));
  if (!snapshot.exists()) return null;

  const data: unknown = snapshot.data();
  if (!isUserProfileDocument(data)) {
    throw new Error('The user profile is invalid.');
  }

  return toUserProfile(data);
}
