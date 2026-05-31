"use client";

import React, { useState } from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { Users, Search, Plus, Trash2, Award, Mail, Sparkles, X } from "lucide-react";
import { Customer } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomersPage() {
  const { db, updateDB } = useDatabase();
  const { t, isRtl } = useI18n();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState(0);

  const filteredCustomers = db.customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalCustomers = db.customers.length;
  const totalPoints = db.customers.reduce((sum, c) => sum + (c.points || 0), 0);
  const avgPoints = totalCustomers > 0 ? totalPoints / totalCustomers : 0;

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      alert("Please provide a name and email.");
      return;
    }

    const emailExists = db.customers.some(c => c.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      alert("A B2B member with this email already exists in the registry.");
      return;
    }

    const newCustomer: Customer = {
      name,
      email,
      points: Number(points) || 0
    };

    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: `B2B Loyalty profile created for ${name} (${email}) by Ahmed.`,
        channel: "Customers",
        value: 0
      },
      ...db.logs
    ];

    updateDB({
      ...db,
      customers: [...db.customers, newCustomer],
      logs: newLogs
    });

    setName("");
    setEmail("");
    setPoints(0);
    setShowAddModal(false);
  };

  const handleDeleteCustomer = (emailToDelete: string, name: string) => {
    if (emailToDelete === "walkin@retailiq.com") {
      alert(isRtl ? "لا يمكن حذف عميل المبيعات العامة الافتراضي." : "Default Walk-In customer profile cannot be removed.");
      return;
    }

    if (!confirm(isRtl ? `هل أنت متأكد من حذف العميل ${name}؟` : `Are you sure you want to remove customer profile for ${name}?`)) return;

    const updatedCustomers = db.customers.filter(c => c.email !== emailToDelete);
    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: `B2B member ${name} deleted from active store loyalty lists.`,
        channel: "Customers",
        value: 0
      },
      ...db.logs
    ];

    updateDB({
      ...db,
      customers: updatedCustomers,
      logs: newLogs
    });
  };

  const getTier = (pointsValue: number) => {
    if (pointsValue >= 500) return { name: isRtl ? "بلاتيني" : "Platinum", color: "bg-purple-50 text-purple-700 border-purple-200" };
    if (pointsValue >= 300) return { name: isRtl ? "ذهبي" : "Gold", color: "bg-amber-50 text-amber-700 border-amber-200" };
    return { name: isRtl ? "فضي" : "Silver", color: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 text-start">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-700" />
            <span>{t("pageTitleCustomers")}</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {t("subCustomers")}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? "إضافة عميل جديد" : "Add B2B Member"}</span>
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Members */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              {t("registeredMembers")}
            </span>
            <span className="text-2xl font-black text-slate-800 block mt-1">
              {totalCustomers}
            </span>
            <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
              100% {t("activeTier")}
            </span>
          </div>
        </div>

        {/* Avg loyalty points */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              {t("avgLoyaltyBalance")}
            </span>
            <span className="text-2xl font-black text-slate-800 block mt-1">
              {avgPoints.toFixed(0)} pts
            </span>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
              {t("redeemableCheck")}
            </span>
          </div>
        </div>

        {/* Total shared points */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              {t("totalSharedPoints")}
            </span>
            <span className="text-2xl font-black text-slate-800 block mt-1">
              {totalPoints}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
              Across live registers
            </span>
          </div>
        </div>

      </div>

      {/* FILTER SEARCH */}
      <div className="flex justify-end items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={isRtl ? "ابحث بالاسم أو البريد الإلكتروني..." : "Search members database..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="px-6 py-3.5 text-start">B2B Member Name</th>
                <th className="px-6 py-3.5 text-start">Email Address</th>
                <th className="px-6 py-3.5 text-center">Loyalty Points</th>
                <th className="px-6 py-3.5 text-center">{t("loyaltyTier")}</th>
                <th className="px-6 py-3.5 text-center">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No customers found matching the search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  const tier = getTier(c.points || 0);
                  const isDefault = c.email === "walkin@retailiq.com";

                  return (
                    <tr key={c.email} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-md border border-slate-200/50">👤</span>
                        <span className="font-bold text-slate-800">{c.name}</span>
                      </td>
                      <td className="px-6 py-3.5 text-start font-mono text-slate-500">{c.email}</td>
                      <td className="px-6 py-3.5 text-center font-black text-slate-800">{c.points || 0} pts</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${tier.color}`}>
                          {tier.name}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {!isDefault ? (
                          <button
                            onClick={() => handleDeleteCustomer(c.email, c.name)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold italic">Default Preset</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <h3 className="font-black text-slate-900 text-md tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>{isRtl ? "إضافة عضو جديد للولاء" : "Create Loyalty Member Profile"}</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="flex flex-col gap-4 text-start">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="johndoe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Starting Loyalty Points
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer"
                  >
                    {t("discardFormBtn")}
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2.5 cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    Confirm & Save
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
