
'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import type { AuthError, AuthProviderProps, AuthContextType, SignUpCredentials, SignInCredentials } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe; // Unsubscribe on cleanup
  }, []);

  const signUp = async ({ email, password }: SignUpCredentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // currentUser will be set by onAuthStateChanged
    } catch (error) {
      setAuthError(error as AuthError);
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const signIn = async ({ email, password }: SignInCredentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // currentUser will be set by onAuthStateChanged
    } catch (error) {
      setAuthError(error as AuthError);
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await firebaseSignOut(auth);
      // currentUser will be set to null by onAuthStateChanged
    } catch (error) {
      setAuthError(error as AuthError);
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    authError,
    setAuthError,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
