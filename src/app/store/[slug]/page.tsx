"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, X, CheckCircle, ArrowLeft, Loader2, Sparkles, CreditCard, DollarSign } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  emoji: string;
  sold: number;
  imageUrl?: string;
}

export default function StorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [currency, setCurrency] = useState("$");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Shopping Cart State
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"shopping" | "billing" | "success">("shopping");
  
  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card Online Payment");
  const [completedOrderId, setCompletedOrderId] = useState("");

  // Load Store Data from Firestore or LocalStorage Fallback
  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true);
        // Attempt real Firestore fetch
        const { getFirebaseFirestore } = await import("@/lib/firebase");
        // Using undefined config so it falls back to process.env keys
        const dbFirestore = getFirebaseFirestore();
        
        if (dbFirestore) {
          const { doc, getDoc } = await import("firebase/firestore");
          const storeDocRef = doc(dbFirestore, "retailiq_stores", slug);
          const docSnap = await getDoc(storeDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setStoreName(data.settings?.businessName || slug.replace(/-/g, " "));
            setProducts(data.products || []);
            setCurrency(data.settings?.currency || "$");
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Firestore storefront load failed, using localStorage fallback:", err);
      }

      // LocalStorage Demo Fallback
      const localDBRaw = localStorage.getItem("retailiq_db");
      if (localDBRaw) {
        const localDB = JSON.parse(localDBRaw);
        if (localDB.settings && localDB.settings.storeSlug === slug) {
          setStoreName(localDB.settings.storeName || localDB.settings.businessName);
          setProducts(localDB.products || []);
          setCurrency(localDB.settings.currency || "$");
          setLoading(false);
          return;
        }
      }

      // Global absolute fallback if nothing matches
      setStoreName(slug.replace(/-/g, " ").toUpperCase());
      setProducts([
        { id: "e1", name: "Wireless Headphones", category: "Electronics", price: 60.00, cost: 25.00, stock: 48, emoji: "🎧", sold: 48 },
        { id: "a1", name: "Premium Hoodie", category: "Apparel", price: 80.00, cost: 30.00, stock: 40, emoji: "🧥", sold: 340 },
        { id: "j1", name: "Gold Chain", category: "Jewelry", price: 450.00, cost: 200.00, stock: 15, emoji: "⛓️", sold: 30 }
      ]);
      setLoading(false);
    }
    
    if (slug) {
      loadStore();
    }
  }, [slug]);

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("This item is currently out of stock!");
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Only ${product.stock} units are available in inventory.`);
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            alert(`Only ${item.product.stock} units are available.`);
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean) as { product: Product; qty: number }[];
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const taxRate = 8.5; // default tax rate
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      alert("Please provide your name and email to checkout.");
      return;
    }

    const orderId = `Ord-${Math.floor(100000 + Math.random() * 900000)}`;
    setCompletedOrderId(orderId);

    // Update locally stored DB inventory levels and orders
    const localDBRaw = localStorage.getItem("retailiq_db");
    if (localDBRaw) {
      const localDB = JSON.parse(localDBRaw);
      
      // Deduct stock levels and add transaction
      const updatedProducts = localDB.products.map((p: Product) => {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartItem.qty),
            sold: p.sold + cartItem.qty
          };
        }
        return p;
      });

      const newOrder = {
        id: orderId,
        date: new Date().toISOString(), // client local time
        customerName,
        customerEmail,
        items: cart.map(item => ({ id: item.product.id, qty: item.qty, price: item.product.price })),
        total,
        channel: "Shopify Link", // treated as online synced channel
        paymentMethod
      };

      const newLogs = [
        {
          timestamp: new Date().toISOString(),
          task: `Online store sale completed for ${customerName} (${orderId}) yielding ${currency}${total.toFixed(2)}.`,
          channel: "Sales",
          value: total
        },
        ...localDB.logs
      ];

      const updatedDB = {
        ...localDB,
        products: updatedProducts,
        orders: [newOrder, ...localDB.orders],
        logs: newLogs
      };

      localStorage.setItem("retailiq_db", JSON.stringify(updatedDB));

      // Attempt syncing to cloud if settings allow
      try {
        const { getFirebaseFirestore } = await import("@/lib/firebase");
        const dbFirestore = getFirebaseFirestore();
        if (dbFirestore && updatedDB.firebaseConnected) {
          const { doc, setDoc } = await import("firebase/firestore");
          const storeRef = doc(dbFirestore, "retailiq_stores", slug);
          await setDoc(storeRef, {
            products: updatedDB.products,
            orders: updatedDB.orders,
            lastUpdated: new Date().toISOString()
          }, { merge: true });
        }
      } catch (err) {
        console.error("Online storefront cloud sync failed:", err);
      }
    }

    setCart([]);
    setCheckoutStep("success");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="font-extrabold text-xs text-slate-500 uppercase tracking-widest">Loading Storefront...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 text-slate-500 hover:text-slate-800" />
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Dashboard</span>
        </div>
        
        <h1 className="font-black text-slate-800 text-lg tracking-tight flex items-center gap-2">
          <span>🛍️</span>
          <span>{storeName}</span>
        </h1>

        <button 
          onClick={() => setCartOpen(true)}
          className="relative p-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all cursor-pointer shadow-inner border border-blue-100 flex items-center justify-center"
        >
          <ShoppingCart className="w-4 h-4" />
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-[9px] font-black flex items-center justify-center border-2 border-white shadow-md">
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Main Grid Catalog */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-6 text-start">
        {/* Banner Section */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-8 md:p-12 shadow-xl shadow-blue-500/10 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
            <ShoppingCart className="w-96 h-96" />
          </div>
          <span className="bg-white/20 text-white border border-white/10 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase self-start tracking-wider">
            Online Catalog
          </span>
          <h2 className="text-3xl font-black tracking-tight mt-2">{storeName}</h2>
          <p className="text-xs text-white/80 font-medium max-w-sm leading-relaxed">
            Welcome to our storefront! Browse our premium inventory, add items to your cart, and place orders directly.
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all uppercase ${selectedCategory === cat ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {cat === "all" ? "All Products" : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-semibold">
              No products found in this store.
            </div>
          ) : (
            filteredProducts.map(p => {
              const isOut = p.stock <= 0;
              return (
                <motion.div
                  key={p.id}
                  layout
                  className="bg-white border border-slate-200 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="w-full h-40 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-5xl overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} />
                    ) : (
                      p.emoji || "📦"
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-start">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{p.category}</span>
                    <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{p.name}</h3>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                    <span className="font-black text-blue-600 text-lg">{currency}{p.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={isOut}
                      className={`text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl transition-all cursor-pointer ${isOut ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10"}`}
                    >
                      {isOut ? "Sold Out" : "Add to Cart"}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* Cart and Checkout Sidebar Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
            {/* Drawer Overlay backdrop closer */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setCartOpen(false)}></div>
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-md tracking-tight flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span>Cart items</span>
                </h3>
                <button onClick={() => { setCartOpen(false); setCheckoutStep("shopping"); }} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Checkout Step switcher */}
              {checkoutStep === "shopping" && (
                <>
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 text-start">
                    {cart.length === 0 ? (
                      <div className="my-auto text-center text-slate-400 font-semibold flex flex-col items-center gap-3">
                        <span className="text-4xl">🛒</span>
                        <span>Your shopping cart is empty.</span>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.product.id} className="flex gap-4 border-b border-slate-100 pb-4 items-center">
                          <span className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                            {item.product.emoji || "📦"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-xs truncate leading-snug">{item.product.name}</h4>
                            <span className="font-bold text-blue-600 text-xs mt-1 block">{currency}{item.product.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-inner shrink-0">
                            <button onClick={() => updateCartQty(item.product.id, -1)} className="px-2.5 py-1 text-slate-500 hover:bg-slate-200 cursor-pointer font-bold">-</button>
                            <span className="px-2 text-xs font-black text-slate-700">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.product.id, 1)} className="px-2.5 py-1 text-slate-500 hover:bg-slate-200 cursor-pointer font-bold">+</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col gap-4 text-start shrink-0">
                      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Subtotal</span>
                          <span>{currency}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Sales Tax (8.5%)</span>
                          <span>{currency}{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-800 pt-1">
                          <span>Total</span>
                          <span>{currency}{total.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setCheckoutStep("billing")}
                        className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <span>Proceed to Billing</span>
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {checkoutStep === "billing" && (
                <form onSubmit={handleCheckout} className="flex-1 flex flex-col justify-between overflow-y-auto">
                  <div className="p-6 flex flex-col gap-5 text-start">
                    <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Billing & Shipping</span>
                    </span>

                    {/* Customer Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-xl py-3 px-3.5 text-xs font-semibold text-slate-700 transition-all shadow-inner"
                        placeholder="Sarah Jenkins"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>

                    {/* Customer Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-xl py-3 px-3.5 text-xs font-semibold text-slate-700 transition-all shadow-inner"
                        placeholder="sarah@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                      />
                    </div>

                    {/* Payment Method selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Method</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-xl py-3 px-3.5 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="Card Online Payment">💳 Credit / Debit Card (Online)</option>
                        <option value="Apple Pay Checkout">📱 Apple Pay Mobile Wallet</option>
                        <option value="Cash Settlement (COD)">💵 Cash on Delivery (COD)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col gap-4 text-start shrink-0">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Consolidated Amount Billed:</span>
                      <span className="text-slate-800 text-sm font-black">{currency}{total.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep("shopping")}
                        className="text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-3 cursor-pointer shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Place Order</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {checkoutStep === "success" && (
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🎉</div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight">Order Placed Successfully!</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs">
                    Thank you for your purchase, <strong>{customerName}</strong>! Your order <strong>{completedOrderId}</strong> has been logged and synced.
                  </p>
                  
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-2 text-start flex flex-col gap-1.5 font-mono text-[10px] text-slate-500">
                    <div className="font-black text-[11px] text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2 mb-1.5 flex items-center justify-between">
                      <span>Order Receipt</span>
                      <span>{paymentMethod.split(" ")[0]}</span>
                    </div>
                    <div>Receipt Number: {completedOrderId}</div>
                    <div>Date: {new Date().toLocaleString()}</div>
                    <div>Billing Name: {customerName}</div>
                    <div className="font-bold text-blue-600 border-t border-slate-200 pt-2 mt-1.5 flex justify-between text-xs">
                      <span>Billed Amount</span>
                      <span>{currency}{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setCartOpen(false); setCheckoutStep("shopping"); }}
                    className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl mt-6 cursor-pointer shadow-md shadow-blue-500/10 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-semibold shrink-0">
        &copy; {new Date().getFullYear()} {storeName}. Powered by RetailIQ Smart Storefront.
      </footer>
    </div>
  );
}
