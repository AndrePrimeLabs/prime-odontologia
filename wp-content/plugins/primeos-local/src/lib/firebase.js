// @ts-nocheck
/**
 * Firebase Client SDK Configuration (Modular v12)
 * Connects to Google Cloud Firestore, Firebase Auth, and Storage for PrimeOS.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuration with multi-layer fallback (VITE_ prefix > standard env > project defaults)
export const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.FIREBASE_API_KEY ||
    "AIzaSyB0KcjeLgFrz6bxSJxVrO94moWFmltK8Kc",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    import.meta.env.FIREBASE_AUTH_DOMAIN ||
    "primeosapp.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    import.meta.env.FIREBASE_DATABASE_URL ||
    "https://primeosapp-default-rtdb.firebaseio.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    import.meta.env.FIREBASE_PROJECT_ID ||
    "primeosapp",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    import.meta.env.FIREBASE_STORAGE_BUCKET ||
    "primeosapp.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    import.meta.env.FIREBASE_MESSAGING_SENDER_ID ||
    "667030236741",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    import.meta.env.FIREBASE_APP_ID ||
    "1:667030236741:web:9085661bc59d7df0d3bd2c",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    import.meta.env.FIREBASE_MEASUREMENT_ID ||
    "G-W0K839BSV6",
};

// Singleton initialization pattern to prevent duplicate app initialization in HMR
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Core Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const isFirebaseConfigured = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export default {
  app,
  db,
  auth,
  storage,
  config: firebaseConfig,
  isConfigured: isFirebaseConfigured,
};
