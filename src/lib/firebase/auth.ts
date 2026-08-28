import {
  createUserWithEmailAndPassword,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { firebaseApp } from './config';

export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

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
