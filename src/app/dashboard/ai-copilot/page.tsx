"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDatabase } from "@/context/DatabaseContext";
import { useI18n } from "@/hooks/useI18n";
import { Sparkles, Send, Bot, User, CornerDownLeft, AlertCircle } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export default function AiCopilotPage() {
  const { db } = useDatabase();
  const { t, isRtl } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: isRtl 
        ? "أهلاً بك في مستشار RetailIQ الذكي! يمكنني إجابتك عن أي تفاصيل تخص متجرك الحالي، المبيعات، المخزون، أو حساب الأرباح والخسائر. كيف أساعدك اليوم؟" 
        : "Hello! I am your RetailIQ AI Advisor. Ask me anything about your current live sales, stock alerts, gross margins, or operational carry-costs.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    const newMsg: Message = {
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    // Compute actual B2B database parameters for contextual intelligence
    const cSymbol = db.settings.currency;
    const dynamicSalesTotal = db.orders.reduce((sum, o) => sum + o.total, 0);
    const totalRevenue = (28540.00 - 870.00) + dynamicSalesTotal;
    const lowStockItems = db.products.filter(p => p.stock <= 9).map(p => p.name).join(", ");
    const bestSelling = [...db.products].sort((a,b) => b.sold - a.sold)[0]?.name || "None";
    const netProfit = (7432.00 - 495.00) + db.orders.reduce((sum, o) => sum + (o.total * 0.26), 0) - 1100.00;

    const systemPrompt = `You are the RetailIQ AI Business Intelligence Assistant. You are currently connected to the live database of the merchant's retail operating system.
        Here is the actual database state to answer questions accurately:
        - Merchant Manager Name: ${db.settings.managerName}
        - Base Currency: ${cSymbol}
        - Total Sales Revenue: ${cSymbol}${totalRevenue.toFixed(2)}
        - Net Profit (Consolidated): ${cSymbol}${netProfit.toFixed(2)}
        - Low stock products (under 9 units remaining): [${lowStockItems}]
        - Best Selling Product: ${bestSelling}
        - Active Plan: ${db.settings.activePlan}
        - Damaged freight carrying loss: ${cSymbol}1,100.00 (freight damage to a Diamond Ring)
        - Connected to Shopify e-commerce: ${db.shopifyConnected ? "Yes" : "No"}

        Keep responses business-focused, professional, extremely helpful, concise, and calm. Support bilingual queries (English or Arabic). If the user asks in Arabic, reply in Cairo dialect Arabic.
        When asked to generate a product description, draft a highly compelling marketing description suitable for e-commerce.
        When asked to analyze sales/margins, offer a structured breakdown of revenues, net profits, margins, best sellers, and actions to take.`;

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          userText,
          modelName: db.settings.geminiModel || "gemini-1.5-flash",
          userApiKey: db.settings.geminiApiKey || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === "no_key") {
          // No key configured anywhere — silently use local intelligence
          setTimeout(() => {
            triggerFallback(userText);
            setLoading(false);
          }, 1000);
          return;
        }
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      console.error("Gemini API call error:", err);
      setMessages(prev => [...prev, {
        sender: "bot",
        text: isRtl
          ? `حدث خطأ أثناء الاتصال بـ Gemini API: ${err.message || err}. سأقوم بالرد عليك باستخدام المحلل الذكي الداخلي للمستودع.`
          : `Failed to call Gemini API: ${err.message || err}. Falling back to internal warehouse intelligence analyzer.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      triggerFallback(userText);
    } finally {
      setLoading(false);
    }
  };

  const triggerFallback = (userText: string) => {
    const query = userText.toLowerCase();
    const cSymbol = db.settings.currency;
    const dynamicSalesTotal = db.orders.reduce((sum, o) => sum + o.total, 0);
    const totalRevenue = (28540.00 - 870.00) + dynamicSalesTotal;
    const lowStockItems = db.products.filter(p => p.stock <= 9).map(p => p.name).join(", ");
    const bestSelling = [...db.products].sort((a,b) => b.sold - a.sold)[0]?.name || "None";
    const netProfit = (7432.00 - 495.00) + db.orders.reduce((sum, o) => sum + (o.total * 0.26), 0) - 1100.00;

    let responseText = "";

    if (isRtl) {
      if (query.includes("وصف") || query.includes("اكتب") || query.includes("description")) {
        responseText = `📝 **وصف تسويقي مقترح للمنتج (Fallback):**\nمنتج استثنائي يجمع بين المتانة والتصميم العصري الأنيق. تم تصنيعه باستخدام خامات عالية الجودة لضمان أداء مستدام، وهو الرفيق المثالي لأسلوب حياتك اليومي. \n\n*ملاحظة: يرجى تفعيل مفتاح Gemini API للحصول على أوصاف ذكية ومخصصة بالكامل.*`;
      } else if (query.includes("تحليل") || query.includes("أرباح") || query.includes("ربح") || query.includes("profit")) {
        responseText = `📊 **تحليل الأرباح والمبيعات الموحد:**\n- إجمالي المبيعات الموحدة: **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n- صافي الأرباح التشغيلية: **${cSymbol}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n- نسبة هامش الربح التقريبية: **26%** من إجمالي المبيعات.\n- المنتج الأكثر مبيعاً: **${bestSelling}**.\n- حالة المخزون: يوجد سلع ناقصة بحاجة لإعادة تعبئة (**${lowStockItems || "لا يوجد"}**).`;
      } else if (query.includes("مخزن") || query.includes("بضاعة") || query.includes("stock") || query.includes("نقص")) {
        responseText = db.products.filter(p => p.stock <= 9).length > 0 
          ? `السلع التي أوشكت على النفاد حالياً هي: **${lowStockItems}**. يوصى بشدة بالتنسيق مع الموردين المعنيين لإرسال أوامر توريد جديدة لتجنب أي توقف.`
          : `مستويات المخزون لديك ممتازة! لا توجد حالياً أي منتجات تحت حد الأمان التشغيلي.`;
      } else if (query.includes("إيراد") || query.includes("مبيعات") || query.includes("revenue")) {
        responseText = `إجمالي مبيعات وإيرادات المتجر الموحدة (POS + شوبيفاي) تبلغ **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**. السلعة الأكثر طلباً وسحباً هي **${bestSelling}**.`;
      } else {
        responseText = `لقد قمت بتحليل استفسارك عن "${userText}". إيراداتك الإجمالية تبلغ **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**، وصافي الأرباح **${cSymbol}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}**. السلعة الأفضل مبيعاً هي **${bestSelling}**، وهناك سلع ناقصة: **[${lowStockItems}]**.`;
      }
    } else {
      if (query.includes("description") || query.includes("write") || query.includes("generate")) {
        responseText = `📝 **Suggested Marketing Description (Fallback):**\nAn exceptional product combining durablity with sleek modern aesthetics. Engineered using premium materials to ensure high performance, it is the perfect companion for your daily needs. \n\n*Note: Please configure a Gemini API key in Settings to unlock custom generative AI descriptions.*`;
      } else if (query.includes("analyze") || query.includes("profit") || query.includes("earn")) {
        responseText = `📊 **Sales & Margin Analysis:**\n- Combined Revenue: **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n- Net Operating Profit: **${cSymbol}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n- Profit Margin: approx. **26%** of total turnover.\n- Top Selling Item: **${bestSelling}**.\n- Low Stock Warning: **[${lowStockItems || "None"}]**.`;
      } else if (query.includes("stock") || query.includes("inventory") || query.includes("low")) {
        responseText = db.products.filter(p => p.stock <= 9).length > 0
          ? `The following products are currently low in stock: **${lowStockItems}**. Consider scheduling a restocking order PO soon.`
          : `All inventory stocks are healthy. No items are currently under the warning threshold of 9 units.`;
      } else if (query.includes("revenue") || query.includes("sales")) {
        responseText = `Your total combined revenue stands at **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**. The top-selling product in your catalog is **${bestSelling}**.`;
      } else {
        responseText = `Based on your live store state, your total revenue is **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}** with a net profit of **${cSymbol}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}**. The best selling item is **${bestSelling}**, and the low stock entries are **[${lowStockItems}]**.`;
      }
    }

    setMessages(prev => [...prev, {
      sender: "bot",
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6 text-slate-800">
      
      {/* HEADER SEGMENT */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 text-start">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
            <span>{t("menuAiInsights")}</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {isRtl 
              ? "مستشارك الافتراضي المتكامل للإجابة الفورية وتحليل البيانات وحسابات الدفتر المالي الموحد."
              : "Ask questions, explore sales indexes, get stock alerts, and forecast margins using direct catalog analytics."}
          </p>
        </div>

        {!db.settings.geminiApiKey && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/80 rounded-xl px-3 py-1.5 text-[10px] text-blue-700 font-bold self-start">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isRtl ? "مستشار ذكي داخلي (أدخل مفتاح Gemini في الإعدادات للتفعيل السحابي)" : "Using local intelligence (Add Gemini Key in settings for live NLP)"}</span>
          </div>
        )}
      </div>

      {/* MESSAGES INTERACTIVE CHAT PANEL */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Chat Scroll container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === "bot";
            return (
              <div key={idx} className={`flex gap-3 max-w-[80%] ${isBot ? "self-start text-start" : "self-end flex-row-reverse text-start"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isBot ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="flex flex-col gap-1">
                  <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed font-semibold ${isBot ? "bg-slate-50 border border-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-md shadow-blue-500/10"}`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold px-2 self-start">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex gap-3 self-start text-start">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl px-4 py-3 text-xs font-semibold">
                {isRtl ? "جاري تدقيق البيانات..." : "Consulting warehouse ledger database state..."}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setInput(isRtl ? "قم بتحليل المبيعات والأرباح لمتجري" : "Analyze my sales and margins");
            }}
            disabled={loading}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-100 cursor-pointer disabled:opacity-50 transition-all text-start"
          >
            {isRtl ? "📊 تحليل المبيعات والأرباح" : "📊 Analyze sales & margins"}
          </button>
          <button
            type="button"
            onClick={() => {
              setInput(isRtl ? "اكتب وصفاً تسويقياً احترافياً لمنتج: " : "Generate a professional product description for: ");
            }}
            disabled={loading}
            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-100 cursor-pointer disabled:opacity-50 transition-all text-start"
          >
            {isRtl ? "✍️ توليد وصف منتج" : "✍️ Generate description"}
          </button>
        </div>

        {/* INPUT FORM PANEL */}
        <form onSubmit={handleSend} className="border-t border-slate-200 p-4 bg-slate-50 flex gap-3 items-center w-full">
          <input
            type="text"
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            placeholder={isRtl ? "اسأل المستشار الذكي عن أي شيء... (مثال: ما هو صافي الأرباح؟)" : "Ask your AI Advisor... (e.g., what is the total profit?)"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-md ${!input.trim() || loading ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10"}`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
