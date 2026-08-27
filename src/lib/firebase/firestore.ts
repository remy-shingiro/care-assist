import { getFirestore } from 'firebase/firestore';

import { firebaseApp } from './config';

export const firestore = getFirestore(firebaseApp);

export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  assistants: 'assistants',
  bookings: 'bookings',
  educationContent: 'educationContent',
} as const;
