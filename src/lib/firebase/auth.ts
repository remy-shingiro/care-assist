import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';

import { firebaseApp } from './config';

export const auth = getAuth(firebaseApp);

export const signUp = (
  email: string,
  password: string,
): ReturnType<typeof createUserWithEmailAndPassword> =>
  createUserWithEmailAndPassword(auth, email, password);

export const signIn = (
  email: string,
  password: string,
): ReturnType<typeof signInWithEmailAndPassword> =>
  signInWithEmailAndPassword(auth, email, password);

export const signOut = (): ReturnType<typeof firebaseSignOut> => firebaseSignOut(auth);

export const observeAuthState = (
  listener: (user: User | null) => void,
): ReturnType<typeof onAuthStateChanged> => onAuthStateChanged(auth, listener);
