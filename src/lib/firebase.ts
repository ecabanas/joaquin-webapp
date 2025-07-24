// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "joaquin-q0wvv",
  "appId": "1:371246421587:web:f6e518edfb2e6c509418a6",
  "storageBucket": "joaquin-q0wvv.firebasestorage.app",
  "apiKey": "AIzaSyBrlpoPUpIp03EpVB9lamNFgx5UYLtUOWo",
  "authDomain": "joaquin-q0wvv.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "371246421587"
};

// Initialize Firebase App only if it's not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
