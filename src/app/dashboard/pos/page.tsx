"use client";

import React, { useState, useEffect } from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, ShieldCheck, X, FileText, Search, CreditCard } from "lucide-react";
import { Order, Product } from "@/lib/db";

interface CartItem {
  id: string;
  qty: number;
  price: number;
  name: string;
  emoji: string;
}

export default function POSPage() {
  const { db, updateDB } = useDatabase();
  const { t, isRtl } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string>("walkin@retailiq.com");
  const [selectedPayment, setSelectedPayment] = useState<string>("cash");
  
  // Checkout & Receipt States
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [receiptLoyaltyEarned, setReceiptLoyaltyEarned] = useState<number>(0);
  const [receiptLoyaltyNewBalance, setReceiptLoyaltyNewBalance] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stripe Payment States
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/29");
  const [cardCvc, setCardCvc] = useState("123");

  const cSymbol = db.settings.currency;

  const categories = [
    { id: "all", labelKey: "invCatFilterAll" },
    { id: "Electronics", labelKey: "electronics" },
    { id: "Apparel", labelKey: "apparel" },
    { id: "Jewelry", labelKey: "jewelry" },
  ];

  // Filter products by search and category
  const filteredProducts = db.products.filter(p => {
    const matchesCategory = activeCategory === "all" || p.category === matchesCategoryFilter(activeCategory);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function matchesCategoryFilter(filter: string) {
    if (filter === "Electronics") return "Electronics";
    if (filter === "Apparel") return "Apparel";
    if (filter === "Jewelry") return "Jewelry";
    return filter;
  }

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Halted: Only ${product.stock} units are currently available in the warehouse.`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: product.id, qty: 1, price: product.price, name: product.name, emoji: product.emoji }];
    });
  };

  const updateCartQty = (id: string, diff: number) => {
    const prod = db.products.find(p => p.id === id);
    if (!prod) return;

    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.qty + diff;
        if (nextQty <= 0) return null;
        if (nextQty > prod.stock) {
          alert(`Halted: Only ${prod.stock} units are currently available in the warehouse.`);
          return item;
        }
        return { ...item, qty: nextQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const deleteFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckoutTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (selectedPayment === "stripe") {
      if (!db.settings.stripeSecretKey) {
        alert(isRtl 
          ? "تنبيه: مفتاح Stripe Secret Key غير مضبوط في الإعدادات. يرجى إدخاله لتفعيل الدفع الحقيقي، أو سنقوم بعمل محاكاة تشغيلية للدفع الآن."
          : "Stripe Secret Key is not configured in settings. Configure it to process live production payments.");
      }
      setShowStripeModal(true);
    } else {
      finalizeOrderCheckout();
    }
  };

  const handleStripePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStripeProcessing(true);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const taxRate = db.settings.taxRate / 100;
    const tax = subtotal * taxRate;
    const grandTotal = subtotal + tax;

    try {
      if (db.settings.stripeSecretKey) {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: grandTotal,
            currency: "usd",
            stripeSecretKey: db.settings.stripeSecretKey
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Stripe PaymentIntent request failed.");
        }
      }

      setTimeout(() => {
        setStripeProcessing(false);
        setShowStripeModal(false);
        finalizeOrderCheckout();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      alert(isRtl 
        ? `فشلت تسوية بوابة الدفع Stripe: ${err.message || err}` 
        : `Stripe settlement transaction failed: ${err.message || err}`);
      setStripeProcessing(false);
    }
  };

  const finalizeOrderCheckout = () => {
    const customer = db.customers.find(c => c.email === selectedCustomerEmail);
    if (!customer) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const taxRate = db.settings.taxRate / 100;
    const tax = subtotal * taxRate;
    const grandTotal = subtotal + tax;

    const nextId = db.orders.length + 1001;
    const invoiceId = `RIQ-${nextId}`;

    // 1. Decrease Stock and Increase sold count in Database State
    const updatedProducts = db.products.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - cartItem.qty),
          sold: p.sold + cartItem.qty
        };
      }
      return p;
    });

    // 2. Set translated payment string
    const payMethodTextMap: Record<string, string> = {
      cash: isRtl ? 'تسوية نقدية فورية' : 'Cash POS Settlement',
      layaway: isRtl ? 'أقساط مجدولة (Layaway)' : 'Layaway Plan (Installments)',
      split: isRtl ? 'دفع مجزأ' : 'Split Payment Mode',
      stripe: isRtl ? 'بطاقة الائتمان (Stripe Gateway)' : 'Credit Card (Stripe Gateway)'
    };

    // 3. Create the order
    const newOrder: Order = {
      id: invoiceId,
      date: new Date().toISOString(),
      customerName: customer.name,
      customerEmail: customer.email,
      items: cart.map(item => ({ id: item.id, qty: item.qty, price: item.price, name: item.name })),
      total: grandTotal,
      channel: "POS",
      paymentMethod: payMethodTextMap[selectedPayment] || 'Cash POS Settlement'
    };

    // 4. Update customer loyalty points
    const pointsEarned = Math.floor(grandTotal / 10);
    const updatedCustomers = db.customers.map(c => {
      if (c.email === customer.email) {
        return {
          ...c,
          points: (c.points || 0) + pointsEarned
        };
      }
      return c;
    });

    // 5. Append system logs
    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: `POS Ticket ${invoiceId} settled via ${payMethodTextMap[selectedPayment]}. Billed ${customer.name}.`,
        channel: "POS",
        value: grandTotal
      },
      ...db.logs
    ];

    // 6. Update database context
    const updatedDB = {
      ...db,
      products: updatedProducts,
      orders: [newOrder, ...db.orders],
      customers: updatedCustomers,
      logs: newLogs
    };

    updateDB(updatedDB);

    // Save values for receipt rendering
    setReceiptOrder(newOrder);
    setReceiptLoyaltyEarned(pointsEarned);
    const postCust = updatedCustomers.find(c => c.email === customer.email);
    setReceiptLoyaltyNewBalance(postCust ? postCust.points : 0);

    // Reset local Cart UI
    setCart([]);
  };

  const triggerReceiptPrint = () => {
    window.print();
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const taxAmount = subtotal * (db.settings.taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  return (
    <div className="flex flex-col xl:flex-row gap-8 text-slate-800">
      {/* 0. PRINT CSS SHEET OVERRIDES (Thermal receipt layout printer) */}
      <style jsx global>{`
        @media print {
          /* Hide all UI elements */
          body * {
            visibility: hidden !important;
          }
          /* Only make the print receipt area and its descendants visible */
          .fixed-overlay-print, #thermal-print-area, #thermal-print-area * {
            visibility: visible !important;
          }
          /* Hide close buttons and operational action buttons specifically */
          .no-print, header, footer, nav, aside, .sidebar, .navbar, button, .modal-header {
            display: none !important;
            visibility: hidden !important;
          }
          /* Position the print container perfectly at the top of the printed stream */
          .fixed-overlay-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            box-shadow: none !important;
            border: none !important;
          }
          #thermal-print-area {
            position: absolute !important;
            left: 50% !important;
            top: 0 !important;
            transform: translateX(-50%) !important;
            width: 80mm !important;
            padding: 6mm !important;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
      
      {/* 1. LEFT COLUMN: CATALOG GRID */}
      <div className="flex-1 flex flex-col gap-6 no-print">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight text-start">
            {t("menuPos")}
          </h2>

          {/* Search bar inside POS */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("invSearchPlaceholder")}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold outline-none hover:border-slate-300 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${activeCategory === c.id ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {t(c.labelKey as any)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {db.products.length === 0 ? (
            <div className="col-span-3 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-semibold">
              {isRtl ? "مخزن المتجر فارغ حالياً. أضف سلعاً في إدارة المخزن لتظهر هنا." : "Warehouse catalog empty. Add products in Inventory to start POS checkouts."}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-3 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-semibold">
              No matching products found.
            </div>
          ) : (
            filteredProducts.map(p => {
              const outOfStock = p.stock <= 0;
              return (
                <div
                  key={p.id}
                  onClick={() => !outOfStock && addToCart(p)}
                  className={`bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm cursor-pointer hover:border-blue-500/80 hover:shadow-md select-none transition-all relative ${outOfStock ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {outOfStock && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full z-10">
                      {t("outStockLabel")}
                    </span>
                  )}
                  
                  <span className="text-3xl mb-4 self-start bg-slate-50 border border-slate-100 w-12 h-12 rounded-xl flex items-center justify-center">
                    {p.emoji || "📦"}
                  </span>

                  <div className="text-start">
                    <div className="font-extrabold text-slate-900 text-xs truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{p.sku}</div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                    <span className="font-black text-slate-800 text-sm">{cSymbol}{p.price.toFixed(2)}</span>
                    <span className={`text-[9px] font-bold ${p.stock <= 9 ? "text-red-500" : "text-slate-400"}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT COLUMN: SHOPPING CART */}
      <div className="w-full xl:w-96 no-print">
        <form onSubmit={handleCheckoutTrigger} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 sticky top-24">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Shopping Cart</h3>
            <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-[10px] font-black ml-auto">
              {cart.reduce((sum, item) => sum + item.qty, 0)} items
            </span>
          </div>

          {/* Cart items list */}
          <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center text-slate-400 py-12 text-xs font-semibold">
                Your cart is empty. Click catalog items to sell.
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="border border-slate-100 bg-slate-50/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-start w-32">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-bold text-slate-800 text-xs truncate leading-none block">{item.name}</span>
                  </div>
                  
                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg p-0.5">
                    <button type="button" onClick={() => updateCartQty(item.id, -1)} className="p-1 hover:bg-slate-100 rounded cursor-pointer text-slate-500"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-black text-slate-800 w-4 text-center">{item.qty}</span>
                    <button type="button" onClick={() => updateCartQty(item.id, 1)} className="p-1 hover:bg-slate-100 rounded cursor-pointer text-slate-500"><Plus className="w-3 h-3" /></button>
                  </div>

                  <span className="font-black text-slate-800 text-xs w-16 text-end">
                    {cSymbol}{(item.price * item.qty).toFixed(2)}
                  </span>
                  
                  <button type="button" onClick={() => deleteFromCart(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col gap-4 text-start">
            {/* Customer selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t("selectCustomer")}
              </label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
                value={selectedCustomerEmail}
                onChange={(e) => setSelectedCustomerEmail(e.target.value)}
              >
                {db.customers.map(c => (
                  <option key={c.email} value={c.email}>{c.name} ({c.points} pts)</option>
                ))}
              </select>
            </div>

            {/* Payment method selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t("payMethod")}
              </label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
              >
                <option value="cash">{t("cashPOS")}</option>
                <option value="layaway">{t("layawayOpt")}</option>
                <option value="split">{t("splitOpt")}</option>
                <option value="stripe">{isRtl ? "بطاقة الائتمان (Stripe)" : "Stripe Payment Gateway"}</option>
              </select>
            </div>

            {/* Price Calculations */}
            <div className="flex flex-col gap-2 font-semibold text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>{t("posSubtotal")}</span>
                <span className="font-extrabold text-slate-700">{cSymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("posTax")} ({db.settings.taxRate}%)</span>
                <span className="font-extrabold text-slate-700">{cSymbol}{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-black text-sm text-slate-900">
                <span>{t("posTotal")}</span>
                <span className="text-blue-600">{cSymbol}{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={cart.length === 0}
            className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all text-xs cursor-pointer ${cart.length === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10"}`}
          >
            {t("posCheckout")}
          </button>
        </form>
      </div>

      {/* 3. STRIPE SECURE CREDIT CARD OVERLAY (no-print) */}
      <AnimatePresence>
        {showStripeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 no-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Stripe Secure Credit Card checkout</span>
                </h3>
                <button onClick={() => setShowStripeModal(false)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <form onSubmit={handleStripePaymentSubmit} className="flex flex-col gap-4 text-start">
                <div className="border border-blue-100 bg-blue-50/20 rounded-xl p-4 text-xs font-bold text-blue-800 flex justify-between">
                  <span>Grand Total to charge card:</span>
                  <span className="text-md font-black">{cSymbol}{grandTotal.toFixed(2)}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Credit Card Number
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStripeModal(false)}
                    className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer"
                  >
                    Cancel Payment
                  </button>
                  <button
                    type="submit"
                    disabled={stripeProcessing}
                    className={`text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-2.5 cursor-pointer shadow-md shadow-blue-500/10 ${stripeProcessing ? "bg-slate-300 cursor-not-allowed" : ""}`}
                  >
                    {stripeProcessing ? (isRtl ? "جاري المعالجة..." : "Processing...") : (isRtl ? "تأكيد الدفع" : "Submit Payment Intent")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. RECEIPT OVERLAY MODAL (Print Thermal Receipt) */}
      <AnimatePresence>
        {receiptOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 fixed-overlay-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6 no-print">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>{t("receiptTitle")}</span>
                </h3>
                <button onClick={() => setReceiptOrder(null)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              {/* Receipt Body Area configured for standard 58mm/80mm POS Thermal printers */}
              <div 
                id="thermal-print-area" 
                className="flex flex-col gap-4 text-xs font-semibold text-slate-500 border border-slate-200/80 rounded-2xl p-6 bg-slate-50/50 text-start shadow-inner"
              >
                <div className="text-center pb-3 border-b border-slate-200 border-dashed">
                  <h4 className="font-black text-slate-800 text-md uppercase">{db.settings.businessName}</h4>
                  <span className="text-[9px] uppercase font-bold text-slate-400 mt-1 block">*** {t("invoiceLabel")} ***</span>
                </div>

                <div className="flex flex-col gap-1 pb-3 border-b border-slate-200 border-dashed text-[10px]">
                  <div className="flex justify-between">
                    <span>Ticket ID:</span>
                    <span className="font-bold text-slate-700">{receiptOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-bold text-slate-700">{mounted ? new Date(receiptOrder.date).toLocaleString(db.settings.language === "ar" ? "ar-EG" : "en-US") : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Billed:</span>
                    <span className="font-bold text-slate-700">{receiptOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-bold text-slate-700">{receiptOrder.paymentMethod}</span>
                  </div>
                </div>

                {/* Items rows */}
                <div className="flex flex-col gap-2 py-2">
                  {receiptOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-[10px]">
                      <span className="w-44 truncate">{item.name} (x{item.qty})</span>
                      <span className="font-bold text-slate-700">{cSymbol}{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-slate-200 border-dashed pt-3 flex flex-col gap-2">
                  <div className="flex justify-between text-[10px]">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-700">{cSymbol}{(receiptOrder.total / (1 + db.settings.taxRate/100)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Taxes ({db.settings.taxRate}%):</span>
                    <span className="font-bold text-slate-700">{cSymbol}{(receiptOrder.total - (receiptOrder.total / (1 + db.settings.taxRate/100))).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 border-dashed pt-2">
                    <span>Grand Total:</span>
                    <span>{cSymbol}{receiptOrder.total.toFixed(2)}</span>
                  </div>

                  {/* Installments deposit breakdown if layaway */}
                  {receiptOrder.paymentMethod.includes("Installments") && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col gap-1.5 mt-2 text-blue-800 text-[10px]">
                      <div className="flex justify-between font-bold">
                        <span>{t("layawayDeposit")} (25%):</span>
                        <span>{cSymbol}{(receiptOrder.total * 0.25).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-100 pt-1.5 font-bold">
                        <span>{t("remainingBalance")}:</span>
                        <span>{cSymbol}{(receiptOrder.total * 0.75).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Loyalty point notification */}
                <div className="border-t border-slate-200 border-dashed pt-3 flex flex-col gap-1 text-[10px] text-emerald-700 font-bold text-center">
                  <div>🎉 {t("loyaltyEarned")}: +{receiptLoyaltyEarned} pts</div>
                  <div>New Loyalty Balance: {receiptLoyaltyNewBalance} pts</div>
                </div>

                <div className="text-center pt-3 border-t border-slate-200 border-dashed text-[9px]">
                  <p>{t("invoiceThankyou")}</p>
                  <p className="text-slate-400 mt-0.5">{t("invoiceSystemText")}</p>
                </div>
              </div>

              {/* Receipt Modal actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 mt-6 pt-4 no-print">
                <button
                  onClick={triggerReceiptPrint}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4 py-2.5 cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span>🖨️</span>
                  <span>{isRtl ? "طباعة الفاتورة" : "Print Ticket"}</span>
                </button>
                <button
                  onClick={() => setReceiptOrder(null)}
                  className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer shadow-sm"
                >
                  {t("closeReceiptBtn")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
