import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export function getFirebaseApp(config?: { apiKey: string; projectId: string }) {
  const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = config?.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    return null;
  }

  const firebaseConfig = {
    apiKey,
    projectId,
    authDomain: `${projectId}.firebaseapp.com`,
  };

  try {
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error("Firebase App initialization failed:", error);
    return null;
  }
}

export function getFirebaseAuth(config?: { apiKey: string; projectId: string }) {
  const app = getFirebaseApp(config);
  return app ? getAuth(app) : null;
}

export function getFirebaseFirestore(config?: { apiKey: string; projectId: string }) {
  const app = getFirebaseApp(config);
  return app ? getFirestore(app) : null;
}
