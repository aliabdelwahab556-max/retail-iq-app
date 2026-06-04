"use client";

import React from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { BarChart3, TrendingUp, Sparkles, Percent, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
  const { db } = useDatabase();
  const { t, isRtl } = useI18n();

  const cSymbol = db.settings.currency;

  // 1. Calculations
  const dynamicSalesTotal = db.orders.reduce((sum, o) => sum + o.total, 0);
  const baselineRevenue = 28540.00 - 870.00;
  const totalRevenue = baselineRevenue + dynamicSalesTotal;

  const baselineOrders = 325 - 5;
  const totalOrders = baselineOrders + db.orders.length;

  // Average Order Value
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Gross profit margin computation
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
  const grossProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Shopify sync yield
  const shopifySales = db.orders.filter(o => o.channel === "Shopify").reduce((sum, o) => sum + o.total, 0);
  const shopifyRatio = totalRevenue > 0 ? (shopifySales / totalRevenue) * 100 : 0;

  const categoryAllocations = [
    { name: "Electronics", val: 14600.00, percent: 51, color: "bg-blue-600" },
    { name: "Apparel", val: 8400.00, percent: 29, color: "bg-indigo-500" },
    { name: "Jewelry", val: 5540.00, percent: 20, color: "bg-emerald-500" }
  ];

  const salespeople = [
    { name: "Ahmed (Admin)", revenue: 14850.00, contribution: "52%" },
    { name: "Mustafa", revenue: 8560.00, contribution: "30%" },
    { name: "Shopify Sync", revenue: 5130.00, contribution: "18%" }
  ];

  return (
    <div className="flex flex-col gap-8 text-slate-800 text-start">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-slate-700" />
          <span>{t("menuAnalytics")}</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          {isRtl 
            ? "مؤشرات التجزئة، أداء قنوات البيع، إحصائيات المبيعات، ومساهمة الموظفين."
            : "Live financial indexing, multi-channel performance yields, and dynamic turnover calculations."}
        </p>
      </div>

      {/* THREE ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Average Order Value */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              {t("avgOrderValue")}
            </span>
            <span className="text-2xl font-black text-slate-800 block mt-1.5">
              {cSymbol}{avgOrderValue.toFixed(2)}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold mt-1 block">
              {t("avgOrderSub")}
            </span>
          </div>
        </div>

        {/* Gross Profit Margin */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              {t("grossProfitMargin")}
            </span>
            <span className="text-2xl font-black text-slate-800 block mt-1.5">
              {grossProfitMargin.toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-400 font-semibold mt-1 block">
              {t("grossMarginSub")}
            </span>
          </div>
        </div>

        {/* Shopify Synced Ratio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              {t("shopifyRatio")}
            </span>
            <span className="text-2xl font-black text-slate-800 block mt-1.5">
              {shopifyRatio.toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-400 font-semibold mt-1 block">
              {t("shopifyRatioSub")}
            </span>
          </div>
        </div>

      </div>

      {/* DUAL SECTION CHART ALLOCATIONS */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Category Revenue Allocations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 text-start">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{t("revenueAllocation")}</h3>
          </div>

          <div className="flex flex-col gap-5">
            {categoryAllocations.map(cat => (
              <div key={cat.name} className="flex flex-col gap-1.5 text-xs font-bold">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span className="text-slate-800">{cat.name}</span>
                  <span>{cSymbol}{cat.val.toLocaleString()} ({cat.percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Agent Contributions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 text-start">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{t("salesAgentContrib")}</h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="px-4 py-2 text-start">{t("salespersonLabel")}</th>
                  <th className="px-4 py-2 text-end">{isRtl ? "إجمالي الإيراد المحقق" : "Reconciliation Value"}</th>
                  <th className="px-4 py-2 text-center">{t("storeAllocation")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold">
                {salespeople.map(person => (
                  <tr key={person.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{person.name}</td>
                    <td className="px-4 py-3 text-end font-extrabold text-slate-700">{cSymbol}{person.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                        {person.contribution}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
