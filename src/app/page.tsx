"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { ArrowRight, ShoppingBag, BarChart3, Bot, Check, Globe, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { t, language, toggleLanguage, isRtl } = useI18n();

  const handleStartOnboarding = () => {
    router.push("/auth");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isRtl ? "text-right" : "text-left"}`}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 glass-effect border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
            IQ
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 leading-none">RetailIQ</h1>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wide" style={{ fontFamily: "var(--font-cairo)" }}>
              {t("tagline")}
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">{t("features")}</a>
          <a href="#shopify" className="hover:text-blue-600 transition-colors">{t("shopify")}</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">{t("pricing")}</a>
        </nav>

        <div className="flex items-center gap-4">
          {/* Lang Selector */}
          <div className="flex items-center gap-1 border border-slate-200 bg-white rounded-lg p-1">
            <button
              onClick={() => toggleLanguage("en")}
              className={`text-xs px-2 py-1 rounded font-bold transition-all ${language === "en" ? "bg-slate-100 text-blue-600" : "text-slate-500"}`}
            >
              EN
            </button>
            <button
              onClick={() => toggleLanguage("ar")}
              className={`text-xs px-2 py-1 rounded font-bold transition-all ${language === "ar" ? "bg-slate-100 text-blue-600" : "text-slate-500"}`}
              style={{ fontFamily: "var(--font-cairo)" }}
            >
              العربية
            </button>
          </div>

          <button
            onClick={handleStartOnboarding}
            className="text-xs md:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 transition-all cursor-pointer"
          >
            {t("signin")}
          </button>
          <button
            onClick={handleStartOnboarding}
            className="hidden sm:inline-flex text-xs md:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            {t("startTrial")}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 w-fit">
            <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-[10px] uppercase font-bold">New</span>
            <span>{t("heroPill")}</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight"
            dangerouslySetInnerHTML={{ __html: t("heroTitle") }}
          />

          <motion.p variants={itemVariants} className="text-slate-600 text-md md:text-lg leading-relaxed max-w-xl">
            {t("heroSub")}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mt-2">
            <button
              onClick={handleStartOnboarding}
              className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-3.5 shadow-lg shadow-blue-500/20 flex items-center gap-2 group transition-all cursor-pointer"
            >
              <span>{t("startTrial")}</span>
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </button>
            <button
              onClick={handleStartOnboarding}
              className="text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl px-6 py-3.5 shadow-sm transition-all cursor-pointer"
            >
              {t("connectShopify")}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 mt-4 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Google Cloud & Firebase Auth</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Globe className="w-5 h-5 text-emerald-500" />
              <span>Paymob, Tap & Stripe Integrated</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Dynamic visual preview element */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <span className="font-bold text-slate-800 text-sm">{t("menuDashboard")}</span>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>{t("liveStoreFeed")}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 uppercase font-bold">{t("revenue")}</span>
              <span className="font-black text-slate-800 text-lg">$28,540.00</span>
              <span className="text-[9px] text-emerald-600 font-semibold">{t("revenueTrend")}</span>
            </div>
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 uppercase font-bold">{t("transactions")}</span>
              <span className="font-black text-slate-800 text-lg">325</span>
              <span className="text-[9px] text-emerald-600 font-semibold">{t("ordersTrend")}</span>
            </div>
            <div className="border border-slate-100 rounded-xl p-3 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-between h-24">
              <span className="text-[10px] text-blue-600 uppercase font-extrabold">{t("aiFeedTitle")}</span>
              <p className="text-[10px] text-slate-700 leading-tight font-medium line-clamp-3">
                {t("mockInsight")}
              </p>
            </div>
          </div>

          <div className="h-28 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-6">
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">{t("sidebarHealthTitle")}</span>
                <span className="font-bold text-emerald-600">92/100 {t("excellentLabel")}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-[92%] h-full bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* FEATURES GRID */}
      <section className="bg-slate-100/50 border-y border-slate-200 px-6 py-20" id="features">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t("featuresTitle")}</h3>
            <p className="text-slate-500">{t("featuresSub")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-lg text-slate-900">{t("posFeatureTitle")}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{t("posFeatureDesc")}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-lg text-slate-900">{t("invFeatureTitle")}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{t("invFeatureDesc")}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-lg text-slate-900">{t("aiFeatureTitle")}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{t("aiFeatureDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOPIFY MODULE */}
      <section className="px-6 py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center" id="shopify">
        <div className="flex flex-col gap-6">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t("shopifyTitle")}</h3>
          <p className="text-slate-600 leading-relaxed">{t("shopifyDesc")}</p>
          <button
            onClick={handleStartOnboarding}
            className="text-sm font-bold text-white bg-green-700 hover:bg-green-800 rounded-xl px-6 py-3.5 shadow-lg shadow-green-700/10 w-fit cursor-pointer"
          >
            {t("shopifyBtn")}
          </button>
        </div>
        <div className="flex flex-col items-center justify-center bg-green-50/50 border border-green-100 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-green-100/50 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
              IQ
            </div>
            <span className="text-green-600 font-bold text-lg animate-pulse">◀ 🔗 ▶</span>
            <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <ShoppingBag className="w-8 h-8" />
            </div>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
            {t("autoSyncText")}
          </span>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section className="bg-slate-100/50 border-t border-slate-200 px-6 py-20" id="pricing">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t("pricingTitle")}</h3>
            <p className="text-slate-500">{t("pricingSub")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between h-[450px]">
              <div>
                <h4 className="font-extrabold text-xl text-slate-900">Starter Plan</h4>
                <p className="text-slate-500 text-xs mt-1">{t("pricingStarterDesc")}</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900">$29</span>
                  <span className="text-slate-500 text-sm font-semibold">/month</span>
                </div>
                <ul className="flex flex-col gap-3 font-semibold text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>7-Day Free Trial Included</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>1% Transaction fee</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>Max transaction fee cap: $99/mo</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>Real-Time POS Syncing</span></li>
                </ul>
              </div>
              <button
                onClick={handleStartOnboarding}
                className="w-full text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl py-3 cursor-pointer"
              >
                {t("startTrial")}
              </button>
            </div>

            {/* Growth Plan */}
            <div className="bg-white border-2 border-blue-500 rounded-2xl p-8 shadow-md flex flex-col justify-between h-[450px] relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-[9px] uppercase px-3 py-1 rounded-full tracking-wider">
                {t("popularBadge")}
              </span>
              <div>
                <h4 className="font-extrabold text-xl text-slate-900">Growth Plan</h4>
                <p className="text-slate-500 text-xs mt-1">{t("pricingGrowthDesc")}</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900">$79</span>
                  <span className="text-slate-500 text-sm font-semibold">/month</span>
                </div>
                <ul className="flex flex-col gap-3 font-semibold text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>7-Day Free Trial Included</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>0.25% Transaction fee</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>Max transaction fee cap: $199/mo</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>Shopify active connector sync</span></li>
                </ul>
              </div>
              <button
                onClick={handleStartOnboarding}
                className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl py-3 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                {t("startTrial")}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between h-[450px]">
              <div>
                <h4 className="font-extrabold text-xl text-slate-900">Pro Plan</h4>
                <p className="text-slate-500 text-xs mt-1">{t("pricingProDesc")}</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900">$149</span>
                  <span className="text-slate-500 text-sm font-semibold">/month</span>
                </div>
                <ul className="flex flex-col gap-3 font-semibold text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>No Transaction fees</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>Unlimited multi-channel transactions</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>Firebase cloud database linkage</span></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> <span>Gemini AI Business Advisor (NLP)</span></li>
                </ul>
              </div>
              <button
                onClick={handleStartOnboarding}
                className="w-full text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl py-3 cursor-pointer"
              >
                {t("startTrial")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 text-center text-xs font-semibold">
        <p>&copy; {new Date().getFullYear()} RetailIQ Technologies Inc. All rights reserved. Google Cloud Platform Preferred Ecosystem Partner.</p>
      </footer>
    </div>
  );
}
