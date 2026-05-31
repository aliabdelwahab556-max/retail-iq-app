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
  products: [
    { id: "e1", name: "Wireless Headphones", category: "Electronics", price: 60.00, cost: 25.00, stock: 48, emoji: "🎧", sold: 48, sku: "SKU-HEAD-01" },
    { id: "e2", name: "Smart Watch", category: "Electronics", price: 70.00, cost: 30.00, stock: 35, emoji: "⌚", sold: 35, sku: "SKU-WATCH-02" },
    { id: "e3", name: "Bluetooth Speaker", category: "Electronics", price: 50.00, cost: 20.00, stock: 29, emoji: "🔊", sold: 29, sku: "SKU-SPK-03" },
    { id: "e4", name: "Phone Charger", category: "Electronics", price: 35.00, cost: 15.00, stock: 25, emoji: "🔌", sold: 25, sku: "SKU-CHG-04" },
    { id: "e5", name: "USB Cable", category: "Electronics", price: 15.00, cost: 5.00, stock: 20, emoji: "⚡", sold: 20, sku: "SKU-USB-05" },
    { id: "a1", name: "Premium Hoodie", category: "Apparel", price: 80.00, cost: 30.00, stock: 40, emoji: "🧥", sold: 340, sku: "SKU-HD-01" },
    { id: "a2", name: "Leather Boots", category: "Apparel", price: 180.00, cost: 80.00, stock: 8, emoji: "👢", sold: 90, sku: "SKU-BT-02" },
    { id: "a3", name: "Silk Scarf", category: "Apparel", price: 45.00, cost: 15.00, stock: 3, emoji: "🧣", sold: 110, sku: "SKU-SF-03" },
    { id: "j1", name: "Gold Chain", category: "Jewelry", price: 450.00, cost: 200.00, stock: 15, emoji: "⛓️", sold: 30, sku: "SKU-CHAIN-01" },
    { id: "j2", name: "Diamond Ring", category: "Jewelry", price: 2500.00, cost: 1100.00, stock: 4, emoji: "💍", sold: 15, sku: "SKU-RING-02" }
  ],
  orders: [
    { id: "Order #1025", date: "2026-05-29T12:00:00Z", customerName: "Sarah Jenkins", customerEmail: "sarah@example.com", items: [{ id: "e1", qty: 2, price: 60.00, name: "Wireless Headphones" }], total: 120.00, channel: "POS", paymentMethod: "Cash POS Settlement" },
    { id: "Order #1024", date: "2026-05-29T10:14:00Z", customerName: "David Miller", customerEmail: "david@example.com", items: [{ id: "e2", qty: 1, price: 70.00, name: "Smart Watch" }], total: 70.00, channel: "POS", paymentMethod: "Cash POS Settlement" },
    { id: "Purchase #205", date: "2026-05-28T14:22:00Z", customerName: "Elena Rostova", customerEmail: "elena@example.com", items: [{ id: "j1", qty: 1, price: 450.00, name: "Gold Chain" }], total: 450.00, channel: "POS", paymentMethod: "Cash POS Settlement" },
    { id: "Order #1023", date: "2026-05-28T09:30:00Z", customerName: "Walk-In Buyer", customerEmail: "walkin@retailiq.com", items: [{ id: "e1", qty: 1, price: 60.00, name: "Wireless Headphones" }, { id: "e3", qty: 2, price: 50.00, name: "Bluetooth Speaker" }], total: 160.00, channel: "POS", paymentMethod: "Cash POS Settlement" },
    { id: "Order #1022", date: "2026-05-27T16:40:00Z", customerName: "David Miller", customerEmail: "david@example.com", items: [{ id: "e2", qty: 1, price: 70.00, name: "Smart Watch" }], total: 70.00, channel: "POS", paymentMethod: "Cash POS Settlement" }
  ],
  customers: [
    { email: "walkin@retailiq.com", name: "Walk-In Customer", points: 150 },
    { email: "sarah@example.com", name: "Sarah Jenkins", points: 420 },
    { email: "david@example.com", name: "David Miller", points: 280 },
    { email: "elena@example.com", name: "Elena Rostova", points: 690 }
  ],
  shopifyConnected: false,
  firebaseConnected: false,
  firebaseConfig: {
    apiKey: "",
    projectId: ""
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
    trialStart: "2026-05-29T12:00:00Z",
    transactionFeesPaid: 0.00,
    shopifyStoreUrl: "",
    shopifyAccessToken: "",
    stripePublishableKey: "",
    stripeSecretKey: ""
  },
  logs: [
    { timestamp: "2026-05-29T10:00:00Z", task: "Database system initialized successfully.", channel: "System", value: 0 },
    { timestamp: "2026-05-29T11:30:00Z", task: "Ahmed login session established.", channel: "Security", value: 0 }
  ]
};

export function getStoredDB(): RetailDB {
  if (typeof window === "undefined") return DB_INIT;
  try {
    const data = localStorage.getItem("retailiq_db");
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
      return parsed;
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
