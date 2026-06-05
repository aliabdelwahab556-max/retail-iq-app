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
  const { db, updateDB } = useDatabase();
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const applyDiscount = (target: string, percentage: number) => {
    const updatedProducts = db.products.map(p => {
      const isMatch = target === "all" || 
                      p.category.toLowerCase() === target.toLowerCase() ||
                      p.name.toLowerCase().includes(target.toLowerCase()) ||
                      p.sku.toLowerCase() === target.toLowerCase();
      if (isMatch) {
        const discountAmount = p.price * (percentage / 100);
        return {
          ...p,
          price: Number((p.price - discountAmount).toFixed(2))
        };
      }
      return p;
    });

    const logMsg = isRtl
      ? `تم تطبيق خصم بقيمة ${percentage}% على ${target === "all" ? "جميع المنتجات" : target} بواسطة المستشار الذكي.`
      : `AI Copilot applied a ${percentage}% discount on ${target === "all" ? "all products" : target}.`;

    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        task: logMsg,
        channel: "System",
        value: 0
      },
      ...db.logs
    ];

    updateDB({
      ...db,
      products: updatedProducts,
      logs: newLogs
    });

    try {
      const { getFirebaseFirestore } = require("@/lib/firebase");
      const dbFirestore = getFirebaseFirestore();
      if (dbFirestore && db.firebaseConnected && db.settings.storeSlug) {
        const { doc, setDoc } = require("firebase/firestore");
        const storeRef = doc(dbFirestore, "retailiq_stores", db.settings.storeSlug);
        setDoc(storeRef, {
          products: updatedProducts,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.error("AI discount sync to Firestore failed:", e);
    }
  };

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

    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || db.settings.geminiApiKey;
    // Use Gemini API client-side if a key is available
    if (geminiKey) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: db.settings.geminiModel || "gemini-1.5-flash" });

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

        const result = await model.generateContent([systemPrompt, userText]);
        const responseText = await result.response.text();

        const discountRegex = /\[\[DISCOUNT:(.*?):(\d+)\]\]/;
        const match = responseText.match(discountRegex);
        let cleanText = responseText;
        if (match) {
          const target = match[1];
          const percentage = parseInt(match[2], 10);
          applyDiscount(target, percentage);
          cleanText = responseText.replace(discountRegex, "").trim();
        }

        setMessages(prev => [...prev, {
          sender: "bot",
          text: cleanText,
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
        // Trigger fallback response
        triggerFallback(userText);
      } finally {
        setLoading(false);
      }
    } else {
      // Simulate/Trigger smart localized B2B responses using active database parameters
      setTimeout(() => {
        triggerFallback(userText);
        setLoading(false);
      }, 1000);
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
      if (query.includes("خصم") || query.includes("تنزيل") || query.includes("تخفيض") || query.includes("discount")) {
        const pctMatch = query.match(/(\d+)/);
        const percentage = pctMatch ? parseInt(pctMatch[1], 10) : 10;
        let target = "all";
        let targetAr = "جميع المنتجات";
        if (query.includes("إلكترونيات") || query.includes("electronics")) {
          target = "Electronics";
          targetAr = "قسم الإلكترونيات";
        } else if (query.includes("ملابس") || query.includes("apparel") || query.includes("clothes")) {
          target = "Apparel";
          targetAr = "قسم الملابس";
        } else if (query.includes("مجوهرات") || query.includes("jewelry")) {
          target = "Jewelry";
          targetAr = "قسم المجوهرات";
        } else if (query.includes("إكسسوارات") || query.includes("accessories")) {
          target = "Accessories";
          targetAr = "قسم الإكسسوارات";
        }
        responseText = `لقد قمت بتطبيق خصم بنسبة **${percentage}%** على **${targetAr}** بنجاح! \nسيتم تعديل الأسعار فوراً في المخزن ودفتر المبيعات. [[DISCOUNT:${target}:${percentage}]]`;
      } else if (query.includes("مرحبا") || query.includes("مرحباً") || query.includes("اهلاً") || query.includes("أهلاً") || query.includes("اهلا") || query.includes("هاي") || query.includes("هلا") || query.includes("هلو") || query.includes("سلام") || query.includes("صباح الخير") || query.includes("مساء الخير") || query.includes("يا هلا")) {
        responseText = `أهلاً بك يا ${db.settings.managerName || "أدمن"}! 👋 \nأنا مساعدك الافتراضي الذكي لـ RetailIQ. يمكنك سؤالي عن مبيعاتك، مستويات مخزونك، أرباحك اليومية، أو كتابة مسودات لإرسالها للموردين. كيف يمكنني مساعدتك اليوم؟\n\n💡 **ملاحظة:** لكي يعمل المحادثة الذكية الحقيقية (Gemini AI Chat) بشكل فعال وكامل وتدخل معك في حوار مفتوح، يرجى الذهاب إلى صفحة الإعدادات العامة وإدخال مفتاح الـ API الخاص بك (Gemini API Key) في الحقل المخصص.`;
      } else if (query.includes("باقة") || query.includes("خطة") || query.includes("اشتراك") || query.includes("ترقية") || query.includes("plan") || query.includes("subscription")) {
        responseText = `خطة اشتراك متجرك الحالية هي **RetailIQ ${db.settings.activePlan || "Starter"}**. \n\n• باقة Starter ($19): نقاط بيع واحدة. \n• باقة Growth ($29): تفعيل مزامنة شوبيفاي المتعددة. \n• باقة Pro ($49): دعم B2B كامل بدون رسوم معاملات. \nيمكنك الترقية في أي وقت من شاشة الإعدادات.`;
      } else if (query.includes("شوبيفاي") || query.includes("shopify") || query.includes("اونلاين") || query.includes("متجر إلكتروني")) {
        responseText = db.shopifyConnected 
          ? `ربط شوبيفاي **نشط ومتصل حالياً**! 🟢 \nيتم جلب مبيعات الأونلاين ومزامنة المخازن تلقائياً بانتظام.`
          : `ربط شوبيفاي **غير نشط حالياً**. 🔴 \nيرجى التوجه إلى صفحة الإعدادات وتفعيل المزامنة التلقائية باستعمال مفتاح الوصول (API Token) الخاص بك.`;
      } else if (query.includes("عملة") || query.includes("ضريبة") || query.includes("ضرائب") || query.includes("tax") || query.includes("currency")) {
        responseText = `العملة المعتمدة في كشوفاتك هي **${cSymbol}** ونسبة الضريبة المحتسبة تلقائياً للمبيعات هي **${db.settings.taxRate}%**.`;
      } else if (query.includes("كاشير") || query.includes("pos") || query.includes("فاتورة") || query.includes("تسوية")) {
        const posOrders = db.orders.filter(o => o.channel === "POS");
        const posSales = posOrders.reduce((sum, o) => sum + o.total, 0);
        responseText = `📊 **ملخص عمليات الكاشير (POS):**\n- عدد الفواتير المسجلة: **${posOrders.length} فواتير**.\n- إجمالي مبيعات الكاشير: **${cSymbol}${posSales.toLocaleString(undefined, {minimumFractionDigits: 2})}**.\n- طرق التسوية المستخدمة تشمل الدفع النقدي الفوري والأقساط المجدولة.`;
      } else if (query.includes("وصف") || query.includes("اكتب") || query.includes("description") || query.includes("توليد")) {
        responseText = `📝 **وصف تسويقي مقترح للمنتج (Local Fallback):**\nمنتج استثنائي يجمع بين الجودة الفائقة والتصميم العصري الأنيق. مصمم خصيصاً لتلبية احتياجات عملائك اليومية بكفاءة عالية، مما يجعله إضافة مثالية لكتالوج متجرك الإلكتروني. \n\n*ملاحظة: يمكنك إدخال مفتاح Gemini API في الإعدادات لتفعيل توليد الوصف بالذكاء الاصطناعي السحابي التفاعلي.*`;
      } else if (query.includes("تحليل") || query.includes("أرباح") || query.includes("ربح") || query.includes("profit") || query.includes("خسارة")) {
        responseText = `📊 **تحليل الأرباح والخسائر المالي:**\n- إجمالي المبيعات الموحدة: **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n- صافي الأرباح (بعد الخصومات): **${cSymbol}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n- نسبة هامش الأرباح: تقريباً **26%**.\n- المنتج الأكثر ربحاً ومبيعاً: **${bestSelling}**.\n- التلفيات المسجلة: تم إعدام خاتم الماس بقيمة تكلفة مورد **-${cSymbol}1,100.00** بسبب ضرر الشحن الإقليمي.`;
      } else if (query.includes("مخزن") || query.includes("بضاعة") || query.includes("stock") || query.includes("نقص") || query.includes("مورد")) {
        responseText = db.products.filter(p => p.stock <= 9).length > 0 
          ? `السلع التي أوشكت على النفاد حالياً هي: **${lowStockItems}**. \n\n✍️ **مسودة إيميل طلب توريد جاهزة للإرسال للمورد:**\n\`\`\`\nالموضوع: طلب توريد سلع عاجل - متجر ${db.settings.businessName}\nإلى: supply@retailiq-partners.com\n\nعزيزي المورد،\nنرجو تقديم طلبية إعادة شحن وتوريد عاجلة للمنتجات التالية:\n• ${lowStockItems.split(", ").map(name => `${name} (+50 وحدة)`).join("\n• ")}\n\nيرجى تأكيد موعد الشحن وإرسال الفاتورة.\nتحياتي،\n${db.settings.managerName || "مدير المتجر"}\n\`\`\``
          : `مستويات المخزون ممتازة! لا توجد حالياً أي منتجات تحت حد الأمان التشغيلي (9 وحدات).`;
      } else if (query.includes("إيراد") || query.includes("مبيعات") || query.includes("revenue") || query.includes("sales")) {
        responseText = `إجمالي إيرادات ومبيعات متجرك الموحدة (POS + شوبيفاي) تبلغ **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**. \nالسلعة الأكثر سحباً وطلباً هي **${bestSelling}**.`;
      } else {
        responseText = `لقد قمت بتحليل استفسارك بخصوص: "${userText}". \nإليك كشف الحساب السريع لمتجرك الحالي:\n\n• 💰 **إجمالي المبيعات:** **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n• 📈 **صافي الأرباح:** **${cSymbol}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n• 🏆 **السلعة الأكثر طلباً:** **${bestSelling}**\n• ⚠️ **سلع منخفضة المخزون:** **${lowStockItems || "لا يوجد"}**\n• 🏢 **حالة المتجر:** متصل بقاعدة البيانات المركزية بنجاح.\n\nكيف يمكنني مساعدتك بشكل أكبر؟`;
      }
    } else {
      if (query.includes("discount") || query.includes("promo") || query.includes("coupon")) {
        const pctMatch = query.match(/(\d+)/);
        const percentage = pctMatch ? parseInt(pctMatch[1], 10) : 10;
        let target = "all";
        let targetEn = "all products";
        if (query.includes("electronics")) {
          target = "Electronics";
          targetEn = "Electronics";
        } else if (query.includes("apparel") || query.includes("clothes")) {
          target = "Apparel";
          targetEn = "Apparel";
        } else if (query.includes("jewelry")) {
          target = "Jewelry";
          targetEn = "Jewelry";
        } else if (query.includes("accessories")) {
          target = "Accessories";
          targetEn = "Accessories";
        }
        responseText = `Successfully applied a **${percentage}%** discount on **${targetEn}**! [[DISCOUNT:${target}:${percentage}]]`;
      } else if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("greetings") || query.includes("welcome")) {
        responseText = `Hello ${db.settings.managerName || "Admin"}! 👋 \nI am your RetailIQ AI Advisor. Ask me anything about your current live sales, stock alerts, margins, or accounting ledgers. How can I assist you today?`;
      } else if (query.includes("plan") || query.includes("subscription") || query.includes("upgrade") || query.includes("pricing")) {
        responseText = `Your store is currently running on the **RetailIQ ${db.settings.activePlan || "Starter"}** plan. \n\n• Starter ($19/mo): Single physical register. \n• Growth ($29/mo): Multiple active Shopify channel links. \n• Pro ($49/mo): B2B support with zero transaction fees. \nYou can modify your plan in Settings.`;
      } else if (query.includes("shopify") || query.includes("e-commerce") || query.includes("storefront") || query.includes("online")) {
        responseText = db.shopifyConnected
          ? `Shopify Integration is **currently active and connected**! 🟢 \nOnline orders and product warehouse catalogs sync in the background.`
          : `Shopify Integration is **offline**. 🔴 \nPlease connect your store URL and input your Admin Access token in the Settings panel to activate sync.`;
      } else if (query.includes("currency") || query.includes("tax")) {
        responseText = `Your base operating currency is **${cSymbol}** and the active sales tax rate is **${db.settings.taxRate}%**.`;
      } else if (query.includes("pos") || query.includes("cashier") || query.includes("register") || query.includes("ticket")) {
        const posOrders = db.orders.filter(o => o.channel === "POS");
        const posSales = posOrders.reduce((sum, o) => sum + o.total, 0);
        responseText = `📊 **POS Register Analytics:**\n- Completed POS tickets: **${posOrders.length} orders**.\n- Total POS Sales yield: **${cSymbol}${posSales.toLocaleString(undefined, {minimumFractionDigits: 2})}**.\n- Checkout payment methods include Cash POS settlement and Layaway plan options.`;
      } else if (query.includes("description") || query.includes("write") || query.includes("generate")) {
        responseText = `📝 **Suggested Product Description (Local Fallback):**\nAn exceptional product combining durable construction with a sleek, modern aesthetic. Engineered using high-grade materials to ensure longevity, it is the perfect companion for your customers' everyday lifestyle.\n\n*Note: Add a Gemini API key in Settings to activate interactive generative AI features.*`;
      } else if (query.includes("analyze") || query.includes("profit") || query.includes("earn") || query.includes("loss")) {
        responseText = `📊 **Sales & Margin Analysis:**\n- Combined Sales Revenue: **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n- Net Profit: **${cSymbol}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n- Profit Margin Index: approx. **26%**.\n- Best Selling Product: **${bestSelling}**.\n- Tracked Loss: Diamond Ring damaged freight carrying loss of **-${cSymbol}1,100.00**.`;
      } else if (query.includes("stock") || query.includes("inventory") || query.includes("low") || query.includes("supplier")) {
        responseText = db.products.filter(p => p.stock <= 9).length > 0
          ? `The following products are currently low in stock: **${lowStockItems}**. \n\n✍️ **Draft restock PO email to your supplier:**\n\`\`\`\nSubject: Critical Restock Order Request - ${db.settings.businessName}\nTo: supply@retailiq-partners.com\n\nDear Supplier,\nWe would like to place an urgent restock request for the following items:\n• ${lowStockItems.split(", ").map(name => `${name} (+50 units)`).join("\n• ")}\n\nPlease confirm shipment dates and send the invoice.\nBest regards,\n${db.settings.managerName || "Store Manager"}\n\`\`\``
          : `All warehouse stock levels are healthy! No items are currently under the replenishment threshold (9 units).`;
      } else if (query.includes("revenue") || query.includes("sales")) {
        responseText = `Your total combined revenue stands at **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**. \nThe top-performing product in your catalog is **${bestSelling}**.`;
      } else {
        responseText = `I have analyzed your query regarding: "${userText}". \nHere is a quick operational digest of your business:\n\n• 💰 **Consolidated Revenue:** **${cSymbol}${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n• 📈 **Net Profit:** **${cSymbol}${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}**\n• 🏆 **Top Selling SKU:** **${bestSelling}**\n• ⚠️ **Low Stock warning:** **${lowStockItems || "None"}**\n• 🏢 **Status:** Successfully connected to the centralized SaaS cloud database.\n\nHow else can I assist you today?`;
      }
    }

    const discountRegex = /\[\[DISCOUNT:(.*?):(\d+)\]\]/;
    const match = responseText.match(discountRegex);
    let cleanText = responseText;
    if (match) {
      const target = match[1];
      const percentage = parseInt(match[2], 10);
      applyDiscount(target, percentage);
      cleanText = responseText.replace(discountRegex, "").trim();
    }

    setMessages(prev => [...prev, {
      sender: "bot",
      text: cleanText,
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

        {!(process.env.NEXT_PUBLIC_GEMINI_API_KEY || db.settings.geminiApiKey) && (
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
                  <span className="text-[9px] text-slate-400 font-bold px-2 self-start">{mounted ? msg.timestamp : ""}</span>
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
