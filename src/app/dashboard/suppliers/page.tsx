"use client";

import React, { useState } from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { Truck, Search, Plus, Trash2, Mail, Clock, RefreshCw, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Supplier {
  id: string;
  agency: string;
  category: string;
  manager: string;
  email: string;
  leadTime: string;
}

export default function SuppliersPage() {
  const { db, updateDB } = useDatabase();
  const { t, isRtl } = useI18n();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState<Supplier | null>(null);
  const [restockQty, setRestockQty] = useState(50);

  // Default suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: "s1", agency: "Alpha Electronics Supply", category: "Electronics", manager: "Marcus Vance", email: "alpha@supply.com", leadTime: "3 days" },
    { id: "s2", agency: "Apex Fabrics Co.", category: "Apparel", manager: "Helena Rostova", email: "apex@fabrics.co", leadTime: "5 days" },
    { id: "s3", agency: "Prestige Diamonds", category: "Jewelry", manager: "Sarah Jenkins", email: "prestige@diamonds.com", leadTime: "7 days" }
  ]);

  // Form State
  const [agency, setAgency] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [manager, setManager] = useState("");
  const [email, setEmail] = useState("");
  const [leadTime, setLeadTime] = useState("3 days");

  const filteredSuppliers = suppliers.filter(s =>
    s.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !manager || !email) {
      alert("Please provide agency, manager, and email.");
      return;
    }

    const newSupplier: Supplier = {
      id: `s-${Date.now()}`,
      agency,
      category,
      manager,
      email,
      leadTime
    };

    setSuppliers(prev => [...prev, newSupplier]);

    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: `B2B Supplier channel registered for ${agency} (${category}).`,
        channel: "Suppliers",
        value: 0
      },
      ...db.logs
    ];
    updateDB({ ...db, logs: newLogs });

    setAgency("");
    setManager("");
    setEmail("");
    setLeadTime("3 days");
    setShowAddModal(false);
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    if (!confirm(isRtl ? `هل أنت متأكد من إلغاء تعاقد المورد ${name}؟` : `Are you sure you want to cancel the contract with ${name}?`)) return;
    setSuppliers(prev => prev.filter(s => s.id !== id));

    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: `Supplier channel ${name} terminated from active directories.`,
        channel: "Suppliers",
        value: 0
      },
      ...db.logs
    ];
    updateDB({ ...db, logs: newLogs });
  };

  const handleTriggerPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRestockModal) return;

    // Trigger Restocking Purchase Order (PO)
    // Increases inventory stock of all items under the supplier's category
    const targetCategory = showRestockModal.category;

    const updatedProducts = db.products.map(p => {
      if (p.category === targetCategory) {
        return {
          ...p,
          stock: p.stock + Number(restockQty)
        };
      }
      return p;
    });

    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: `Purchase Order PO Restocked: Added +${restockQty} units to all items in ${targetCategory} category via ${showRestockModal.agency}.`,
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

    alert(isRtl 
      ? `تم تفعيل أمر الشراء PO بنجاح! تم إضافة +${restockQty} وحدة لجميع منتجات قسم: ${targetCategory}.`
      : `Purchase Order PO triggered successfully! Added +${restockQty} units to all items in category: ${targetCategory}.`);

    setShowRestockModal(null);
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 text-start">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-slate-700" />
            <span>{t("pageTitleSuppliers")}</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {t("subSuppliers")}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? "تسجيل مورد جديد" : "Add Supplier Agency"}</span>
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Suppliers counts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              Active Contracts
            </span>
            <span className="text-2xl font-black text-slate-800 block mt-1">
              {suppliers.length} channels
            </span>
            <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
              Reconciled pipelines
            </span>
          </div>
        </div>

        {/* Restock Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              Urgent Replenishments
            </span>
            <span className="text-2xl font-black text-red-600 block mt-1">
              {db.products.filter(p => p.stock <= 9).length} items
            </span>
            <span className="text-[9px] text-red-400 font-bold block mt-0.5">
              Requires immediate PO
            </span>
          </div>
        </div>

        {/* Lead Delivery Avg */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              Average Lead Shipping
            </span>
            <span className="text-2xl font-black text-slate-800 block mt-1">
              5.0 days
            </span>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
              Global supply speed
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
            placeholder={isRtl ? "ابحث بالوكالة أو القسم..." : "Search suppliers catalog..."}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* SUPPLIERS DIRECTORY TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="px-6 py-3.5 text-start">{t("supplierAgency")}</th>
                <th className="px-6 py-3.5 text-center">{t("suppliedCategory")}</th>
                <th className="px-6 py-3.5 text-start">Contact Agent</th>
                <th className="px-6 py-3.5 text-center">{t("leadShippingTime")}</th>
                <th className="px-6 py-3.5 text-center">B2B Purchase Operations</th>
                <th className="px-6 py-3.5 text-center">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No suppliers found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(s => {
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-md border border-slate-200/50">🏢</span>
                        <div className="text-start">
                          <span className="font-bold text-slate-800 leading-tight block">{s.agency}</span>
                          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                          {s.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-start text-slate-700 font-bold">{s.manager}</td>
                      <td className="px-6 py-3.5 text-center font-black text-slate-600">{s.leadTime}</td>
                      <td className="px-6 py-3.5 text-center">
                        <button
                          onClick={() => {
                            setRestockQty(50);
                            setShowRestockModal(s);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-black hover:bg-blue-600 hover:text-white transition-all text-[10px] cursor-pointer"
                        >
                          Trigger RESTOCK PO
                        </button>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <button
                          onClick={() => handleDeleteSupplier(s.id, s.agency)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. ADD SUPPLIER FORM OVERLAY */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 animate-all"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <h3 className="font-black text-slate-900 text-md tracking-tight flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>{isRtl ? "تسجيل تعاقد مورد جديد" : "Create Supplier Contract"}</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddSupplier} className="flex flex-col gap-4 text-start">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Agency Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="e.g. Prestige Supplies"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Supplied Category
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Lead Shipping Time
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                      placeholder="e.g. 5 days"
                      value={leadTime}
                      onChange={(e) => setLeadTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Contact Agent Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="e.g. Helena Vance"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="supplier@agency.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    Confirm Supplier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. TRIGGER RESTOCK PURCHASE ORDER FORM OVERLAY */}
      <AnimatePresence>
        {showRestockModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <h3 className="font-black text-slate-900 text-md tracking-tight flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  <span>Trigger Restock Purchase Order (PO)</span>
                </h3>
                <button onClick={() => setShowRestockModal(null)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleTriggerPO} className="flex flex-col gap-4 text-start">
                <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 text-xs font-semibold text-slate-500 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span>Supplier Agency:</span>
                    <strong className="text-slate-800">{showRestockModal.agency}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Segment Category:</span>
                    <strong className="text-slate-800">{showRestockModal.category}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Speed Time:</span>
                    <strong className="text-blue-600">{showRestockModal.leadTime}</strong>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Quantity per Item (Restock Allocation Qty)
                  </label>
                  <input
                    type="number"
                    min={10}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                  />
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                    This will instantly replenish all items belonging to the {showRestockModal.category} catalog segment by +{restockQty} units!
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRestockModal(null)}
                    className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer"
                  >
                    Cancel PO
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2.5 cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    Confirm & Send Purchase Order
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
