"use client";

import React, { useState } from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Search, Trash2, Edit2, AlertCircle, RefreshCw, X } from "lucide-react";
import { Product } from "@/lib/db";

export default function InventoryPage() {
  const { db, updateDB } = useDatabase();
  const { t, isRtl } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [emoji, setEmoji] = useState("📦");

  const cSymbol = db.settings.currency;

  const categories = ["Electronics", "Apparel", "Jewelry", "Accessories"];

  const filteredProducts = db.products.filter(p => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sku) {
      alert("Please provide a name and SKU code.");
      return;
    }

    setUploading(true);
    let uploadedUrl = "";
    
    // Upload image to Firebase Storage if selected
    if (imageFile) {
      try {
        const { getFirebaseStorage } = await import("@/lib/firebase");
        const storage = getFirebaseStorage(db.firebaseConfig);
        if (storage) {
          const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
          const imgRef = ref(storage, `retailiq_products/${Date.now()}-${imageFile.name}`);
          const uploadResult = await uploadBytes(imgRef, imageFile);
          uploadedUrl = await getDownloadURL(uploadResult.ref);
        }
      } catch (err) {
        console.error("Firebase Storage image upload failed, falling back:", err);
      }
    }

    // Determine final imageUrl
    const imageUrl = uploadedUrl || editingProduct?.imageUrl || "";

    if (editingProduct) {
      // Modify existing product
      const updatedProducts = db.products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name,
            sku,
            category,
            price: Number(price),
            cost: Number(cost),
            stock: Number(stock),
            emoji,
            imageUrl
          };
        }
        return p;
      });

      const newLogs = [
        {
          timestamp: new Date().toISOString(),
          task: `Catalog SKU ${sku} (${name}) updated by manager ${db.settings.managerName}.`,
          channel: "Inventory",
          value: Number(price)
        },
        ...db.logs
      ];

      updateDB({
        ...db,
        products: updatedProducts,
        logs: newLogs
      });
    } else {
      // Create new product
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name,
        sku,
        category,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
        emoji,
        sold: 0,
        imageUrl
      };

      const newLogs = [
        {
          timestamp: new Date().toISOString(),
          task: `New product ${name} (SKU: ${sku}) cataloged at ${cSymbol}${price}.`,
          channel: "Inventory",
          value: Number(price)
        },
        ...db.logs
      ];

      updateDB({
        ...db,
        products: [newProduct, ...db.products],
        logs: newLogs
      });
    }

    // If Firestore active sync is configured, sync the entire store
    try {
      const { getFirebaseFirestore } = await import("@/lib/firebase");
      const dbFirestore = getFirebaseFirestore();
      if (dbFirestore && db.firebaseConnected && db.settings.storeSlug) {
        const { doc, setDoc } = await import("firebase/firestore");
        const storeRef = doc(dbFirestore, "retailiq_stores", db.settings.storeSlug);
        await setDoc(storeRef, {
          products: editingProduct 
            ? db.products.map(p => p.id === editingProduct.id ? { ...p, name, sku, category, price, cost, stock, emoji, imageUrl } : p)
            : [{ id: `p-${Date.now()}`, name, sku, category, price, cost, stock, emoji, sold: 0, imageUrl }, ...db.products],
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.error("Firestore automatic store catalog sync failed:", e);
    }

    setUploading(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setSku("");
    setCategory("Electronics");
    setPrice(0);
    setCost(0);
    setStock(0);
    setEmoji("📦");
    setImageFile(null);
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setCategory(product.category);
    setPrice(product.price);
    setCost(product.cost);
    setStock(product.stock);
    setEmoji(product.emoji || "📦");
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(isRtl ? `هل أنت متأكد من حذف المنتج ${name}؟` : `Are you sure you want to delete ${name}?`)) return;

    const updatedProducts = db.products.filter(p => p.id !== id);
    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: `Product ${name} removed from active database catalog by ${db.settings.managerName || "Manager"}.`,
        channel: "Inventory",
        value: 0
      },
      ...db.logs
    ];

    updateDB({
      ...db,
      products: updatedProducts,
      logs: newLogs
    });
  };

  const autoGenerateSku = () => {
    const prefix = category.substring(0, 3).toUpperCase();
    const random = Math.floor(100 + Math.random() * 900);
    setSku(`SKU-${prefix}-${random}`);
  };

  const marginPercentage = price > 0 ? (((price - cost) / price) * 100).toFixed(0) : "0";

  return (
    <div className="flex flex-col gap-6 text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="text-start">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("menuInventory")}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {isRtl ? "إدارة وتعديل السلع المتوفرة، تكلفة الموردين، تنبيهات النقص وإعادة التخزين." : "Manage catalog entries, purchase unit costs, margins, and low stock alarms."}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>{t("invAddBtn")}</span>
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        {/* Category filtering tab list */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all ${activeCategory === "all" ? "bg-blue-50 text-blue-600 border border-blue-200" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {t("invCatFilterAll")}
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all ${activeCategory === c ? "bg-blue-50 text-blue-600 border border-blue-200" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Catalog Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("invSearchPlaceholder")}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* LIST TABLE OR EMPTY GRID */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="px-6 py-3.5 text-start">{t("productInfo")}</th>
                <th className="px-6 py-3.5 text-start">SKU</th>
                <th className="px-6 py-3.5 text-center">Category</th>
                <th className="px-6 py-3.5 text-end">{t("unitCost")}</th>
                <th className="px-6 py-3.5 text-end">{t("sellingPrice")}</th>
                <th className="px-6 py-3.5 text-center">{t("margin")}</th>
                <th className="px-6 py-3.5 text-center">{t("stockInventory")}</th>
                <th className="px-6 py-3.5 text-center">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No products found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.stock <= 9 && p.stock > 0;
                  const isOut = p.stock === 0;
                  const marginPercent = p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(0) : "0";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <span className="w-8 h-8 bg-slate-100 border border-slate-200/50 rounded-lg flex items-center justify-center text-lg shadow-sm overflow-hidden shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} />
                          ) : (
                            p.emoji || "📦"
                          )}
                        </span>
                        <div className="text-start">
                          <span className="font-extrabold text-slate-800 leading-tight block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{isRtl ? "مباع" : "Sold"}: {p.sold}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-start font-mono font-bold text-slate-600">{p.sku}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-end font-bold text-slate-500">{cSymbol}{p.cost.toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-end font-extrabold text-slate-800">{cSymbol}{p.price.toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold text-[10px]">
                          {marginPercent}%
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-black text-xs ${isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-slate-800"}`}>
                            {p.stock}
                          </span>
                          {isOut ? (
                            <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">{t("outStockLabel")}</span>
                          ) : isLow ? (
                            <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">{t("lowStockLabel")}</span>
                          ) : (
                            <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-100">{t("inStockLabel")}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(p)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg cursor-pointer transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK WARNING INVENTORY ADVISORY */}
      {db.products.filter(p => p.stock <= 9).length > 0 && (
        <div className="border border-amber-100 bg-amber-50/30 rounded-2xl p-5 flex items-start gap-4 text-start">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-slate-800 text-xs">
              {isRtl ? "تنبيه المخزن الناقص والمستشار" : "Low Stock Operational Warning"}
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mt-1">
              {isRtl 
                ? `هناك ${db.products.filter(p => p.stock <= 9).length} سلع شارفت على النفاد تماماً من المخزن الرئيسي. يوصى بمراجعة الموردين وإرسال أوامر الشحن PO للحفاظ على مبيعات نقاط البيع متواصلة.`
                : `There are ${db.products.filter(p => p.stock <= 9).length} catalog entries current under the safety replenishment trigger level (9 items). Reorder from preferred supplier lines.`}
            </p>
          </div>
        </div>
      )}

      {/* 4. MODAL ADD / EDIT FORM OVERLAY */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <h3 className="font-black text-slate-900 text-md tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>{editingProduct ? (isRtl ? "تعديل المنتج الحالي" : "Edit Catalog Entry") : t("invAddBtn")}</span>
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4 text-start">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {isRtl ? "اسم المنتج / السلعة" : "Product Entry Name"}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      placeholder="e.g. Wireless Headset"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* SKU & AutoGen */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                      <span>SKU Code</span>
                      <button
                        type="button"
                        onClick={autoGenerateSku}
                        className="text-[9px] text-blue-600 hover:underline font-extrabold cursor-pointer uppercase"
                      >
                        Auto-Gen
                      </button>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      placeholder="SKU-XXXXXX"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>

                  {/* Category selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Category
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Emoji selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t("emojiLabel")}
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                    >
                      <option value="📦">📦 General Box</option>
                      <option value="🎧">🎧 Electronics Headset</option>
                      <option value="⌚">⌚ Electronics Watch</option>
                      <option value="🔊">🔊 Speaker</option>
                      <option value="🧥">🧥 Clothes Hoodie</option>
                      <option value="👢">👢 Boots</option>
                      <option value="💍">💍 Ring Jewelry</option>
                      <option value="⛓️">⛓️ Chain Gold</option>
                      <option value="💻">💻 Computer Laptop</option>
                      <option value="📱">📱 Mobile Phone</option>
                    </select>
                  </div>

                  {/* Initial Stock Qty */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t("initialStock")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                    />
                  </div>

                  {/* Cost price */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t("unitCost")} ({cSymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      value={cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                    />
                  </div>

                  {/* Selling price */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t("sellingPrice")} ({cSymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  </div>

                  {/* Image file uploader */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {isRtl ? "صورة المنتج (اختياري - Firebase Storage)" : "Product Image (Optional - Firebase Storage)"}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Real-time calculated margins details */}
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-3 flex items-center justify-between mt-2">
                  <div className="text-[10px] font-bold text-slate-500">
                    {isRtl ? "هامش الأرباح المحتسب فورياً:" : "Calculated Net Gross Profit Margin:"}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold text-[11px]">
                    {marginPercentage}% Profit Margin
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 mt-6 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={uploading}
                    className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {t("discardFormBtn")}
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2.5 cursor-pointer shadow-md shadow-blue-500/10 transition-all disabled:opacity-50"
                  >
                    {uploading ? (isRtl ? "جاري الحفظ والرفع..." : "Saving & Uploading...") : (isRtl ? "تأكيد وتثبيت" : "Confirm & Save Entry")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
