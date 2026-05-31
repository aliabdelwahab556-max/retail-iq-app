import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export function getFirebaseApp(config: { apiKey: string; projectId: string }) {
  if (!config.apiKey || !config.projectId) {
    return null;
  }

  const firebaseConfig = {
    apiKey: config.apiKey,
    projectId: config.projectId,
    authDomain: `${config.projectId}.firebaseapp.com`,
  };

  try {
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error("Firebase App initialization failed:", error);
    return null;
  }
}

export function getFirebaseAuth(config: { apiKey: string; projectId: string }) {
  const app = getFirebaseApp(config);
  return app ? getAuth(app) : null;
}

export function getFirebaseFirestore(config: { apiKey: string; projectId: string }) {
  const app = getFirebaseApp(config);
  return app ? getFirestore(app) : null;
}
