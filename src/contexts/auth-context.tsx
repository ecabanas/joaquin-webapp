
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User 
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (name: string, email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // If user is logged in, listen for profile changes
        const unsubProfile = getUserProfile(user.uid, async (profile) => {
          if (profile) {
            setUserProfile(profile);
            setLoading(false);
          } else {
            // If profile doesn't exist, this is likely a first-time login
            // after data was cleared or a new auth provider was used.
            // We'll create a profile for them.
            try {
              console.log('No profile found for existing user. Creating one...');
              const newProfile = await createUserProfile(user.uid, {
                name: user.displayName || 'New User',
                email: user.email!,
                photoURL: user.photoURL
              });
              setUserProfile(newProfile);
            } catch (error) {
               console.error("Error creating user profile:", error);
            } finally {
              setLoading(false);
            }
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
  
  const signup = async (name: string, email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
      // Create user profile in Firestore
      const profile = await createUserProfile(userCredential.user.uid, { name, email });
      setUserProfile(profile);
    }
    return userCredential;
  };

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
