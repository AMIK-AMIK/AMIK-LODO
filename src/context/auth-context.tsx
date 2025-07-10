
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    User, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    updateProfile,
    AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const getFriendlyErrorMessage = (error: AuthError): string => {
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'This email address is already in use.';
        case 'auth/weak-password':
            return 'The password is too weak.';
        case 'auth/invalid-email':
            return 'The email address is not valid.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<string | undefined>;
  loginWithEmail: (email: string, pass: string) => Promise<string | undefined>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<string | undefined>;
  loginAnonymously: () => Promise<string | undefined>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Success", description: "Logged in successfully!" });
      router.push('/');
    } catch (error) {
      console.error("Google login error:", error);
      const errorMessage = getFriendlyErrorMessage(error as AuthError);
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
      return errorMessage;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        toast({ title: "Success", description: "Logged in successfully!" });
        router.push('/');
    } catch(error) {
        console.error("Email login error:", error);
        return getFriendlyErrorMessage(error as AuthError);
    }
  }

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        if(userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }
        // Manually update user state to reflect display name immediately
        setUser(auth.currentUser);
        toast({ title: "Success", description: "Account created successfully!" });
        router.push('/');
    } catch(error) {
        console.error("Email sign up error:", error);
        return getFriendlyErrorMessage(error as AuthError);
    }
  }

  const loginAnonymously = async () => {
    try {
        await signInAnonymously(auth);
        toast({ title: "Welcome!", description: "You are playing as a guest." });
        router.push('/');
    } catch(error) {
        console.error("Anonymous login error:", error);
        const errorMessage = getFriendlyErrorMessage(error as AuthError);
        toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
        return errorMessage;
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been signed out." });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage = getFriendlyErrorMessage(error as AuthError);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    loginAnonymously,
    logout,
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
