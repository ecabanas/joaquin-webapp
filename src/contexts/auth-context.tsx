
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile, updateUserProfile, acceptInvite } from '@/lib/firestore';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (name: string, email: string, pass: string, inviteToken?: string | null) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    };
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // If user is logged in, listen for profile changes
        const unsubProfile = getUserProfile(user.uid, async (profile) => {
          if (profile) {
            setUserProfile(profile);
            setLoading(false);
          } else {
            // This case should ideally not be hit if signup is handled correctly.
            // But as a fallback, we check if a profile needs to be created.
            // This might happen if Firestore profile creation failed after auth creation.
            // We won't auto-create it here to avoid potential issues,
            // the user might need to re-register.
            console.warn("User is authenticated but no profile was found.");
            setLoading(false);
          }
        });
        return () => unsubProfile(); // Cleanup profile listener
      } else {
        // If user is logged out
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup auth listener
  }, []);
  
  const signup = async (name: string, email: string, pass: string, inviteToken: string | null = null) => {
    if (!auth) throw new Error("Firebase not initialized");
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const { user } = userCredential;

    if (user) {
        if (inviteToken) {
            // If the user is signing up with an invite, accept it
            const profile = await acceptInvite(inviteToken, {
                id: user.uid,
                name: name,
                email: email,
                photoURL: user.photoURL || ''
            });
            setUserProfile(profile);
        } else {
            // Otherwise, create a brand new profile and workspace
            const profile = await createUserProfile(user.uid, { name, email, photoURL: user.photoURL });
            setUserProfile(profile);
        }
    }
    return userCredential;
  };

  const login = (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const logout = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    await signOut(auth);
  };
  
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (user) {
      await updateUserProfile(user.uid, updates);
      // The onSnapshot listener will update the local userProfile state
    }
  };


  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
