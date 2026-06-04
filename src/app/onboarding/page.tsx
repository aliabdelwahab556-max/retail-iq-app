"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import { ShoppingBag, CreditCard, Layers, ArrowRight, Store } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();
  const { db, updateDB } = useDatabase();
  
  const [businessType, setBusinessType] = useState<"cashier" | "ecommerce" | "both">("both");
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");

  // Sync slug with name typing
  useEffect(() => {
    if (storeName) {
      const slug = storeName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // replace spaces with dashes
        .replace(/-+/g, "-"); // remove double dashes
      setStoreSlug(slug);
    } else {
      setStoreSlug("");
    }
  }, [storeName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeSlug) {
      alert(isRtl ? "يرجى إدخال اسم المتجر ورابط المتجر." : "Please provide a store name and slug.");
      return;
    }

    // Save configuration parameters to local database settings
    const updatedSettings = {
      ...db.settings,
      businessType,
      storeName,
      storeSlug
    };

    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: `Business onboarding completed: Configured as ${businessType.toUpperCase()} store named "${storeName}".`,
        channel: "System",
        value: 0
      },
      ...db.logs
    ];

    updateDB({
      ...db,
      settings: updatedSettings,
      logs: newLogs
    });

    router.push("/dashboard");
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-6 ${isRtl ? "text-right" : "text-left"}`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-10 flex flex-col gap-8"
      >
        {/* Header Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
              IQ
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800">RetailIQ</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-2">
            {isRtl ? "مرحباً بك! لنهيئ متجرك الذكي" : "Welcome! Let's Configure Your Smart Store"}
          </h2>
          <p className="text-xs text-slate-500 font-semibold max-w-sm leading-relaxed">
            {isRtl 
              ? "اختر طبيعة عملك وسمّ متجرك الإلكتروني للبدء فوراً في إدارته بمساعدة الذكاء الاصطناعي."
              : "Select your store's operational model and name your brand to unlock your custom dashboard workspace."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Step 1: Selection Cards */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              {isRtl ? "1. حدد طبيعة عملك" : "1. Select Your Operating Model"}
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cashier card */}
              <div
                onClick={() => setBusinessType("cashier")}
                className={`border rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all ${
                  businessType === "cashier"
                    ? "border-blue-600 bg-blue-50/30 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${businessType === "cashier" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h4 className="font-bold text-xs">{isRtl ? "نظام كاشير POS" : "Cashier / POS"}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                    {isRtl ? "مبيعات المحل، الفواتير، ونظام الكاشير المباشر." : "In-store POS registers, checkout sessions, and cashiers."}
                  </p>
                </div>
              </div>

              {/* Ecommerce card */}
              <div
                onClick={() => setBusinessType("ecommerce")}
                className={`border rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all ${
                  businessType === "ecommerce"
                    ? "border-blue-600 bg-blue-50/30 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${businessType === "ecommerce" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h4 className="font-bold text-xs">{isRtl ? "متجر إلكتروني" : "E-commerce Store"}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                    {isRtl ? "البيع أونلاين عبر رابط متجرك المخصص ومزامنة الكتالوج." : "Online storefront web pages, digital orders, and web catalogs."}
                  </p>
                </div>
              </div>

              {/* Both card */}
              <div
                onClick={() => setBusinessType("both")}
                className={`border rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all ${
                  businessType === "both"
                    ? "border-blue-600 bg-blue-50/30 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${businessType === "both" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h4 className="font-bold text-xs">{isRtl ? "كلاهما معاً" : "Both (Omnichannel)"}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                    {isRtl ? "تكامل تام بين الكاشير والمبيعات السحابية لمتجرك." : "Coordinate physical retail POS checkouts and online customers."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Store details inputs */}
          <div className="flex flex-col gap-4 bg-slate-50/60 border border-slate-150 rounded-2xl p-5 md:p-6">
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              {isRtl ? "2. تفاصيل المتجر والبراند" : "2. Brand & Store Identity"}
            </label>
            
            <div className="flex flex-col gap-4">
              {/* Store Name input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  {isRtl ? "اسم المتجر / الشركة" : "Store Profile Name"}
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? "مثال: بوتيك الأناقة" : "e.g. Elegance Boutique"}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-800 transition-all shadow-sm"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
              </div>

              {/* Store Slug / URL */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  {isRtl ? "رابط المتجر الفريد (Store URL)" : "Store URL Slug"}
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl px-3 py-3 text-[10px] font-bold text-slate-400 select-none">
                    /store/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="elegance-boutique"
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-r-xl py-3 px-3.5 text-xs font-semibold font-mono text-slate-800 transition-all shadow-sm"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                  {isRtl 
                    ? "هذا الرابط العام الذي ستقوم بفتحه لمشاهدة وشراء المنتجات الخاصة بك."
                    : "This forms the public web address where shoppers browse and checkout your catalog."}
                </p>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 mt-2 transition-all cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>{isRtl ? "تأسيس المتجر والانتقال للوحة التحكم" : "Initialize Store & Open Dashboard"}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
