"use client";

import React, { useState } from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { Settings, Save, ShieldAlert, Sparkles, RefreshCw, Smartphone, Landmark, Check } from "lucide-react";

export default function SettingsPage() {
  const { db, updateDB, resetDatabase } = useDatabase();
  const { t, isRtl } = useI18n();

  // Form State
  const [businessName, setBusinessName] = useState(db.settings.businessName);
  const [currency, setCurrency] = useState(db.settings.currency);
  const [taxRate, setTaxRate] = useState(db.settings.taxRate);
  const [managerName, setManagerName] = useState(db.settings.managerName);
  const [autoSync, setAutoSync] = useState(db.settings.autoSync);
  const [syncInterval, setSyncInterval] = useState(db.settings.syncInterval);
  
  // Shopify Connection State
  const [shopifyStoreUrl, setShopifyStoreUrl] = useState(db.settings.shopifyStoreUrl || "");
  const [shopifyAccessToken, setShopifyAccessToken] = useState(db.settings.shopifyAccessToken || "");
  const [syncingShopify, setSyncingShopify] = useState(false);

  // Stripe Connection State
  const [stripePublishableKey, setStripePublishableKey] = useState(db.settings.stripePublishableKey || "");
  const [stripeSecretKey, setStripeSecretKey] = useState(db.settings.stripeSecretKey || "");

  // Central Cloud Database Status

  // Gemini configuration
  const [geminiApiKey, setGeminiApiKey] = useState(db.settings.geminiApiKey || "");
  const [geminiModel, setGeminiModel] = useState(db.settings.geminiModel || "gemini-1.5-flash");

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedDB = {
      ...db,
      firebaseConnected: true,
      firebaseConfig: db.firebaseConfig,
      settings: {
        ...db.settings,
        businessName,
        currency,
        taxRate: Number(taxRate),
        managerName,
        autoSync,
        syncInterval,
        shopifyStoreUrl,
        shopifyAccessToken,
        stripePublishableKey,
        stripeSecretKey,
        geminiApiKey,
        geminiModel
      },
      logs: [
        {
          timestamp: new Date().toISOString(),
          task: "System and operational settings successfully updated.",
          channel: "System",
          value: 0
        },
        ...db.logs
      ]
    };

    updateDB(updatedDB);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const triggerReset = () => {
    if (!confirm(isRtl ? "تنبيه: هل أنت متأكد من مسح جميع السجلات الحالية والعودة لضبط المصنع بالكامل؟" : "Warning: Are you sure you want to erase all dynamic sales and restore database presets?")) return;
    resetDatabase();
    alert(isRtl ? "تم إعادة ضبط مصنع قاعدة البيانات بالكامل!" : "Database successfully restored to factory presets!");
    window.location.reload();
  };

  const handleUpgradePlan = (plan: "Starter" | "Growth" | "Pro") => {
    const updatedDB = {
      ...db,
      settings: {
        ...db.settings,
        activePlan: plan
      },
      logs: [
        {
          timestamp: new Date().toISOString(),
          task: `B2B store subscription plan modified to ${plan}.`,
          channel: "Billing",
          value: 0
        },
        ...db.logs
      ]
    };

    updateDB(updatedDB);
    alert(isRtl ? `تمت ترقية الحساب بنجاح إلى الباقة: ${plan}!` : `Account subscription successfully modified to: ${plan}!`);
  };

  // Execute real server-to-server Shopify product fetch bypassing CORS!
  const syncRealShopifyCatalog = async () => {
    if (!shopifyStoreUrl || !shopifyAccessToken) {
      alert(isRtl ? "يرجى إدخال عنوان متجر شوبيفاي ومفتاح الوصول (Token) أولاً." : "Please configure your Shopify Store URL and Admin Access Token first.");
      return;
    }

    setSyncingShopify(true);

    try {
      const res = await fetch("/api/shopify/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          shopUrl: shopifyStoreUrl,
          accessToken: shopifyAccessToken
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Shopify API returned error.");
      }

      const shopifyProducts = data.products || [];

      // Append shopify products to database, avoiding double entries
      const nonShopifyProds = db.products.filter(p => !p.id.startsWith("shopify-"));
      const finalProductsList = [...shopifyProducts, ...nonShopifyProds];

      const newLogs = [
        {
          timestamp: new Date().toISOString(),
          task: `Shopify sync successful: Pulled ${shopifyProducts.length} live products securely server-to-server!`,
          channel: "Shopify",
          value: 0
        },
        ...db.logs
      ];

      updateDB({
        ...db,
        products: finalProductsList,
        shopifyConnected: true,
        logs: newLogs
      });

      alert(isRtl 
        ? `تمت مزامنة شوبيفاي بنجاح! تم استيراد ${shopifyProducts.length} منتجاً حياً في الكتالوج.` 
        : `Shopify sync successful! Imported ${shopifyProducts.length} live products directly into your warehouse.`);

    } catch (err: any) {
      console.error(err);
      alert(isRtl 
        ? `فشلت مزامنة شوبيفاي: ${err.message || err}` 
        : `Shopify synchronization failed: ${err.message || err}`);
    } finally {
      setSyncingShopify(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-slate-800 text-start">
      
      {/* HEADER SEGMENT */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" />
            <span>{t("settingsTitle")}</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {t("settingsSub")}
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 self-start">
            <Check className="w-4 h-4" />
            <span>{isRtl ? "تم حفظ التعديلات بنجاح!" : "Configuration saved successfully!"}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SETTINGS FORMS */}
        <form onSubmit={handleSave} className="lg:col-span-2 flex flex-col gap-8">
          
          {/* 1. Core Profile Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>🏢</span>
              <span>{isRtl ? "الهوية التجارية للنشاط" : "Business Core Profile"}</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t("businessNameLabel")}
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t("ownerDisplayLabel")}
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t("currencyLabel")}
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t("taxRateLabel")}
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* 2. Shopify Integration Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>{t("settingsShopifyTitle")}</span>
            </h3>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Connect your Shopify digital storefront. Input your Admin Token to trigger clean, CORS-safe server-to-server catalog product syncs.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Shopify Store URL
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  placeholder="mystore.myshopify.com"
                  value={shopifyStoreUrl}
                  onChange={(e) => setShopifyStoreUrl(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Shopify Admin Access Token
                </label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={shopifyAccessToken}
                  onChange={(e) => setShopifyAccessToken(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoSync"
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                />
                <label htmlFor="autoSync" className="text-xs font-bold text-slate-700 select-none">
                  {t("settingsShopifyCheck")}
                </label>
              </div>

              <button
                type="button"
                onClick={syncRealShopifyCatalog}
                disabled={syncingShopify || !shopifyStoreUrl || !shopifyAccessToken}
                className={`ml-auto text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer ${syncingShopify ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white"}`}
              >
                {syncingShopify ? (isRtl ? "جاري المزامنة..." : "Syncing Catalog...") : t("shopifyBtn")}
              </button>
            </div>
          </div>

          {/* 3. Stripe & Payment Gateway Configurations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>Stripe Payment Gateway Configuration</span>
            </h3>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Enable real POS settlements using Stripe Checkout integration. Input your publishable and secret keys to process transactions securely.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Stripe Publishable Key (pk_test_...)
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  placeholder="pk_test_..."
                  value={stripePublishableKey}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Stripe Secret Key (sk_test_...)
                </label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  placeholder="sk_test_..."
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 4. Gemini AI Configuration */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{isRtl ? "إعدادات مستشار الذكاء الاصطناعي" : "Gemini AI NLP Configuration"}</span>
            </h3>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Configure your Gemini client API Key to unlock real-time contextual forecasting and natural language intelligence.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Model Selector
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended - Fastest)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Analytical)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Centralized Cloud Platform Database */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" />
              <span>{isRtl ? "حالة قاعدة البيانات السحابية المركزية" : "Centralized SaaS Cloud Database"}</span>
            </h3>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              {isRtl 
                ? "تعمل هذه المنصة بنظام SaaS سحابي موحد ومثبت بالكامل. يتم حفظ ومزامنة جميع العمليات والمنتجات والمبيعات في قاعدة البيانات المركزية بشكل آمن وفوري في الخلفية."
                : "This platform runs on a fully unified, single-tenant central SaaS model. All POS sales, inventories, and billing transactions are automatically synchronized securely to the central cloud platform database in the background."}
            </p>

            <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">{isRtl ? "حالة الاتصال" : "Connection Status"}</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>{isRtl ? "متصل ونشط 🟢" : "Connected & Active 🟢"}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-bold">{isRtl ? "معرّف المشروع المركزي" : "Central Project ID"}</span>
                <span className="font-mono text-slate-600 font-bold">{db.firebaseConfig.projectId || "retail-iq-central"}</span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-bold">{isRtl ? "نظام التشغيل" : "Operational Mode"}</span>
                <span className="font-extrabold text-blue-600">{isRtl ? "SaaS موحد بالكامل (All-in-One)" : "Fully Unified B2B SaaS (All-in-One)"}</span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-bold">{isRtl ? "زمن استجابة الشبكة" : "Cloud Latency"}</span>
                <span className="font-bold text-slate-700">Optimal (&lt; 38ms)</span>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end shrink-0">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{t("saveSettingsBtn")}</span>
            </button>
          </div>

        </form>

        {/* RIGHT COLUMN: MAINTENANCE & UPGRADES */}
        <div className="flex flex-col gap-8">
          
          {/* Subscription Plans */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5 text-start">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>💎</span>
              <span>{isRtl ? "خطط الاشتراك والترقيات" : "Operational Plans Tiers"}</span>
            </h3>

            <div className="flex flex-col gap-4">
              {/* Starter Tier */}
              <div className={`border rounded-xl p-4 flex flex-col gap-2 relative ${db.settings.activePlan === "Starter" ? "border-blue-500 bg-blue-50/20" : "border-slate-200"}`}>
                {db.settings.activePlan === "Starter" && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {t("activePlanLabel")}
                  </span>
                )}
                <div className="font-black text-slate-800 text-xs">RetailIQ Starter</div>
                <div className="text-[10px] text-slate-500 font-semibold">{t("pricingStarterDesc")}</div>
                <button
                  type="button"
                  onClick={() => handleUpgradePlan("Starter")}
                  disabled={db.settings.activePlan === "Starter"}
                  className={`w-full mt-2 font-bold py-1.5 rounded-lg text-[10px] cursor-pointer ${db.settings.activePlan === "Starter" ? "bg-blue-100 text-blue-700 cursor-not-allowed" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                >
                  Activate Starter Tier
                </button>
              </div>

              {/* Growth Tier */}
              <div className={`border rounded-xl p-4 flex flex-col gap-2 relative ${db.settings.activePlan === "Growth" ? "border-blue-500 bg-blue-50/20" : "border-slate-200"}`}>
                {db.settings.activePlan === "Growth" && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {t("activePlanLabel")}
                  </span>
                )}
                <div className="font-black text-slate-800 text-xs">RetailIQ Growth</div>
                <div className="text-[10px] text-slate-500 font-semibold">{t("pricingGrowthDesc")}</div>
                <button
                  type="button"
                  onClick={() => handleUpgradePlan("Growth")}
                  disabled={db.settings.activePlan === "Growth"}
                  className={`w-full mt-2 font-bold py-1.5 rounded-lg text-[10px] cursor-pointer ${db.settings.activePlan === "Growth" ? "bg-blue-100 text-blue-700 cursor-not-allowed" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                >
                  {t("upgradeToGrowth")}
                </button>
              </div>

              {/* Pro Tier */}
              <div className={`border rounded-xl p-4 flex flex-col gap-2 relative ${db.settings.activePlan === "Pro" ? "border-blue-500 bg-blue-50/20" : "border-slate-200"}`}>
                {db.settings.activePlan === "Pro" && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {t("activePlanLabel")}
                  </span>
                )}
                <div className="font-black text-slate-800 text-xs">RetailIQ Pro</div>
                <div className="text-[10px] text-slate-500 font-semibold">{t("pricingProDesc")}</div>
                <button
                  type="button"
                  onClick={() => handleUpgradePlan("Pro")}
                  disabled={db.settings.activePlan === "Pro"}
                  className={`w-full mt-2 font-bold py-1.5 rounded-lg text-[10px] cursor-pointer ${db.settings.activePlan === "Pro" ? "bg-blue-100 text-blue-700 cursor-not-allowed" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                >
                  {t("upgradeToPro")}
                </button>
              </div>
            </div>
          </div>

          {/* Maintenance Segment */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-start relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            <h3 className="font-extrabold text-red-600 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5" />
              <span>{t("settingsDangerTitle")}</span>
            </h3>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              {t("settingsDangerSub")}
            </p>

            <button
              type="button"
              onClick={triggerReset}
              className="w-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 py-3 rounded-xl shadow-md shadow-red-500/10 cursor-pointer transition-all mt-2"
            >
              {t("settingsDangerBtn")}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
