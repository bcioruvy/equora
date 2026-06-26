// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use an existing one) called "Equora".
// 3. In Project Settings > General > Your apps, add a Web App.
// 4. Copy the config object Firebase gives you and paste the
//    values below, replacing every "REPLACE_WITH_..." placeholder.
// 5. In the Firebase console, enable:
//      - Authentication > Sign-in method > Email/Password
//      - Authentication > Sign-in method > Google
//      - Firestore Database (start in production mode)
// 6. Deploy the security rules in /firestore.rules (see README).
//
// NEVER commit your real API keys to a public repository.
// Use a .env file (see .env.example) and reference them via
// import.meta.env.VITE_FIREBASE_* instead if this repo is public.
// ============================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'REPLACE_WITH_YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'REPLACE_WITH_YOUR_PROJECT.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'REPLACE_WITH_YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'REPLACE_WITH_YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'REPLACE_WITH_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'REPLACE_WITH_APP_ID',
};

// Prevents "Firebase App named '[DEFAULT]' already exists" during hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
