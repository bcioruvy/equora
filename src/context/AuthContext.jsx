import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { subscribeToUserProfile } from '../firebase/firestore';
import { completeGoogleRedirectSignIn } from '../firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Picks up the result of a Google redirect sign-in (if the user just
    // came back from one) and creates their profile doc if this is their
    // first sign-in. Safe to call even when there's no pending redirect —
    // it just resolves to null.
    completeGoogleRedirectSignIn().catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const unsubscribe = subscribeToUserProfile(user.uid, setProfile);
    return unsubscribe;
  }, [user]);

  const value = {
    user,
    profile,
    authLoading,
    isAuthenticated: !!user,
    isVerified: !!user?.emailVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
