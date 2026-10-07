import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

/**
 * ALINDA Booking Firebase configuration.
 *
 * In Firebase App Hosting production builds, Firebase automatically provides
 * the registered Web App configuration to the Firebase JS SDK. We use that
 * automatic configuration in production and keep the explicit config for
 * local development.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA9iXk2LJyb5MqGKObe1l-h0gsEv9D0CuI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "alinda-booking-9e0d8.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "alinda-booking-9e0d8",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "alinda-booking-9e0d8.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "965189997201",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:965189997201:web:ab57002270059ba7a56530"
};

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();

  // App Hosting injects FIREBASE_WEBAPP_CONFIG and the Firebase JS SDK
  // supports no-argument initialization there. This avoids relying on a
  // manually copied API key in the production client bundle.
  if (process.env.NODE_ENV === "production") {
    return initializeApp();
  }

  return initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}
