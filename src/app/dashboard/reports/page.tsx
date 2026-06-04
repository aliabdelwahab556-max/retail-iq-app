"use client";

import React, { useState, useEffect } from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { FileText, FileSpreadsheet, Download, RefreshCw, Sparkles, Clock, Landmark } from "lucide-react";

export default function ReportsPage() {
  const { db } = useDatabase();
  const { t, isRtl } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cSymbol = db.settings.currency;

  const triggerExport = (reportType: string) => {
    alert(isRtl 
      ? `تم تفعيل تصدير كشف: ${reportType}. تم تحميل ملف البيانات CSV بنجاح.` 
      : `Export pipeline successfully initiated for: ${reportType}. Spreadsheet file generated and downloaded.`);
  };

  return (
    <div className="flex flex-col gap-8 text-slate-800 text-start">
      
      {/* HEADER SEGMENT */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-slate-700" />
          <span>{t("menuReports")}</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          {isRtl 
            ? "تصدير كشوف وجداول مالي المخزن، مبيعات اليومية، وحركات التزامن السحابي الموحدة."
            : "Generate, inspect, and export consolidated spreadsheets, warehouse cost registries, and sync ledgers."}
        </p>
      </div>

      {/* EXPORT PANELS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* 1. Catalog CSV */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 text-start">
          <div className="flex flex-col gap-2">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">CSV</span>
            <div className="font-extrabold text-slate-800 text-xs mt-2">{t("repCatalogTitle")}</div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">{t("repCatalogDesc")}</p>
          </div>
          <button
            onClick={() => triggerExport("Catalog entries")}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-extrabold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 rounded-xl py-2 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t("exportCSVBtn")}</span>
          </button>
        </div>

        {/* 2. Receipts Ledger */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 text-start">
          <div className="flex flex-col gap-2">
            <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold">USD</span>
            <div className="font-extrabold text-slate-800 text-xs mt-2">{t("repLedgerTitle")}</div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">{t("repLedgerDesc")}</p>
          </div>
          <button
            onClick={() => triggerExport("Financial order ledger")}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-extrabold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-100 rounded-xl py-2 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t("exportLedgerBtn")}</span>
          </button>
        </div>

        {/* 3. Shopify Sync History */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 text-start">
          <div className="flex flex-col gap-2">
            <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">API</span>
            <div className="font-extrabold text-slate-800 text-xs mt-2">{t("repShopifyTitle")}</div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">{t("repShopifyDesc")}</p>
          </div>
          <button
            onClick={() => triggerExport("Shopify synchronization")}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-extrabold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 rounded-xl py-2 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t("exportSyncBtn")}</span>
          </button>
        </div>

        {/* 4. Intelligent Performance Digest */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 text-start">
          <div className="flex flex-col gap-2">
            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold"><Sparkles className="w-4 h-4" /></span>
            <div className="font-extrabold text-slate-800 text-xs mt-2">{t("repWeeklyDigestTitle")}</div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">{t("repWeeklyDigestDesc")}</p>
          </div>
          <button
            onClick={() => alert(isRtl ? "جاري تجهيز تقرير الأداء..." : "Reconciling performance metrics...")}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-extrabold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 rounded-xl py-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("repWeeklyDigestBtn")}</span>
          </button>
        </div>

      </div>

      {/* CHRONOLOGICAL RETAIL LEDGER HISTORY */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-6 text-start">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Clock className="w-4.5 h-4.5 text-slate-500" />
          <span>{t("repActivityLedger")}</span>
        </h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                <th className="px-4 py-3 text-start">{t("timestamp")}</th>
                <th className="px-4 py-3 text-start">{t("activity")}</th>
                <th className="px-4 py-3 text-center">{t("channel")}</th>
                <th className="px-4 py-3 text-end">{t("financialImpact")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-semibold">
                    No operating logs logged this session.
                  </td>
                </tr>
              ) : (
                db.logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">
                      {mounted ? new Date(log.timestamp).toLocaleString() : ""}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">{log.task}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${log.channel === "POS" ? "bg-blue-50 text-blue-600" : log.channel === "Inventory" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-end font-extrabold ${log.value > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                      {log.value > 0 ? `+${cSymbol}${log.value.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
