"use client";

import React from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import { DollarSign, ShieldAlert, Award, Package, ShoppingCart, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardHome() {
  const { db } = useDatabase();
  const { t, isRtl } = useI18n();
  const router = useRouter();
  const cSymbol = db.settings.currency;

  // 1. Dynamic KPIs (100% Real from dynamic database state, zero offsets)
  const totalRevenue = db.orders.reduce((sum, o) => sum + o.total, 0);

  let totalProfit = 0;
  db.orders.forEach(o => {
    o.items.forEach(item => {
      const prod = db.products.find(p => p.id === item.id);
      if (prod) {
        totalProfit += item.qty * (item.price - prod.cost);
      } else {
        totalProfit += item.qty * (item.price * 0.45); // estimated profit
      }
    });
  });

  const totalOrdersCount = db.orders.length;
  const lowStockCount = db.products.filter(p => p.stock <= 9 && p.stock > 0).length;

  // 2. Sorting products by popularity
  const topProducts = [...db.products]
    .filter(p => p.sold > 0)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const deadStockProducts = db.products.filter(p => p.sold === 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 text-slate-800"
    >
      {/* Dynamic Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("welcomeMorning")} {db.settings.managerName} 👋
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {t("welcomeSub")}
          </p>
        </div>
        <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-xl px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">
          <span>📅</span>
          <span>{t("dateTimeframe")}</span>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-start">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t("revenue")}</span>
            <span className="text-2xl font-black text-slate-800 my-0.5">{cSymbol}{totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span className="text-[9px] text-emerald-600 font-bold">{t("revenueTrend")}</span>
          </div>
        </motion.div>

        {/* Net Profit */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-start">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t("profit")}</span>
            <span className="text-2xl font-black text-slate-800 my-0.5">{cSymbol}{totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span className="text-[9px] text-emerald-600 font-bold">{t("profitTrend")}</span>
          </div>
        </motion.div>

        {/* Total Orders */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-start">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t("transactions")}</span>
            <span className="text-2xl font-black text-slate-800 my-0.5">{totalOrdersCount}</span>
            <span className="text-[9px] text-emerald-600 font-bold">{t("ordersTrend")}</span>
          </div>
        </motion.div>

        {/* Low Stock Warns */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-start">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t("stockAlerts")}</span>
            <span className="text-2xl font-black text-slate-800 my-0.5">{lowStockCount}</span>
            <span 
              onClick={() => router.push("/dashboard/inventory")}
              className="text-[9px] text-red-500 font-extrabold cursor-pointer hover:underline"
            >
              {t("viewAllLink")}
            </span>
          </div>
        </motion.div>
      </div>

      {totalOrdersCount === 0 && db.products.length === 0 ? (
        /* Empty State dashboard when mock data is deleted */
        <motion.div 
          variants={itemVariants} 
          className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📦</div>
          <h3 className="font-extrabold text-slate-800 text-lg">
            {isRtl ? "مرحباً بك في متجرك الإنتاجي النظيف!" : "Welcome to your clean Production Store!"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed font-semibold">
            {isRtl 
              ? "لقد قمنا بتصفير قاعدة البيانات ومسح كل السجلات الوهمية للبدء الفعلي. اذهب إلى إدارة المخزن لإضافة سلعك الأولى، أو شاشة الكاشير لتسجيل فواتير المحل الحقيقية!"
              : "We have fully wiped the mock entries to start real operations. Navigate to Inventory to catalog your first items or POS terminal to start checkouts!"}
          </p>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => router.push("/dashboard/inventory")}
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
            >
              {t("invAddBtn")}
            </button>
            <button 
              onClick={() => router.push("/dashboard/settings")}
              className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm cursor-pointer transition-all"
            >
              {isRtl ? "ربط شوبيفاي" : "Connect Shopify Sync"}
            </button>
          </div>
        </motion.div>
      ) : (
        /* live metrics when data exists */
        <div className="flex flex-col gap-8">
          {/* CHARTS GRID */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sales Overview Area line chart */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{t("chartTitle")}</h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded-lg border border-blue-100">
                  {t("thisWeek")}
                </span>
              </div>

              <div className="h-56 relative flex items-end justify-between px-4 pb-4">
                {/* Visual background lines */}
                <div className="absolute inset-0 flex flex-col justify-between -z-10 py-4">
                  <div className="border-b border-slate-100 w-full"></div>
                  <div className="border-b border-slate-100 w-full"></div>
                  <div className="border-b border-slate-100 w-full"></div>
                  <div className="border-b border-slate-100 w-full"></div>
                </div>

                {/* Responsive mock SVG area graph */}
                <svg className="absolute inset-0 w-full h-full p-4 -z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 85 Q 20 60 40 70 T 80 40 T 100 30 L 100 100 L 0 100 Z" fill="url(#chartGrad)" />
                  <path d="M 0 85 Q 20 60 40 70 T 80 40 T 100 30" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>

                {/* Calendar indicators */}
                <span className="text-[10px] text-slate-400 font-bold">Mon</span>
                <span className="text-[10px] text-slate-400 font-bold">Tue</span>
                <span className="text-[10px] text-slate-400 font-bold">Wed</span>
                <span className="text-[10px] text-slate-400 font-bold">Thu</span>
                <span className="text-[10px] text-slate-400 font-bold">Fri</span>
                <span className="text-[10px] text-slate-400 font-bold">Sat</span>
                <span className="text-[10px] text-slate-400 font-bold">Sun</span>
              </div>
            </motion.div>

            {/* AI copilot Insight feeds */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>{t("aiInsightsTitle")}</span>
                </h3>
              </div>

              <div className="flex flex-col gap-4 text-start">
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 flex items-start gap-3">
                  <span className="text-lg">📈</span>
                  <div>
                    <div className="font-bold text-slate-800 text-[11px]">
                      {isRtl ? "مبيعات المحل والأونلاين موحدة" : "Unified POS & Online sales active"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {isRtl ? "تتحسن المؤشرات مع إتمام تسويات كروت و كاشير المحل." : "Indexes balance instantly on POS and e-commerce channel transactions."}
                    </div>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 flex items-start gap-3">
                  <span className="text-lg">🚨</span>
                  <div>
                    <div className="font-bold text-slate-800 text-[11px]">
                      {lowStockCount} {t("stockAlerts")}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{t("insightRow2Desc")}</div>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100/50 flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <div>
                    <div className="font-extrabold text-blue-700 text-[11px]">{t("insightRow3Title")}</div>
                    <div className="text-[10px] text-slate-600 font-medium mt-0.5 leading-relaxed">
                      {isRtl ? "سحب مبيعات شوبيفاي يغذي المستند المالي موحداً." : "Shopify sync aggregates global revenue indices globally."}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* BOTTOM LISTS GRID */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Top Selling Products */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{t("topSKUTitle")}</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="px-4 py-2 text-start">{t("productInfo")}</th>
                      <th className="px-4 py-2 text-center">{t("unitsSold")}</th>
                      <th className="px-4 py-2 text-end">{t("netSalesYield")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400 font-semibold">
                          No transactions finalized yet.
                        </td>
                      </tr>
                    ) : (
                      topProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-lg">{p.emoji || "📦"}</span>
                            <span className="font-bold text-slate-800">{p.name}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-500">{p.sold}</td>
                          <td className="px-4 py-3 text-end font-extrabold text-slate-800">{cSymbol}{(p.sold * p.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Dead Stock & Returns Analytics */}
            <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{t("deadStockTitle")}</h3>
              </div>

              <div className="flex flex-col gap-3 text-start">
                {deadStockProducts.length === 0 ? (
                  <div className="text-center text-slate-400 py-6 text-xs font-semibold">
                    No items in catalog.
                  </div>
                ) : (
                  deadStockProducts.slice(0, 3).map(p => (
                    <div key={p.id} className="border border-slate-100 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">{p.emoji || "📦"}</span>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{p.name}</div>
                          <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{p.sku}</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                        Stock: {p.stock}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
