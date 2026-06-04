"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { useDatabase } from "@/context/DatabaseContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, ShoppingCart, Package, BarChart3, Users, 
  BookOpen, FileSpreadsheet, Sparkles, Truck, Settings,
  Search, Bell, LogOut, FileText, Menu, X, Landmark, RefreshCw, Store
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, toggleLanguage, isRtl } = useI18n();
  const { db } = useDatabase();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountDigestOpen, setAccountDigestOpen] = useState(false);
  const [weeklyReportOpen, setWeeklyReportOpen] = useState(false);

  const handleLogout = () => {
    router.push("/");
  };

  const navItems = [
    { id: "dashboard", icon: LayoutGrid, path: "/dashboard", labelKey: "menuDashboard" },
    { id: "pos", icon: ShoppingCart, path: "/dashboard/pos", labelKey: "menuPos" },
    { id: "inventory", icon: Package, path: "/dashboard/inventory", labelKey: "menuInventory" },
    { id: "analytics", icon: BarChart3, path: "/dashboard/analytics", labelKey: "menuSales" },
    { id: "customers", icon: Users, path: "/dashboard/customers", labelKey: "menuCustomers" },
    { id: "accounting", icon: Landmark, path: "/dashboard/accounting", labelKey: "menuAccounting" },
    { id: "reports", icon: FileSpreadsheet, path: "/dashboard/reports", labelKey: "menuReports" },
    { id: "ai-copilot", icon: Sparkles, path: "/dashboard/ai-copilot", labelKey: "menuAiInsights", color: "text-blue-500" },
    { id: "suppliers", icon: Truck, path: "/dashboard/suppliers", labelKey: "menuSuppliers" },
    { id: "settings", icon: Settings, path: "/dashboard/settings", labelKey: "menuSettings" },
  ];

  const businessType = db.settings.businessType || "both";
  const storeSlug = db.settings.storeSlug || "";

  const filteredNavItems = navItems.filter((item) => {
    if (businessType === "ecommerce" && item.id === "pos") {
      return false; // Hide POS register for e-commerce only merchants
    }
    return true;
  });

  // Dynamic calculations for modals
  const dynamicGains = db.orders.reduce((sum, o) => sum + o.total, 0);
  const baselineGains = 28540.00 - 870.00;
  const totalGains = baselineGains + dynamicGains;
  const carryLosses = 1100.00; // Diamond Ring damaged freight
  const netBalance = totalGains - carryLosses;

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col md:flex-row ${isRtl ? "text-right" : "text-left"}`}>
      {/* MOBILE HEADER */}
      <header className="md:hidden w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-md">IQ</div>
          <span className="font-extrabold text-md text-slate-800">RetailIQ</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* SIDEBAR ASIDE */}
      <aside className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : isRtl ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Logo segment */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/10">IQ</div>
            <div>
              <span className="font-black text-slate-800 tracking-tight leading-none block">RetailIQ</span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wide" style={{ fontFamily: "var(--font-cairo)" }}>
                {t("tagline")}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 flex flex-col gap-1">
            {filteredNavItems.map((item) => {
              const active = pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${active ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <item.icon className={`w-4 h-4 ${active ? "text-white" : item.color || "text-slate-400"}`} />
                  <span>{t(item.labelKey as any)}</span>
                  {item.id === "inventory" && db.products.filter(p => p.stock <= 9).length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${active ? "bg-white text-blue-600" : "bg-red-500 text-white ml-auto"}`}>
                      {db.products.filter(p => p.stock <= 9).length}
                    </span>
                  )}
                </button>
              );
            })}

            {(businessType === "ecommerce" || businessType === "both") && storeSlug && (
              <a
                href={`/store/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 mt-2"
              >
                <Store className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isRtl ? "عرض المتجر الإلكتروني" : "View Online Store"}</span>
              </a>
            )}
          </nav>
        </div>

        {/* Sidebar Health Circle Gauge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="border border-slate-200/80 bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3 text-start">
              {t("sidebarHealthTitle")}
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="relative w-14 h-14">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeWidth="3" strokeDasharray="92, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black text-slate-800 text-sm">92</div>
              </div>
              <div className="text-start">
                <div className="text-xs font-bold text-slate-700">{t("excellentLabel")}</div>
                <div className="text-[9px] font-semibold text-slate-400 mt-0.5">{t("keepWorkLabel")}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm">
          {/* Topbar Search */}
          <div className="relative hidden sm:flex items-center w-64">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything... ⌘K"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === "Enter") alert("Search initiated across live B2B database state.");
              }}
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Shopify Badge */}
            <div 
              onClick={() => router.push("/dashboard/settings")}
              className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${db.shopifyConnected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${db.shopifyConnected ? "animate-spin" : ""}`} />
              <span>{db.shopifyConnected ? t("shopifyLinked") : t("shopifyOffline")}</span>
            </div>

            {/* Language Rotator */}
            <select
              value={language}
              onChange={(e) => toggleLanguage(e.target.value as any)}
              className="border border-slate-200 bg-white rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>

            {/* Notifications Bell */}
            <div 
              onClick={() => alert("System running successfully. All transaction registers sync monitored.")}
              className="relative p-2 border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer shadow-sm text-slate-600"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] font-black flex items-center justify-center border border-white">
                3
              </span>
            </div>

            {/* User Profile dropdown */}
            <div className="relative">
              <div 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-all select-none"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/10">
                  {db.settings.managerName.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">{db.settings.managerName} ∨</span>
              </div>

              {/* Dropdown element */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-xl w-56 z-50 p-1 flex flex-col"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 text-start">
                      <div className="text-xs font-bold text-slate-800">{db.settings.managerName}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{t("adminRole")}</div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setAccountDigestOpen(true);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer text-start"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t("accountDigestTitle")}</span>
                    </button>

                    <button
                      onClick={() => {
                        setWeeklyReportOpen(true);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer text-start"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t("repWeeklyDigestTitle")}</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer text-start"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t("signoutText")}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT WRAPPER */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          {children}
        </main>
      </div>

      {/* 1. WEEKLY ACCOUNT DIGEST MODAL */}
      <AnimatePresence>
        {accountDigestOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h3 className="font-extrabold text-lg text-slate-900">{t("weeklyAccountReportHeader")}</h3>
                <button onClick={() => setAccountDigestOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <div className="flex flex-col gap-6 text-start">
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Hello <strong>{db.settings.managerName}</strong>, welcome to your Weekly Financial Ledger & Performance Audit. The metrics and ledger below are dynamically calculated from your registers, e-commerce integrations, and inventory carry-costs:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] text-emerald-800 uppercase font-extrabold">🟢 {t("financialGainsRevenues")}</span>
                    <span className="font-black text-emerald-700 text-2xl">+{db.settings.currency}{totalGains.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    <div className="text-[9px] text-emerald-600 font-bold leading-relaxed border-t border-emerald-100 pt-2">
                      • {t("storeRevenuesBaseline")}: {db.settings.currency}{baselineGains.toLocaleString(undefined, {minimumFractionDigits: 2})}<br/>
                      • {t("dynamicSessionRevenues")}: {db.settings.currency}{dynamicGains.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                  </div>

                  <div className="border border-red-100 bg-red-50/50 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] text-red-800 uppercase font-extrabold">🔴 {t("operationalCarryLosses")}</span>
                    <span className="font-black text-red-700 text-2xl">-{db.settings.currency}{carryLosses.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    <div className="text-[9px] text-red-600 font-bold leading-relaxed border-t border-red-100 pt-2">
                      • {t("diamondRingWriteoffLoss")}: -{db.settings.currency}{carryLosses.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                  </div>
                </div>

                <div className="border border-blue-100 bg-blue-50/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-blue-800 uppercase font-extrabold">💎 {t("netWeeklyAccountBalance")}</span>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Consolidated operating ledger value after adjusting damaged stock carry cost.</p>
                  </div>
                  <span className="font-black text-blue-700 text-2xl">{db.settings.currency}{netBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>

                {/* Ledger Orders */}
                <div>
                  <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <span>📝</span>
                    <span>{t("chronologicalTransactionLedger")}</span>
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-xs text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                          <th className="px-4 py-2.5 text-start">{t("ledgerTimestamp")}</th>
                          <th className="px-4 py-2.5 text-start">{t("ledgerOrder")}</th>
                          <th className="px-4 py-2.5 text-start">{t("ledgerCustomer")}</th>
                          <th className="px-4 py-2.5 text-center">{t("ledgerChannel")}</th>
                          <th className="px-4 py-2.5 text-end">{t("ledgerValue")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {db.orders.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                              No orders made this session.
                            </td>
                          </tr>
                        ) : (
                          db.orders.map((o) => (
                            <tr key={o.id}>
                              <td className="px-4 py-3 text-slate-500 font-medium">
                                {new Date(o.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" })}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-800">{o.id}</td>
                              <td className="px-4 py-3">{o.customerName}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${o.channel === "POS" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                                  {o.channel}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-end font-extrabold text-emerald-600">+{db.settings.currency}{o.total.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. WEEKLY store performance digest modal */}
      <AnimatePresence>
        {weeklyReportOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="font-extrabold text-lg text-slate-900">{t("repWeeklyDigestTitle")}</h3>
                <button onClick={() => setWeeklyReportOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              <div className="flex flex-col gap-4 text-start text-xs font-semibold text-slate-600 leading-relaxed">
                <p>
                  Here is your weekly performance audit, generated dynamically from catalog data:
                </p>

                <div className="flex flex-col gap-3">
                  <div className="border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">🏆</span>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-extrabold">Winning Catalog Segment</div>
                      <div className="font-extrabold text-slate-800 text-xs">Wireless Headphones</div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">📉</span>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-extrabold">Underperforming Segment</div>
                      <div className="font-extrabold text-slate-800 text-xs">USB Cable</div>
                    </div>
                  </div>

                  <div className="border border-red-100 bg-red-50/10 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-xl">🚨</span>
                    <div>
                      <div className="text-[10px] text-red-800 uppercase font-extrabold">Freight carrying loss</div>
                      <div className="font-extrabold text-red-600 text-xs">Diamond Ring Freight damage (-$1,100.00)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 mt-6 pt-4">
                <button 
                  onClick={() => {
                    alert("Reports dispatched successfully via email registers.");
                    setWeeklyReportOpen(false);
                  }}
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Email Weekly Report to {db.settings.managerName}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
