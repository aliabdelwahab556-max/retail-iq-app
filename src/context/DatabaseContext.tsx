"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { RetailDB, getStoredDB, saveStoredDB } from "@/lib/db";

interface DatabaseContextType {
  db: RetailDB;
  updateDB: (newDb: RetailDB) => void;
  resetDatabase: () => void;
  syncToFirebase: (newDb: RetailDB) => Promise<void>;
  loginWithGoogle: () => Promise<{ name: string; email: string; success: boolean }>;
  loginWithEmail: (email: string, pass: string, mode: "login" | "signup") => Promise<{ name: string; email: string; success: boolean }>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<RetailDB>(getStoredDB());

  useEffect(() => {
    setDb(getStoredDB());
  }, []);

  const updateDB = (newDb: RetailDB) => {
    setDb(newDb);
    saveStoredDB(newDb);
    
    // Automatically trigger Firebase Firestore background syncing if active
    if (newDb.firebaseConnected && newDb.firebaseConfig.apiKey && newDb.firebaseConfig.projectId) {
      syncToFirebase(newDb).catch(err => {
        console.error("Firebase background auto-sync failed:", err);
      });
    }
  };

  const resetDatabase = () => {
    const { DB_INIT } = require("@/lib/db");
    const resetState = JSON.parse(JSON.stringify(DB_INIT));
    resetState.firebaseConfig = db.firebaseConfig;
    resetState.firebaseConnected = db.firebaseConnected;
    resetState.settings.geminiApiKey = db.settings.geminiApiKey;
    resetState.settings.language = db.settings.language;
    
    setDb(resetState);
    saveStoredDB(resetState);
  };

  const syncToFirebase = async (newDb: RetailDB) => {
    try {
      const { getFirebaseFirestore } = await import("@/lib/firebase");
      const firestore = getFirebaseFirestore(newDb.firebaseConfig);

      if (!firestore) {
        console.warn("Firestore could not be initialized. Check credentials.");
        return;
      }

      const { doc, setDoc } = await import("firebase/firestore");
      
      const storeRef = doc(firestore, "retailiq_stores", newDb.settings.businessName.replace(/\s+/g, "_").toLowerCase());
      await setDoc(storeRef, {
        products: newDb.products,
        orders: newDb.orders,
        customers: newDb.customers,
        settings: {
          businessName: newDb.settings.businessName,
          currency: newDb.settings.currency,
          taxRate: newDb.settings.taxRate,
          managerName: newDb.settings.managerName,
          activePlan: newDb.settings.activePlan,
        },
        logsCount: newDb.logs.length,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      console.log("Firebase Firestore production auto-sync completed successfully!");
    } catch (e) {
      console.error("Firebase Firestore sync driver exception:", e);
      throw e;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { getFirebaseAuth } = await import("@/lib/firebase");
      // Use custom credentials if configured, otherwise falls back to environment variables
      const auth = getFirebaseAuth(db.firebaseConfig.apiKey ? db.firebaseConfig : undefined);
      if (auth) {
        const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        return {
          name: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email || "",
          success: true
        };
      }
    } catch (err) {
      console.error("Firebase Google Auth failed:", err);
      throw err;
    }
    throw new Error("Firebase Auth could not be initialized. Please verify your settings or Environment Variables.");
  };

  const loginWithEmail = async (email: string, pass: string, mode: "login" | "signup") => {
    try {
      const { getFirebaseAuth } = await import("@/lib/firebase");
      const auth = getFirebaseAuth(db.firebaseConfig.apiKey ? db.firebaseConfig : undefined);
      if (auth) {
        const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");
        let userCredential;
        if (mode === "login") {
          userCredential = await signInWithEmailAndPassword(auth, email, pass);
        } else {
          userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        }
        const user = userCredential.user;
        return {
          name: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email || "",
          success: true
        };
      }
    } catch (err) {
      console.error("Firebase Email Auth failed:", err);
      throw err;
    }
    throw new Error("Firebase Auth could not be initialized. Please verify your settings or Environment Variables.");
  };

  return (
    <DatabaseContext.Provider value={{ db, updateDB, resetDatabase, syncToFirebase, loginWithGoogle, loginWithEmail }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
