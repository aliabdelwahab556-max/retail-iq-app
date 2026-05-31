"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { useDatabase } from "@/context/DatabaseContext";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronLeft } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();
  const { db, updateDB, loginWithGoogle } = useDatabase();
  const [email, setEmail] = useState("ahmed@retailiq.com");
  const [password, setPassword] = useState("password123");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    executeMockSession(email);
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        executeMockSession(result.name);
      }
    } catch (err) {
      console.error("Authentication popup failed:", err);
      executeMockSession("Ahmed");
    }
  };

  const executeMockSession = (usernameInput: string) => {
    // Dynamic naming resolution
    const managerName = usernameInput.includes("@") ? usernameInput.split("@")[0] : usernameInput;
    
    // Save to global context state database
    const updatedSettings = {
      ...db.settings,
      managerName: managerName.charAt(0).toUpperCase() + managerName.slice(1)
    };
    
    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: `${updatedSettings.managerName} login session established successfully via Google OAuth.`,
        channel: "Security",
        value: 0
      },
      ...db.logs
    ];

    updateDB({
      ...db,
      settings: updatedSettings,
      logs: newLogs
    });

    // Route directly to operational workspace dashboard!
    router.push("/dashboard");
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-6 ${isRtl ? "text-right" : "text-left"}`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 flex flex-col gap-6"
      >
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              IQ
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">RetailIQ</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            {authMode === "login" ? t("authTitleWelcome") : t("pricingStarterDesc")}
          </h2>
          <p className="text-xs text-slate-500 font-semibold max-w-xs">
            {authMode === "login" ? t("authSubtitle") : t("authToggleMsg")}
          </p>
        </div>

        {/* Social Onboarding */}
        <button
          onClick={handleGoogleAuth}
          className="w-full inline-flex items-center justify-center gap-3 border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 py-3.5 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.68 14.97 1 12 1 7.37 1 3.4 3.66 1.39 7.56l3.87 3c.96-2.88 3.66-5.52 6.74-5.52z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2 3.7-5.02 3.7-8.62z"
            />
            <path
              fill="#FBBC05"
              d="M5.26 14.56c-.25-.75-.39-1.55-.39-2.38s.14-1.63.39-2.38l-3.87-3C.54 8.44 0 10.16 0 12s.54 3.56 1.39 5.2l3.87-3.04z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.04.7-2.37 1.12-4.23 1.12-3.08 0-5.78-2.64-6.74-5.52l-3.87 3C3.4 20.34 7.37 23 12 23z"
            />
          </svg>
          <span>{t("googleAuth")}</span>
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider before:content-[''] before:flex-1 before:border-b before:border-slate-100 before:mr-3 after:content-[''] after:flex-1 after:border-b after:border-slate-100 after:ml-3">
          {t("dividerText")}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              {t("authEmail")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-800 transition-all shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              {t("authPassword")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-800 transition-all shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 mt-2 transition-all cursor-pointer"
          >
            {authMode === "login" ? t("authButton") : t("startTrial")}
          </button>
        </form>

        {/* Footer toggles */}
        <div className="flex flex-col gap-3 text-center mt-2">
          <div className="text-xs text-slate-500 font-semibold">
            <span>{authMode === "login" ? t("authToggleMsg") : t("signin")}</span>{" "}
            <button
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              className="text-blue-600 hover:underline font-bold"
            >
              {authMode === "login" ? t("startTrial") : t("signin")}
            </button>
          </div>
          
          <button
            onClick={() => router.push("/")}
            className="text-[11px] text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center gap-1 mt-2 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{t("backToLanding")}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
