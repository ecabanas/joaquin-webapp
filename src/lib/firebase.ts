
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

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
console.log(`[Firebase] Using project ID: ${configToUse.projectId}`);

type FirebaseServices = {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
}

let services: FirebaseServices | null = null;

// This function now ensures Firebase is initialized only once.
export function getFirebaseServices(): FirebaseServices {
  if (services) {
    return services;
  }
  
  if (typeof window === 'undefined') {
    // This is a safeguard for server-side rendering during build.
    // It should not be hit in a client-side context.
    throw new Error("Firebase cannot be initialized on the server during build.");
  }
  
  const app = !getApps().length ? initializeApp(configToUse) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open.');
    } else if (err.code == 'unimplemented') {
      console.warn('Firestore persistence not available in this browser.');
    }
  });

  services = { app, db, auth };
  return services;
}
