import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// TODO: Replace with your actual Firebase config
// In Vite, use import.meta.env instead of process.env
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || "your-api-key",
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || "your-project.firebaseapp.com",
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || "your-project-id",
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || "your-project.appspot.com",
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || "123456789",
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
