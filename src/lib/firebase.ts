// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// In development, the app uses NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV etc. from .env.local
// In the CI environment (GitHub Actions), we explicitly set NEXT_PUBLIC_FIREBASE_PROJECT_ID
// to the *dev* secret. In production, these will be set by the hosting provider.
const devConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_DEV,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_DEV,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_DEV,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV,
};

const configToUse = process.env.NODE_ENV === 'production' ? firebaseConfig : devConfig;

// This log will appear in the browser's developer console or server logs.
console.log(`[Firebase] Initializing with project ID: ${configToUse.projectId}`);


// Singleton pattern to ensure a single instance of Firebase services
function getFirebaseServices() {
  const app = !getApps().length ? initializeApp(configToUse) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  // Enable offline persistence if on the client
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one.
        console.warn('Firestore persistence failed: Multiple tabs open.');
      } else if (err.code == 'unimplemented') {
        // The browser does not support all of the features required
        console.warn('Firestore persistence not available in this browser.');
      }
    });
  }


  return { app, db, auth };
}

// Check if we are on the client-side before initializing
const canInitialize = typeof window !== 'undefined' || process.env.CI;

const { app, db, auth } = canInitialize
  ? getFirebaseServices()
  : { app: null, db: null, auth: null };

export { app, db, auth };
