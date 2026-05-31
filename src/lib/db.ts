export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  emoji: string;
  sold: number;
  sku: string;
}

export interface OrderItem {
  id: string;
  qty: number;
  price: number;
  name: string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  channel: "POS" | "Shopify" | "Internal Store";
  paymentMethod: string;
}

export interface Customer {
  email: string;
  name: string;
  points: number;
}

export interface SystemLog {
  timestamp: string;
  task: string;
  channel: string;
  value: number;
}

export interface FirebaseConfig {
  apiKey: string;
  projectId: string;
  authDomain?: string;
  storageBucket?: string;
}

export interface RetailSettings {
  businessName: string;
  currency: string;
  taxRate: number;
  managerName: string;
  autoSync: boolean;
  syncInterval: string;
  language: "en" | "ar";
  geminiApiKey: string;
  geminiModel: string;
  activePlan: "Starter" | "Growth" | "Pro";
  trialStart: string; // ISO String
  transactionFeesPaid: number;
  shopifyStoreUrl: string;
  shopifyAccessToken: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
}

export interface RetailDB {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  shopifyConnected: boolean;
  firebaseConnected: boolean;
  firebaseConfig: FirebaseConfig;
  settings: RetailSettings;
  logs: SystemLog[];
}

export const DB_INIT: RetailDB = {
  products: [],
  orders: [],
  customers: [
    { email: "walkin@retailiq.com", name: "Walk-In Customer", points: 0 }
  ],
  shopifyConnected: false,
  firebaseConnected: true,
  firebaseConfig: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAs-CENTRAL-RETAILIQ-KEY-FALLBACK-2026",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "retail-iq-central"
  },
  settings: {
    businessName: "RetailIQ Store",
    currency: "$",
    taxRate: 8.5,
    managerName: "Ahmed",
    autoSync: true,
    syncInterval: "15",
    language: "en",
    geminiApiKey: "",
    geminiModel: "gemini-1.5-flash",
    activePlan: "Starter",
    trialStart: "2026-05-31T12:00:00Z",
    transactionFeesPaid: 0.00,
    shopifyStoreUrl: "",
    shopifyAccessToken: "",
    stripePublishableKey: "",
    stripeSecretKey: ""
  },
  logs: [
    { timestamp: "2026-05-31T12:00:00Z", task: "Database system initialized successfully.", channel: "System", value: 0 }
  ]
};

export function getStoredDB(): RetailDB {
  if (typeof window === "undefined") return DB_INIT;
  try {
    const data = localStorage.getItem("retailiq_db");
    const centralConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAs-CENTRAL-RETAILIQ-KEY-FALLBACK-2026",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "retail-iq-central"
    };
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure missing fields are loaded
      if (!parsed.settings.activePlan) parsed.settings.activePlan = "Starter";
      if (!parsed.settings.trialStart) parsed.settings.trialStart = new Date().toISOString();
      if (parsed.settings.transactionFeesPaid === undefined) parsed.settings.transactionFeesPaid = 0;
      if (!parsed.settings.shopifyStoreUrl) parsed.settings.shopifyStoreUrl = "";
      if (!parsed.settings.shopifyAccessToken) parsed.settings.shopifyAccessToken = "";
      if (!parsed.settings.stripePublishableKey) parsed.settings.stripePublishableKey = "";
      if (!parsed.settings.stripeSecretKey) parsed.settings.stripeSecretKey = "";
      
      // Force central Firebase credentials for SaaS mode
      parsed.firebaseConnected = true;
      parsed.firebaseConfig = centralConfig;
      
      return parsed;
    } else {
      const initDB = { ...DB_INIT };
      initDB.firebaseConnected = true;
      initDB.firebaseConfig = centralConfig;
      return initDB;
    }
  } catch (e) {
    console.error("Local DB fetch failed:", e);
  }
  return DB_INIT;
}

export function saveStoredDB(db: RetailDB) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("retailiq_db", JSON.stringify(db));
  } catch (e) {
    console.error("Local DB save failed:", e);
  }
}
