import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { User } from 'firebase/auth';

import {
  observeAuthState,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  signUp,
} from '../../lib/firebase/auth';
import { createPatientProfile, getUserProfile } from '../../lib/firebase/firestore';
import type { UserProfile } from '../../types/auth';

interface PatientRegistration {
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly password: string;
}

interface AuthContextValue {
  readonly user: User | null;
  readonly profile: UserProfile | null;
  readonly loading: boolean;
  readonly registerPatient: (registration: PatientRegistration) => Promise<void>;
  readonly signIn: (email: string, password: string) => Promise<void>;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const registrationInProgress = useRef(false);

  useEffect(() => {
    const unsubscribe = observeAuthState((nextUser) => {
      setUser(nextUser);
      if (nextUser === null) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (registrationInProgress.current) return;

      setLoading(true);
      void getUserProfile(nextUser.uid)
        .then((nextProfile) => {
          if (nextProfile === null) {
            throw new Error('Your account profile could not be found.');
          }
          setProfile(nextProfile);
        })
        .catch(async () => {
          setProfile(null);
          await firebaseSignOut();
        })
        .finally(() => setLoading(false));
    });

    return unsubscribe;
  }, []);

  const registerPatient = async (registration: PatientRegistration): Promise<void> => {
    registrationInProgress.current = true;
    setLoading(true);
    try {
      const credential = await signUp(registration.email, registration.password);
      await createPatientProfile(credential.user.uid, {
        fullName: registration.fullName,
        phone: registration.phone,
        email: registration.email,
      });
      const nextProfile = await getUserProfile(credential.user.uid);
      if (nextProfile === null) {
        throw new Error('Your account profile could not be created.');
      }
      setUser(credential.user);
      setProfile(nextProfile);
    } catch (error) {
      await firebaseSignOut();
      throw error;
    } finally {
      registrationInProgress.current = false;
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await firebaseSignIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, registerPatient, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
