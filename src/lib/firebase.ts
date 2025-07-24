// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
