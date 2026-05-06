"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  plan: 'free' | 'pro' | 'agency';
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        setProfile(userSnapshot.data() as UserProfile);
      } else {
        // Create default free profile
        const newProfile = {
          plan: 'free' as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile({ ...newProfile, createdAt: new Date(), updatedAt: new Date() });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'users');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile: async () => {
      if (user) await fetchProfile(user.uid);
    } }}>
      {children}
    </AuthContext.Provider>
  );
}
