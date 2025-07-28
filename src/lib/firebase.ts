
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const isProduction = process.env.NODE_ENV === 'production';

// Use production keys by default, or if environment variables for dev are not set.
// In a real production environment, these NEXT_PUBLIC_FIREBASE_* variables
// would be set in the hosting provider's environment settings.
const firebaseConfig = {
  projectId: isProduction ? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV,
  appId: isProduction ? process.env.NEXT_PUBLIC_FIREBASE_APP_ID : process.env.NEXT_PUBLIC_FIREBASE_APP_ID_DEV,
  storageBucket: isProduction ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV,
  apiKey: isProduction ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY : process.env.NEXT_PUBLIC_FIREBASE_API_KEY_DEV,
  authDomain: isProduction ? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_DEV,
  messagingSenderId: isProduction ? process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID : process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV,
};

// Singleton pattern to ensure a single instance of Firebase services
function getFirebaseServices() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one.
      console.warn('Firestore persistence failed: Multiple tabs open.');
    } else if (err.code == 'unimplemented') {
      // The browser does not support all of the features required
      console.warn('Firestore persistence not available in this browser.');
    }
  });

  return { app, db, auth };
}

// Check if we are on the client-side before initializing
const canInitialize = typeof window !== 'undefined';

const { app, db, auth } = canInitialize
  ? getFirebaseServices()
  : { app: null, db: null, auth: null };

export { app, db, auth };
