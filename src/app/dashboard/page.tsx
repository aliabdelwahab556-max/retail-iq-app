"use client";

import React from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import { DollarSign, ShieldAlert, Award, Package, ShoppingCart, RefreshCw, Sparkles, TrendingUp } from "lucide-react";

export default function DashboardHome() {
  const { db } = useDatabase();
  const { t, isRtl } = useI18n();
  const cSymbol = db.settings.currency;

  // 1. Dynamic KPIs
  const dynamicSalesTotal = db.orders.reduce((sum, o) => sum + o.total, 0);
  const baselineRevenue = 28540.00 - 870.00;
  const totalRevenue = baselineRevenue + dynamicSalesTotal;

  let dynamicProfitTotal = 0;
  db.orders.forEach(o => {
    o.items.forEach(item => {
      const prod = db.products.find(p => p.id === item.id);
      if (prod) {
        dynamicProfitTotal += item.qty * (item.price - prod.cost);
      } else {
        dynamicProfitTotal += item.qty * (item.price * 0.45);
      }
    });
  });
  const baselineProfit = 7432.00 - 495.00;
  const totalProfit = baselineProfit + dynamicProfitTotal;

  const baselineOrders = 325 - 5;
  const totalOrdersCount = baselineOrders + db.orders.length;

  const lowStockCount = db.products.filter(p => p.stock <= 9 && p.stock > 0).length;

  // 2. Sorting products by popularity
  const topProducts = [...db.products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const worstProducts = [...db.products]
    .filter(p => p.sold > 0)
    .sort((a, b) => a.sold - b.sold)
    .slice(0, 3);

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
      className="flex flex-col gap-8"
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
            <span className="text-[9px] text-red-500 font-extrabold cursor-pointer hover:underline">{t("viewAllLink")}</span>
          </div>
        </motion.div>
      </div>

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
              <path d="M 0 80 Q 20 50 40 60 T 80 30 T 100 20 L 100 100 L 0 100 Z" fill="url(#chartGrad)" />
              <path d="M 0 80 Q 20 50 40 60 T 80 30 T 100 20" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
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
                <div className="font-bold text-slate-800 text-[11px]">{t("insightRow1Title")}</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{t("insightRow1Desc")}</div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 flex items-start gap-3">
              <span className="text-lg">🚨</span>
              <div>
                <div className="font-bold text-slate-800 text-[11px]">{t("insightRow2Title")}</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{t("insightRow2Desc")}</div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100/50 flex items-start gap-3">
              <span className="text-lg">💡</span>
              <div>
                <div className="font-extrabold text-blue-700 text-[11px]">{t("insightRow3Title")}</div>
                <div className="text-[10px] text-slate-600 font-medium mt-0.5 leading-relaxed">{t("insightRow3Desc")}</div>
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
                {topProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-lg">{p.emoji || "📦"}</span>
                      <span className="font-bold text-slate-800">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-500">{p.sold}</td>
                    <td className="px-4 py-3 text-end font-extrabold text-slate-800">{cSymbol}{(p.sold * p.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
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
                No dead stock catalogued! Excellent turnover.
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

          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{t("returnsOverview")}</h3>
            </div>
            <div className="flex flex-col gap-3 text-start">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Freight Damaged Ring Write-off</span>
                <span className="text-red-600">-{cSymbol}1,100.00</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="w-[12%] h-full bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
