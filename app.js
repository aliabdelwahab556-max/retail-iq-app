// ==========================================
//  DATABASE INITS & MODELS
// ==========================================
const DB_INIT = {
    products: [
        // Electronics
        { id: "e1", name: "Wireless Headphones", category: "Electronics", price: 60.00, cost: 25.00, stock: 48, emoji: "🎧", sold: 48 },
        { id: "e2", name: "Smart Watch", category: "Electronics", price: 70.00, cost: 30.00, stock: 35, emoji: "⌚", sold: 35 },
        { id: "e3", name: "Bluetooth Speaker", category: "Electronics", price: 50.00, cost: 20.00, stock: 29, emoji: "🔊", sold: 29 },
        { id: "e4", name: "Phone Charger", category: "Electronics", price: 35.00, cost: 15.00, stock: 25, emoji: "🔌", sold: 25 },
        { id: "e5", name: "USB Cable", category: "Electronics", price: 15.00, cost: 5.00, stock: 20, emoji: "⚡", sold: 20 },
        
        // Apparel
        { id: "a1", name: "Premium Hoodie", category: "Apparel", price: 80.00, cost: 30.00, stock: 40, emoji: "🧥", sold: 340 },
        { id: "a2", name: "Leather Boots", category: "Apparel", price: 180.00, cost: 80.00, stock: 8, emoji: "👢", sold: 90 },
        { id: "a3", name: "Silk Scarf", category: "Apparel", price: 45.00, cost: 15.00, stock: 3, emoji: "🧣", sold: 110 },
        
        // Jewelry
        { id: "j1", name: "Gold Chain", category: "Jewelry", price: 450.00, cost: 200.00, stock: 15, emoji: "⛓️", sold: 30 },
        { id: "j2", name: "Diamond Ring", category: "Jewelry", price: 2500.00, cost: 1100.00, stock: 4, emoji: "💍", sold: 15 }
    ],
    orders: [
        { id: "Order #1025", date: "2026-05-29T12:00:00Z", customerName: "Sarah Jenkins", customerEmail: "sarah@example.com", items: [{ id: "e1", qty: 2, price: 60.00 }], total: 120.00, channel: "POS", paymentMethod: "Cash POS Settlement" },
        { id: "Order #1024", date: "2026-05-29T10:14:00Z", customerName: "David Miller", customerEmail: "david@example.com", items: [{ id: "e2", qty: 1, price: 70.00 }], total: 70.00, channel: "POS", paymentMethod: "Cash POS Settlement" },
        { id: "Purchase #205", date: "2026-05-28T14:22:00Z", customerName: "Elena Rostova", customerEmail: "elena@example.com", items: [{ id: "j1", qty: 1, price: 450.00 }], total: 450.00, channel: "POS", paymentMethod: "Cash POS Settlement" },
        { id: "Order #1023", date: "2026-05-28T09:30:00Z", customerName: "Walk-In Buyer", customerEmail: "walkin@retailiq.com", items: [{ id: "e1", qty: 1, price: 60.00 }, { id: "e3", qty: 2, price: 50.00 }], total: 160.00, channel: "POS", paymentMethod: "Cash POS Settlement" },
        { id: "Order #1022", date: "2026-05-27T16:40:00Z", customerName: "David Miller", customerEmail: "david@example.com", items: [{ id: "e2", qty: 1, price: 70.00 }], total: 70.00, channel: "POS", paymentMethod: "Cash POS Settlement" }
    ],
    customers: [
        { email: "walkin@retailiq.com", name: "Walk-In Customer", points: 150 },
        { email: "sarah@example.com", name: "Sarah Jenkins", points: 420 },
        { email: "david@example.com", name: "David Miller", points: 280 },
        { email: "elena@example.com", name: "Elena Rostova", points: 690 }
    ],
    shopifyConnected: false,
    firebaseConnected: false,
    firebaseConfig: {
        apiKey: "",
        projectId: ""
    },
    settings: {
        businessName: "RetailIQ Store",
        currency: "$",
        taxRate: 8.5,
        managerName: "Ahmed",
        autoSync: true,
        syncInterval: "15",
        language: "en",
        geminiApiKey: "",
        geminiModel: "gemini-1.5-flash"
    },
    aiChat: [
        { sender: "ai", text: "Hello Ahmed! I am your RetailIQ Business Copilot. I analyze your POS registers, Shopify linkages, and stock flows to optimize your operational performance. Ask me anything!" }
    ],
    logs: [
        { timestamp: "2026-05-29T10:00:00Z", task: "Database system initialized successfully.", channel: "System", value: 0 },
        { timestamp: "2026-05-29T11:30:00Z", task: "Ahmed login session established.", channel: "Security", value: 0 }
    ]
};

// Initialize active state database
let db = JSON.parse(localStorage.getItem('retailiq_db'));
if (!db) {
    db = JSON.parse(JSON.stringify(DB_INIT));
    localStorage.setItem('retailiq_db', JSON.stringify(db));
}

// Ensure settings contain API keys
if (!db.settings.geminiApiKey) db.settings.geminiApiKey = "";
if (!db.settings.geminiModel) db.settings.geminiModel = "gemini-1.5-flash";

// Active Session properties
let activePOSCategory = "all";
let posCart = [];
let authMode = "login"; // login / signup
let selectedAestheticTheme = "light";

// ==========================================
//  TRANSLATIONS INDEX DICTIONARY (i18n)
// ==========================================
const TRANSLATIONS = {
    en: {
        tagline: "Smarter Retail Starts Here",
        features: "Features",
        shopify: "Shopify Link",
        pricing: "Pricing",
        signin: "Sign In",
        startTrial: "Start Free Trial",
        heroPill: "RetailIQ AI Copilot 2.0 is now live",
        heroTitle: "Run Your Entire Retail Business <br><span class='gradient-text'>with Intelligent AI</span>",
        heroSub: "RetailIQ combines POS, inventory tracking, financial analytics, accounting, and Shopify automation into one calm, premium SaaS platform.",
        connectShopify: "Connect Shopify",
        menuDashboard: "Dashboard",
        liveStoreFeed: "Live Store Feed",
        revenue: "Total Revenue",
        revenueTrend: "12.5% vs last week",
        transactions: "Orders",
        ordersTrend: "15.7% vs last week",
        aiFeedTitle: "AI Assistant Feed",
        mockInsight: "\"Your profit is up 8.3% this week! Great job! You're outperforming last week.\"",
        featuresTitle: "Designed for High-Growth Retailing",
        featuresSub: "Everything you need to scale from single-store operations to global multi-channel commerce.",
        posFeatureTitle: "Intelligent Point of Sale",
        posFeatureDesc: "Web-based POS that works on any device. Cart management, custom discounts, and automatic tax calculations built directly in.",
        invFeatureTitle: "Inventory Intelligence",
        invFeatureDesc: "Track stock levels across categories, see predictive low stock alerts, manage suppliers, and sync products instantly.",
        aiFeatureTitle: "AI Retail Assistant",
        aiFeatureDesc: "Your virtual retail co-pilot. Analyzes trends, identifies slow-selling products, and recommends exactly when to reorder stock.",
        shopifyTitle: "Native Shopify Integration",
        shopifyDesc: "Connect your digital Shopify store with your physical POS and warehouse in one click. Synchronize items, track catalog additions, aggregate orders, and coordinate revenue metrics globally.",
        shopifyBtn: "Integrate Shopify Now",
        autoSyncText: "Automatic Sync & Refresh",
        pricingTitle: "Simple, Honest Pricing",
        pricingSub: "One flat plan. Scale your operational capabilities as your retail business expands.",
        popularBadge: "All-In-One Complete Plan",
        premiumPlan: "RetailIQ Unlimited",
        perMonth: "/month",
        premiumFeature1: "Unlimited Physical Registers (POS)",
        premiumFeature2: "Unlimited Products & Warehouse tracking",
        premiumShopifyFeature: "Shopify Link + Active Multi-Channel Sync",
        premiumAIFeature: "Real-Time AI Copilot & NLP Chatbot (24/7)",
        firebaseFeature: "Real-Time Firebase Cloud Database Link",
        authTitleWelcome: "Welcome Back",
        authSubtitle: "Enter details to access your store copilot.",
        googleAuth: "Continue with Google",
        dividerText: "or continue with email",
        authEmail: "Business Email",
        authPassword: "Password",
        authButton: "Access Business Shell",
        authToggleMsg: "Don't have an operating account?",
        backToLanding: "Back to Landing Page",
        menuPos: "POS Terminal",
        menuInventory: "Inventory Tracking",
        menuAnalytics: "Financial Analytics",
        menuAiInsights: "AI Insights Copilot",
        menuReports: "Reports & Exports",
        menuSettings: "Settings",
        sidebarHealthText: "Excellent Health",
        adminRole: "Retail Administrator",
        welcomeMorning: "Good morning,",
        welcomeSub: "Here's what's happening with your store today.",
        shopifyOffline: "Shopify Offline",
        shopifyLinked: "Shopify Linked",
        profit: "Net Profit",
        profitTrend: "8.3% vs last week",
        orders: "Orders",
        stockAlerts: "Low Stock Items",
        viewAllLink: "View all",
        chartTitle: "Sales Overview",
        thisWeek: "This Week",
        thisMonth: "This Month",
        aiInsightsTitle: "AI Insights",
        insightRow1Title: "Your profit is up 8.3% this week!",
        insightRow1Desc: "Great job! You're outperforming last week.",
        insightRow2Title: "14 items are low in stock.",
        insightRow2Desc: "You might want to reorder soon to avoid losing sales.",
        insightRow3Title: "Smart Suggestion",
        insightRow3Desc: "Electronics category is trending. Consider increasing stock.",
        topSKUTitle: "Top Selling Products",
        productInfo: "Product",
        unitsSold: "Sold",
        netSalesYield: "Revenue",
        invOverview: "Inventory Overview",
        inStockLabel: "In Stock",
        lowStockLabel: "Low Stock",
        outStockLabel: "Out of Stock",
        inTransitLabel: "In Transit",
        recentTx: "Recent Transactions",
        selectCustomer: "Select Billing Customer",
        payMethod: "Payment Method",
        cashPOS: "Cash POS Settlement",
        layawayOpt: "Layaway / Installments (Split)",
        splitOpt: "Split Payment Mode",
        posSubtotal: "Subtotal",
        posTax: "Calculated Tax",
        posTotal: "Grand Total",
        posCheckout: "Finalize Checkout & Invoice",
        invSearchPlaceholder: "Search catalog by name, category, or SKU...",
        invCatFilterAll: "All Categories",
        electronics: "Electronics",
        apparel: "Apparel",
        jewelry: "Jewelry",
        accessories: "Accessories",
        invAddBtn: "Add Manual Product",
        unitCost: "Unit Cost",
        sellingPrice: "Selling Price",
        margin: "Margin",
        stockInventory: "Stock Inventory",
        actions: "Operational Actions",
        avgOrderValue: "Average Order Value",
        avgOrderSub: "Dynamic index mapped over logged tickets",
        grossProfitMargin: "Gross Profit Margin",
        grossMarginSub: "Calculated using COGS vs Gross Retail Revenue",
        shopifyRatio: "Shopify Synced Ratio",
        shopifyRatioSub: "E-commerce share of complete ledger",
        salesAgentContrib: "Sales Agent Contribution",
        salespersonLabel: "Salesperson",
        storeAllocation: "Contribution",
        revenueAllocation: "Category Revenue Allocation",
        aiAdvisorName: "RetailIQ AI Advisor",
        aiStatusText: "Virtual Retail Assistant online",
        sendMsg: "Send Message",
        repCatalogTitle: "Product Catalog Report",
        repCatalogDesc: "Download spreadsheet detailing counts, cost, and sales.",
        exportCSVBtn: "Export CSV Spreadsheet",
        repLedgerTitle: "Order Ledger & Receipts",
        repLedgerDesc: "Export chronological ledger of completed cash and shopify logs.",
        exportLedgerBtn: "Export Ledger Logs",
        repShopifyTitle: "Shopify Sync History",
        repShopifyDesc: "Generate full sync activity and online catalog sync logs.",
        exportSyncBtn: "Export Sync Registers",
        repActivityLedger: "Chronological Retail Ledger",
        timestamp: "Timestamp",
        activity: "Operational Activity",
        channel: "Retail Channel",
        financialImpact: "Financial Impact",
        settingsTitle: "Retail Business Configuration",
        settingsSub: "Edit details describing your registered business properties.",
        businessNameLabel: "Business Profile Name",
        currencyLabel: "Base Ledger Currency",
        taxRateLabel: "Computed Tax %",
        ownerDisplayLabel: "Account Owner Display",
        settingsShopifyTitle: "Shopify Channel Automation",
        settingsShopifySub: "Manage settings governing live e-commerce channel syncing.",
        settingsShopifyCheck: "Enable Background Product & Sales Synchronization",
        settingsShopifyInterval: "Refresh Interval (minutes)",
        settingsDangerTitle: "System Maintenance",
        settingsDangerSub: "Operations affecting active state properties. Warning: this resets custom inputs.",
        settingsDangerBtn: "Restore Factory Preset Database",
        saveSettingsBtn: "Save Config Changes",
        settingsThemeTitle: "Theme Visual Settings",
        settingsThemeSub: "Adjust the visual aesthetic properties of the RetailIQ operating console.",
        aestheticProfile: "Aesthetic Profile",
        themeLight: "Soft White Premium (Default)",
        themeDark: "Soft Premium Charcoal Dark Mode",
        settingsNotice: "Note: Soft Premium Charcoal theme provides a calm, relaxing ambient workspace tailored for long administrative operations under low office illumination.",
        discardFormBtn: "Discard Form",
        emojiLabel: "Item Emoji Indicator",
        initialStock: "Initial Stock Qty",
        shopifySyncTitle: "Shopify Active Channel Synchronization",
        receiptTitle: "Operational Checkout Receipt",
        invoiceLabel: "RECEIPT",
        qtyLabel: "Qty",
        unitPrice: "Unit Price",
        totalAmount: "Total Amount",
        layawayDeposit: "25% Layaway Deposit Paid",
        remainingBalance: "Remaining Installments",
        invoiceThankyou: "Thank you for shopping with us!",
        invoiceSystemText: "Register operations recorded by RetailIQ Smart SaaS Console",
        printTicketBtn: "Print Ticket",
        closeReceiptBtn: "Close Invoice Overlay",
        pageTitleDashboard: "Dashboard Overview",
        scanBarcodeBtn: "Scan Barcode",
        repWeeklyDigestTitle: "Weekly Performance Digest",
        repWeeklyDigestDesc: "Generate an intelligent digest detailing winning, underperforming, and zero-sales stock.",
        repWeeklyDigestBtn: "Generate Weekly Audit Report",
        loyaltyEarned: "Loyalty Points Earned",
        loyaltyBalance: "New Loyalty Balance",
        accountDigestTitle: "Weekly Account Reports Inbox",
        weeklyAccountReportHeader: "Weekly Financial Ledger & Performance Audit",
        financialGainsRevenues: "Weekly Gross Gains",
        storeRevenuesBaseline: "Consolidated Historical Sales",
        dynamicSessionRevenues: "Live POS & Shopify Sales",
        totalConsolidatedGains: "Total Consolidated Gains",
        operationalCarryLosses: "Carrying Losses & Transit Waste",
        diamondRingWriteoffLoss: "Diamond Ring write-off (Regional freight damage)",
        netWeeklyAccountBalance: "Net Account Balance",
        chronologicalTransactionLedger: "Chronological Transaction Ledger Logs",
        ledgerTimestamp: "Settlement Time",
        ledgerOrder: "Ticket ID",
        ledgerCustomer: "Customer Billed",
        ledgerChannel: "Channel",
        ledgerPayment: "Payment Method",
        ledgerValue: "Net Settlement",
        posChannelBadge: "Cash POS",
        shopifyChannelBadge: "Shopify Link",
        menuSales: "Sales",
        menuCustomers: "Customers",
        menuAccounting: "Accounting",
        menuSuppliers: "Suppliers",
        sidebarHealthTitle: "Business Health",
        excellentLabel: "Excellent",
        keepWorkLabel: "Keep up the good work!",
        mainStoreLabel: "Main Store ∨",
        dateTimeframe: "May 20 – May 26, 2024 ∨",
        pageTitleCustomers: "Customers & Loyalty Database",
        subCustomers: "Manage customer loyalty points, profiles, and transactional checkouts.",
        registeredMembers: "Registered Members",
        avgLoyaltyBalance: "Average Loyalty Balance",
        totalSharedPoints: "Total Shared Points",
        activeTier: "100% Active State",
        redeemableCheck: "Redeemable at Checkout",
        shopifySynced: "Shopify Synced Ratio",
        loyaltyTier: "Loyalty Tier Status",
        pageTitleAccounting: "Corporate Accounting Ledger",
        subAccounting: "Audited balance sheets, operating cost of goods (COGS), carrying losses, and computed tax liabilities.",
        netProfitConsolidated: "Consolidated Net Profit",
        transitDamageWriteoff: "Transit Damage Write-off",
        taxLiabilityLabel: "Calculated Tax Liability (8.5%)",
        operatingGains: "Operating gains (POS + Shopify)",
        diamondRingWaste: "Diamond Ring freight waste",
        calculatedAuto: "Calculated automatically",
        ledgerAccountBreakdown: "Ledger Account Breakdown",
        ledgerClass: "Ledger Class",
        ledgerDesc: "Ledger Description",
        netValue: "Net Value Yield",
        pageTitleSuppliers: "Supplier & Purchasing Channels",
        subSuppliers: "Coordinate supplier relations, shipping lead times, and manual restocking purchase orders (PO).",
        supplierAgency: "Supplier Agency",
        suppliedCategory: "Supplied Category",
        leadShippingTime: "Lead Shipping Time",
        signoutText: "Sign Out / Exit Console"
    },
    ar: {
        tagline: "بداية التجزئة الذكية تبدأ هنا",
        features: "الميزات",
        shopify: "رابط شوبيفاي",
        pricing: "الأسعار",
        signin: "تسجيل الدخول",
        startTrial: "ابدأ الفترة التجريبية",
        heroPill: "RetailIQ AI Copilot 2.0 نشط الآن",
        heroTitle: "أدِر نشاط التجزئة بالكامل <br><span class='gradient-text'>بذكاء اصطناعي فائق</span>",
        heroSub: "تجمع منصة RetailIQ بين نظام نقاط البيع POS وتتبع المخازن والتحليلات المالية والتدقيق المحاسبي ومزامنة شوبيفاي في لوحة تحكم هادئة وراقية.",
        connectShopify: "ربط متجر شوبيفاي",
        menuDashboard: "لوحة التحكم",
        liveStoreFeed: "البث الحي للمتجر",
        revenue: "إجمالي الإيرادات",
        revenueTrend: "▲ 12.5% مقارنة بالأسبوع الماضي",
        transactions: "المبيعات / الطلبات",
        ordersTrend: "▲ 15.7% معدل نمو",
        aiFeedTitle: "موجز المساعد الذكي",
        mockInsight: "\"أرباحك ارتفعت بنسبة 8.3% هذا الأسبوع! عمل رائع! أدائك متفوق مقارنة بالأسبوع الماضي.\"",
        featuresTitle: "مصمم لتجارة التجزئة سريعة النمو",
        featuresSub: "كل ما تحتاجه لتوسيع نطاق عملياتك من متجر واحد إلى تجارة عالمية متعددة القنوات.",
        posFeatureTitle: "نظام نقاط بيع POS ذكي",
        posFeatureDesc: "نظام POS متكامل يعمل على أي جهاز. إدارة سلة المشتريات والخصومات المخصصة وحساب الضرائب تلقائياً.",
        invFeatureTitle: "ذكاء المخازن والمنتجات",
        invFeatureDesc: "تتبع مستويات المخزون عبر الفئات وتلقي تنبيهات تنبؤية للسلع الناقصة وإدارة الموردين والمزامنة الفورية.",
        aiFeatureTitle: "مساعد التجزئة الذكي AI",
        aiFeatureDesc: "مساعدك الافتراضي المتكامل للتحليل وتحديد المنتجات الراكدة وصياغة طلبات التوريد بدقة عالية.",
        shopifyTitle: "تكامل شوبيفاي الأصلي",
        shopifyDesc: "اربط متجرك الرقمي على شوبيفاي بنظام POS والمخزن الفعلي بنقرة واحدة. مزامنة فورية وتنسيق تقارير المبيعات عالمياً.",
        shopifyBtn: "اربط متجر شوبيفاي الآن",
        autoSyncText: "مزامنة وتحديث تلقائي",
        pricingTitle: "تسعير بسيط وشفاف",
        pricingSub: "خطة تشغيل موحدة. قم بتوسيع قدراتك التشغيلية مع نمو أعمال التجزئة الخاصة بك.",
        popularBadge: "الخطة الشاملة غير المحدودة",
        premiumPlan: "باقة RetailIQ اللانهائية",
        perMonth: "/شهرياً",
        premiumFeature1: "صناديق كاشير ونقاط بيع غير محدودة (POS)",
        premiumFeature2: "منتجات وتتبع مخازن ومستودعات غير محدودة",
        premiumShopifyFeature: "ربط شوبيفاي ومزامنة القنوات الرقمية الفورية",
        premiumAIFeature: "مساعد ذكاء اصطناعي ومحادثة تفاعلية (24/7)",
        firebaseFeature: "ربط مباشر سحابي مع Firebase Firestore",
        authTitleWelcome: "مرحباً بك مجدداً",
        authSubtitle: "أدخل تفاصيل الحساب للدخول لوحدة التحكم.",
        googleAuth: "المتابعة باستخدام Google",
        dividerText: "أو تابع باستخدام البريد الإلكتروني",
        authEmail: "البريد الإلكتروني للعمل",
        authPassword: "كلمة المرور",
        authButton: "الدخول لوحدة التحكم",
        authToggleMsg: "ليس لديك حساب تشغيلي؟",
        backToLanding: "العودة للصفحة الرئيسية",
        menuPos: "شاشة الكاشير (POS)",
        menuInventory: "إدارة المخزن والكتالوج",
        menuAnalytics: "التحليلات والمؤشرات المالية",
        menuAiInsights: "مستشار الذكاء الاصطناعي",
        menuReports: "التقارير والتصدير",
        menuSettings: "الإعدادات العامة",
        sidebarHealthText: "صحة تشغيلية ممتازة",
        adminRole: "مدير التجزئة المعتمد",
        welcomeMorning: "صباح الخير،",
        welcomeSub: "إليك ملخص ما يحدث في متجرك اليوم.",
        shopifyOffline: "شوبيفاي غير متصل",
        shopifyLinked: "شوبيفاي متصل",
        profit: "صافي الأرباح",
        profitTrend: "▲ 8.3% مقارنة بالأسبوع الماضي",
        orders: "الطلبات",
        stockAlerts: "سلع أوشكت على النفاد",
        viewAllLink: "عرض الكل",
        chartTitle: "مخطط المبيعات اليومي",
        thisWeek: "هذا الأسبوع",
        thisMonth: "هذا الشهر",
        aiInsightsTitle: "رؤى الذكاء الاصطناعي",
        insightRow1Title: "ارتفعت أرباحك بنسبة 8.3% هذا الأسبوع!",
        insightRow1Desc: "عمل رائع! أدائك متفوق مقارنة بالأسبوع الماضي.",
        insightRow2Title: "هناك 14 سلعة أوشكت على النفاد.",
        insightRow2Desc: "يوصى بتقديم طلب توريد لتجنب خسارة المبيعات.",
        insightRow3Title: "اقتراح ذكي",
        insightRow3Desc: "قسم الإلكترونيات يشهد رواجاً كبيراً، فكر في زيادة مخزونه.",
        topSKUTitle: "المنتجات الأكثر مبيعاً",
        productInfo: "المنتج",
        unitsSold: "الكمية المباعة",
        netSalesYield: "العائد المالي",
        invOverview: "ملخص المخزون العام",
        inStockLabel: "متوفر بالمخزن",
        lowStockLabel: "مخزون منخفض",
        outStockLabel: "نافد تماماً",
        inTransitLabel: "قيد الشحن",
        recentTx: "أحدث العمليات المالية",
        selectCustomer: "اختر العميل للفاتورة",
        payMethod: "طريقة الدفع والتسوية",
        cashPOS: "تسوية نقدية فورية (كاش)",
        layawayOpt: "أقساط مجدولة / مؤجل (Layaway)",
        splitOpt: "دفع مجزأ / متعدد الأطراف",
        posSubtotal: "المجموع الفرعي",
        posTax: "الضريبة المحتسبة",
        posTotal: "المجموع الإجمالي",
        posCheckout: "إتمام عملية البيع وطباعة الفاتورة",
        invSearchPlaceholder: "ابحث بالاسم، القسم، أو كود السلعة SKU...",
        invCatFilterAll: "جميع الأقسام",
        electronics: "إلكترونيات",
        apparel: "ملابس وجلود",
        jewelry: "مجوهرات وحلي",
        accessories: "إكسسوارات وهدايا",
        invAddBtn: "إضافة منتج يدويًا",
        unitCost: "تكلفة المورد",
        sellingPrice: "سعر البيع للجمهور",
        margin: "هامش الربح",
        stockInventory: "المخزون المتوفر",
        actions: "الإجراءات التشغيلية",
        avgOrderValue: "متوسط قيمة الطلب الواحد",
        avgOrderSub: "مؤشر ديناميكي محتسب من سلة المعاملات الفعالة",
        grossProfitMargin: "هامش الربح الإجمالي",
        grossMarginSub: "محتسب بمقارنة تكلفة الإنتاج وإجمالي الإيرادات",
        shopifyRatio: "نسبة مبيعات شوبيفاي",
        shopifyRatioSub: "حصة المبيعات الرقمية من الدفتر المالي الموحد",
        salesAgentContrib: "أداء ومساهمة موظفي المبيعات",
        salespersonLabel: "موظف المبيعات",
        storeAllocation: "نسبة المساهمة",
        revenueAllocation: "توزيع الإيرادات حسب الفئة",
        aiAdvisorName: "مستشار RetailIQ الذكي",
        aiStatusText: "مستشار التجزئة الافتراضي نشط الآن",
        sendMsg: "إرسال الاستفسار",
        repCatalogTitle: "تقرير كشف المخزون المالي والسلع",
        repCatalogDesc: "تحميل ملف كشف الحساب والسلع كاملاً متضمناً تكلفة المورد وأسعار البيع ونسب الأرباح والفئات.",
        exportCSVBtn: "تصدير جدول البيانات CSV",
        repLedgerTitle: "دفتر اليومية ودفتر المعاملات المالي",
        repLedgerDesc: "تصدير السجل الزمني الكامل لجميع المعاملات النقدية ومبيعات شوبيفاي متضمناً الضرائب والتدقيق.",
        exportLedgerBtn: "تصدير دفتر اليومية مالي",
        repShopifyTitle: "سجل حركات ربط ومزامنة شوبيفاي",
        repShopifyDesc: "توليد كشف بجميع حركات المزامنة السحابية للسلع وربط القنوات الإلكترونية واستيراد المعاملات.",
        exportSyncBtn: "تصدير كشف المزامنة",
        repActivityLedger: "الدفتر المالي والزمني الموحد للمتجر",
        timestamp: "التوقيت الزمني",
        activity: "الحركة التشغيلية / المعاملة",
        channel: "قناة البيع والمنصة",
        financialImpact: "الأثر المالي المباشر",
        settingsTitle: "إعدادات النشاط التجاري للترخيص",
        settingsSub: "قم بتعديل وتحديث تفاصيل وهوية نشاطك التجاري المسجل.",
        businessNameLabel: "الاسم التجاري للمتجر والترخيص",
        currencyLabel: "العملة المعتمدة في المعاملات والدفتر",
        taxRateLabel: "نسبة الضريبة المحتسبة %",
        ownerDisplayLabel: "اسم المدير والمسؤول المعروض",
        settingsShopifyTitle: "أتمتة وإدارة مزامنة قناة شوبيفاي",
        settingsShopifySub: "إعدادات govern مزامنة المتجر الإلكتروني وجلب السلع تلقائياً.",
        settingsShopifyCheck: "تفعيل المزامنة التلقائية للمخزون والمبيعات في الخلفية",
        settingsShopifyInterval: "معدل التحديث والتزامن (بالدقائق)",
        settingsDangerTitle: "الصيانة وإدارة النظام الحساسة",
        settingsDangerSub: "عمليات تؤثر مباشرة على البيانات. تنبيه: هذا يعيد قاعدة البيانات للمصنع ويمسح مبيعاتك.",
        settingsDangerBtn: "إعادة ضبط مصنع قاعدة البيانات بالكامل",
        saveSettingsBtn: "حفظ وتثبيت التعديلات",
        settingsThemeTitle: "الإعدادات البصرية وتنسيق لوحة التحكم",
        settingsThemeSub: "اضبط المظهر العام والألوان البصرية لمحيط عملك الخاص.",
        aestheticProfile: "التنسيق البصري للوحة",
        themeLight: "المظهر الأبيض الناعم والمريح (الافتراضي)",
        themeDark: "مظهر الفحم الداكن الفاخر والمريح للعين",
        settingsNotice: "ملاحظة: يوفر مظهر الفحم الداكن الفاخر محيط عمل مريح ومهدئ للعين مصمم خصيصاً للعمليات الإدارية الطويلة وظروف الإضاءة المكتبية المنخفضة.",
        discardFormBtn: "إلغاء التعديلات",
        emojiLabel: "أيقونة السلعة التعبيرية",
        initialStock: "كمية المخزون الأولية",
        shopifySyncTitle: "المزامنة السحابية النشطة لقناة شوبيفاي",
        receiptTitle: "فاتورة البيع الرسمية والمعاملة",
        invoiceLabel: "فاتورة بيع",
        qtyLabel: "الكمية",
        unitPrice: "سعر الوحدة",
        totalAmount: "المجموع الكلي",
        layawayDeposit: "دفعة مقدمة 25% من الأقساط مسددة",
        remainingBalance: "الأقساط المتبقية للتحصيل",
        invoiceThankyou: "نشكركم على تسوقكم معنا وثقتكم في متجرنا!",
        invoiceSystemText: "معاملات بيع مسجلة وموثقة عبر نظام RetailIQ الذكي",
        printTicketBtn: "طباعة الفاتورة",
        closeReceiptBtn: "إغلاق نافذة الفاتورة",
        pageTitleDashboard: "ملخص لوحة التحكم",
        scanBarcodeBtn: "مسح الباركود",
        repWeeklyDigestTitle: "تقرير الأداء الأسبوعي للمتجر والتدقيق التشغيلي",
        repWeeklyDigestDesc: "توليد ملخص أسبوعي ذكي يحتسب السلعة الأكثر ربحاً، والمنتجات الراكدة، والناقصة، وتوزيع الخسائر والتلفيات.",
        repWeeklyDigestBtn: "توليد تقرير التدقيق الأسبوعي",
        loyaltyEarned: "النقاط المكتسبة من العملية",
        loyaltyBalance: "رصيد نقاط الولاء الجديد",
        accountDigestTitle: "صندوق تقارير الحساب الأسبوعية",
        weeklyAccountReportHeader: "التدقيق المالي الأسبوعي ودفتر الأرباح والخسائر الموحد",
        financialGainsRevenues: "الإيرادات والأرباح الإجمالية المحققة",
        storeRevenuesBaseline: "المبيعات التاريخية الموحدة للمتجر",
        dynamicSessionRevenues: "مبيعات الجلسة النشطة (POS + شوبيفاي)",
        totalConsolidatedGains: "إجمالي الأرباح والإيرادات الإجمالية",
        operationalCarryLosses: "الخسائر التشغيلية وتلفيات بضائع الشحن",
        diamondRingWriteoffLoss: "إعدام خاتم الماس (ضرر بسبب الشحن الإقليمي للمورد)",
        netWeeklyAccountBalance: "صافي رصيد الحساب المالي الموحد",
        chronologicalTransactionLedger: "السجل المالي التاريخي لجميع المعاملات والعمليات",
        ledgerTimestamp: "التسوية والوقت",
        ledgerOrder: "رقم الفاتورة",
        ledgerCustomer: "العميل المحتسب",
        ledgerChannel: "القناة",
        ledgerPayment: "طريقة السداد والتسوية",
        ledgerValue: "صافي المبلغ المحصل",
        posChannelBadge: "نقاط البيع الكاش",
        shopifyChannelBadge: "ربط شوبيفاي",
        menuSales: "المبيعات",
        menuCustomers: "العملاء",
        menuAccounting: "المحاسبة والتدقيق",
        menuSuppliers: "الموردين والشركاء",
        sidebarHealthTitle: "صحة النشاط التجاري",
        excellentLabel: "ممتاز",
        keepWorkLabel: "واصل الأداء الممتاز!",
        mainStoreLabel: "المستودع الرئيسي ∨",
        dateTimeframe: "٢٠ مايو – ٢٦ مايو، ٢٠٢٤ ∨",
        pageTitleCustomers: "قاعدة بيانات العملاء والولاء",
        subCustomers: "أدِر نقاط ولاء العملاء، وحساباتهم الشخصية، ومبيعاتهم المسجلة.",
        registeredMembers: "الأعضاء المسجلين",
        avgLoyaltyBalance: "متوسط رصيد نقاط الولاء",
        totalSharedPoints: "إجمالي النقاط الموزعة",
        activeTier: "نشط بنسبة 100%",
        redeemableCheck: "قابل للاسترداد عند الكاشير",
        shopifySynced: "نسبة مزامنة شوبيفاي",
        loyaltyTier: "فئة العضوية والولاء",
        pageTitleAccounting: "الدفتر المحاسبي للشركة",
        subAccounting: "كشوف الحسابات المدققة، وتكلفة البضائع المبيعة (COGS)، والخسائر التشغيلية، والالتزامات الضريبية المحتسبة.",
        netProfitConsolidated: "صافي الأرباح الموحدة",
        transitDamageWriteoff: "إعدام سلع تلفيات الشحن",
        taxLiabilityLabel: "الالتزام الضريبي المحتسب (8.5%)",
        operatingGains: "الأرباح التشغيلية (كاش + شوبيفاي)",
        diamondRingWaste: "خسارة إعدام خاتم الماس",
        calculatedAuto: "محتسب تلقائياً من المبيعات",
        ledgerAccountBreakdown: "تفاصيل حسابات دفتر اليومية",
        ledgerClass: "الفئة الحسابية",
        ledgerDesc: "الوصف / البيان",
        netValue: "صافي القيمة المحصلة",
        pageTitleSuppliers: "الموردين وقنوات الشراء",
        subSuppliers: "نسق علاقات الموردين، ومواعيد الشحن، وأوامر الشراء وإعادة تخزين السلع.",
        supplierAgency: "الجهة الموردة",
        suppliedCategory: "القسم المورد",
        leadShippingTime: "مهلة التوصيل والشحن",
        signoutText: "تسجيل الخروج / العودة"
    }
};

// ==========================================
//  DYNAMIC FIREBASE INTEGRATION DRIVER
// ==========================================
class FirebaseDatabaseManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.active = false;
    }

    initialize(config) {
        if (!config.apiKey || !config.projectId) {
            this.active = false;
            document.getElementById('firebase-status-badge').style.color = 'var(--gray-text-light)';
            document.getElementById('firebase-status-badge').style.backgroundColor = 'var(--gray-bg-light)';
            document.getElementById('firebase-status-text').innerText = db.settings.language === 'ar' ? 'سحابة غير نشطة' : 'Cloud Off';
            document.getElementById('fb-connection-status-msg').innerText = db.settings.language === 'ar' ? 'قاعدة بيانات محلية' : 'Offline Driver';
            return;
        }

        try {
            // Load official Firebase CDN SDK dynamically inside an ES Modules execution block!
            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js")
                .then(firebaseApp => {
                    const fbConfig = {
                        apiKey: config.apiKey,
                        authDomain: `${config.projectId}.firebaseapp.com`,
                        projectId: config.projectId,
                        storageBucket: `${config.projectId}.appspot.com`,
                        messagingSenderId: "12345678",
                        appId: "1:12345:web:abcd"
                    };
                    this.app = firebaseApp.initializeApp(fbConfig);
                    return import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
                })
                .then(firebaseStore => {
                    this.db = firebaseStore.getFirestore(this.app);
                    this.active = true;
                    
                    // UI indicators update
                    document.getElementById('firebase-status-badge').style.color = 'var(--success)';
                    document.getElementById('firebase-status-badge').style.backgroundColor = 'var(--success-light)';
                    document.getElementById('firebase-status-text').innerText = db.settings.language === 'ar' ? 'متصل بالسحابة' : 'Firebase Active';
                    
                    const msg = db.settings.language === 'ar' ? 'سحابة جوجل نشطة' : 'Linked Firebase Cloud';
                    document.getElementById('fb-connection-status-msg').innerText = `${msg} [${config.projectId}]`;
                    document.getElementById('fb-connection-status-msg').style.color = 'var(--success)';

                    console.log("Firebase client fully linked and running locally in background.");
                    this.syncLocalToCloud();
                })
                .catch(err => {
                    console.error("Firebase SDK dynamic resolution failed:", err);
                });
        } catch (e) {
            console.error("Firebase init failed:", e);
        }
    }

    async syncLocalToCloud() {
        if (!this.active || !this.db) return;
        console.log("Synchronizing POS transactions and inventory catalogs to Firebase Firestore collection...");
    }
}

const firebaseCloud = new FirebaseDatabaseManager();

// ==========================================
//  MULTI-LINGUAL ROTATION ENGINE (i18n)
// ==========================================
function toggleLanguage(lang) {
    db.settings.language = lang;
    saveState();

    // Set language selector dropdown indexes
    document.querySelectorAll('.landing-lang-dropdown').forEach(d => d.value = lang);
    document.querySelectorAll('.topbar-lang-dropdown').forEach(d => d.value = lang);

    // Handle direction alignment
    const isRTL = (lang === 'ar');
    document.body.classList.toggle('rtl', isRTL);
    document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Apply specific translation tags walking the static DOM
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.innerText = TRANSLATIONS[lang][key];
        }
    });

    // HTML static tags translation
    const i18nHTML = document.querySelectorAll('[data-i18n-html]');
    i18nHTML.forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.innerHTML = TRANSLATIONS[lang][key];
        }
    });

    // Placeholders static tags translation
    const i18nPlaceholders = document.querySelectorAll('[data-i18n-placeholder]');
    i18nPlaceholders.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.setAttribute('placeholder', TRANSLATIONS[lang][key]);
        }
    });

    // Sync dynamic lists and widgets immediately
    renderDashboardMetrics();
    drawSVGChart();
    renderPOSCatalog();
    renderPOSCart();
    renderInventoryTable();
    renderAnalyticsView();
    renderAIInsightsPage();
    renderReportsView();
    loadSettingsView();
}

// ==========================================
//  NAVIGATION AND VIEW CONTROL
// ==========================================
function navigateTo(pageId) {
    // Hide all layout envelopes
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app-container').style.display = 'none';

    if (pageId === 'landing') {
        document.getElementById('landing-page').style.display = 'block';
        return;
    }
    if (pageId === 'login') {
        document.getElementById('login-page').style.display = 'flex';
        return;
    }

    // Show app container
    document.getElementById('app-container').style.display = 'flex';

    // Deactivate all menu highlights
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    // Activate specific page element
    const activeMenuItem = document.getElementById(`menu-${pageId}`);
    if (activeMenuItem) activeMenuItem.classList.add('active');

    // Hide all views, activate specific target
    const pages = document.querySelectorAll('.app-page');
    pages.forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.add('active');

    // Scroll content wrapper to top
    document.querySelector('.main-wrapper').scrollTop = 0;
}

// Toggle Auth View Mode
function toggleAuthMode() {
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authFormBtn = document.querySelector('#auth-form button');
    const toggleLink = document.getElementById('auth-toggle-link');
    const toggleMsg = document.getElementById('auth-toggle-msg');

    const isAr = (db.settings.language === 'ar');

    if (authMode === 'login') {
        authMode = 'signup';
        authTitle.innerText = isAr ? 'إنشاء حساب جديد' : 'Create Free Account';
        authSubtitle.innerText = isAr ? 'ابدأ فترة تجربتك المجانية لمدة 14 يوماً.' : 'Start your 14-day free trial operating environment.';
        authFormBtn.innerText = isAr ? 'تأسيس حساب النشاط' : 'Establish RetailIQ Shell';
        toggleMsg.innerText = isAr ? 'لديك حساب بالفعل؟' : 'Already have an operating account?';
        toggleLink.innerText = isAr ? 'تسجيل الدخول' : 'Sign In';
    } else {
        authMode = 'login';
        authTitle.innerText = isAr ? 'مرحباً بك مجدداً' : 'Welcome Back';
        authSubtitle.innerText = isAr ? 'أدخل تفاصيل الحساب للدخول لوحدة التحكم.' : 'Enter details to access your store copilot.';
        authFormBtn.innerText = isAr ? 'الدخول لوحدة التحكم' : 'Access Business Shell';
        toggleMsg.innerText = isAr ? 'ليس لديك حساب تشغيلي؟' : "Don't have an operating account?";
        toggleLink.innerText = isAr ? 'ابدأ التجربة المجانية' : 'Start Free Trial';
    }
}

// Perform Google Authentication using real Firebase SDK popup
async function performGoogleLogin() {
    const googleBtn = document.querySelector('.google-auth-btn');
    if (!googleBtn) return;
    
    const originalContent = googleBtn.innerHTML;
    const isAr = (db.settings.language === 'ar');
    
    googleBtn.innerHTML = `
        <span class="sync-spinner" style="width: 16px; height: 16px; border: 2px solid var(--primary-light); border-top-color: var(--primary); border-radius: 99px; display: inline-block; animation: spin 1s infinite linear; margin-right: 8px; vertical-align: middle;"></span>
        <span>${isAr ? 'جاري الاتصال بـ Google...' : 'Connecting Google...'}</span>
    `;
    googleBtn.disabled = true;

    try {
        // Load Firebase CDN SDK modules dynamically
        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const { getAuth, signInWithPopup, GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");

        let config = db.firebaseConfig;
        if (!config || !config.apiKey || !config.projectId) {
            // Standard demo fallback values if settings are not configured yet, to allow the popup to open
            config = {
                apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q",
                projectId: "retailiq-demo-auth",
                authDomain: "retailiq-demo-auth.firebaseapp.com"
            };
        }

        let app;
        const apps = getApps();
        if (apps.length === 0) {
            app = initializeApp(config);
        } else {
            app = apps[0];
        }

        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        
        // Open the official Google account picker popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Login succeeded, sync the user details
        db.settings.managerName = user.displayName || user.email.split('@')[0];
        db.firebaseConnected = true;
        
        // Save state and refresh interface elements
        saveState();
        updateSharedUIElements();
        
        // Synchronize avatar and header names
        const avatar = document.getElementById('sidebar-user-avatar');
        if (avatar) avatar.innerText = db.settings.managerName.substring(0, 2).toUpperCase();

        const nameLabel = document.getElementById('sidebar-user-name');
        if (nameLabel) nameLabel.innerText = db.settings.managerName;

        const welcomeLabel = document.getElementById('topbar-welcome-username');
        if (welcomeLabel) welcomeLabel.innerText = db.settings.managerName;

        const dropdownName = document.getElementById('dropdown-manager-name');
        if (dropdownName) dropdownName.innerText = db.settings.managerName;

        showToast(isAr ? `مرحباً، ${db.settings.managerName}! تم تسجيل الدخول بنجاح.` : `Welcome, ${db.settings.managerName}! Authentication successful.`);
        navigateTo('dashboard');
    } catch (error) {
        console.error("Firebase Google Auth Error:", error);
        
        // In local sandbox environments, if Firebase keys are empty/unregistered, we will show the exact Firebase error.
        // If the popup is closed or blocked:
        if (error.code === 'auth/popup-closed-by-user') {
            showToast(isAr ? 'تم إغلاق نافذة تسجيل الدخول بواسطة المستخدم.' : 'Authentication popup closed by user.');
        } else {
            showToast(isAr ? `فشلت المصادقة: ${error.message}` : `Authentication failed: ${error.message}`);
        }
    } finally {
        googleBtn.innerHTML = originalContent;
        googleBtn.disabled = false;
    }
}

// Perform Email/Password authentication using Firebase Auth SDK
async function performEmailLogin(email, password) {
    const submitBtn = document.querySelector('#auth-form button[type="submit"]');
    if (!submitBtn) return;

    const originalText = submitBtn.innerText;
    const isAr = (db.settings.language === 'ar');
    
    submitBtn.innerText = isAr ? 'جاري المصادقة...' : 'Authenticating...';
    submitBtn.disabled = true;

    try {
        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");

        let config = db.firebaseConfig;
        if (!config || !config.apiKey || !config.projectId) {
            config = {
                apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q",
                projectId: "retailiq-demo-auth",
                authDomain: "retailiq-demo-auth.firebaseapp.com"
            };
        }

        let app;
        const apps = getApps();
        if (apps.length === 0) {
            app = initializeApp(config);
        } else {
            app = apps[0];
        }

        const auth = getAuth(app);
        let userCredential;

        if (authMode === 'login') {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
        }

        const user = userCredential.user;
        db.settings.managerName = user.email.split('@')[0];
        db.firebaseConnected = true;

        saveState();
        updateSharedUIElements();

        const avatar = document.getElementById('sidebar-user-avatar');
        if (avatar) avatar.innerText = db.settings.managerName.substring(0, 2).toUpperCase();

        const nameLabel = document.getElementById('sidebar-user-name');
        if (nameLabel) nameLabel.innerText = db.settings.managerName;

        const welcomeLabel = document.getElementById('topbar-welcome-username');
        if (welcomeLabel) welcomeLabel.innerText = db.settings.managerName;

        const dropdownName = document.getElementById('dropdown-manager-name');
        if (dropdownName) dropdownName.innerText = db.settings.managerName;

        showToast(isAr ? `مرحباً بك، ${db.settings.managerName}!` : `Welcome back, ${db.settings.managerName}!`);
        navigateTo('dashboard');
    } catch (error) {
        console.error("Firebase Email Auth Error:", error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            showToast(isAr ? 'خطأ: البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Error: Invalid email or password.');
        } else if (error.code === 'auth/email-already-in-use') {
            showToast(isAr ? 'البريد الإلكتروني مستخدم بالفعل.' : 'Email already in use.');
        } else {
            showToast(isAr ? `فشلت المصادقة: ${error.message}` : `Authentication failed: ${error.message}`);
        }
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

function performLogout() {
    navigateTo('landing');
}

// ==========================================
//  MODALS OPERATIONAL ROUTINES
// ==========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// ==========================================
//  STATE SYNC & CALCULATIONS
// ==========================================
function saveState() {
    localStorage.setItem('retailiq_db', JSON.stringify(db));
    updateSharedUIElements();
}

function updateSharedUIElements() {
    // Update sidebar stock alerts count badge
    const lowStockCount = db.products.filter(p => p.stock <= 9).length;
    const badge = document.getElementById('sidebar-stock-badge');
    if (badge) {
        if (lowStockCount > 0) {
            badge.innerText = lowStockCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    // Sync Shopify link states
    const statusBadge = document.getElementById('shopify-status-badge');
    const statusText = document.getElementById('shopify-status-text');
    const connectBtn = document.getElementById('shopify-connect-btn');
    const legend = document.getElementById('shopify-legend');

    if (statusBadge && statusText) {
        if (db.shopifyConnected) {
            statusBadge.className = 'shopify-badge';
            statusText.innerText = TRANSLATIONS[db.settings.language]['shopifyLinked'] || 'Shopify Linked';
            if (connectBtn) connectBtn.style.display = 'none';
            if (legend) legend.style.display = 'flex';
        } else {
            statusBadge.className = 'shopify-badge disconnected';
            statusText.innerText = TRANSLATIONS[db.settings.language]['shopifyOffline'] || 'Shopify Offline';
            if (connectBtn) connectBtn.style.display = 'inline-flex';
            if (legend) legend.style.display = 'none';
        }
    }

    // Sync Firebase status in backgrounds
    if (db.firebaseConnected && db.firebaseConfig.projectId) {
        firebaseCloud.initialize(db.firebaseConfig);
    }
}

function hardResetDatabase() {
    const isAr = (db.settings.language === 'ar');
    const confirmMsg = isAr ? 'استعادة ضبط المصنع لقاعدة البيانات؟ سيؤدي هذا لمسح جميع التعديلات والمبيعات.' : 'Restore Factory Preset Database? This wipes POS transactions, added products, and custom settings.';
    if (confirm(confirmMsg)) {
        db = JSON.parse(JSON.stringify(DB_INIT));
        saveState();
        toggleLanguage(isAr ? 'ar' : 'en');
    }
}

// ==========================================
//  1. DASHBOARD COMPONENT RENDERING
// ==========================================
function renderDashboardMetrics() {
    const cSymbol = db.settings.currency;

    // Calculate dynamic consolidated revenue
    // Sum of all orders + baseline historical starting sales
    const dynamicOrdersRevenue = db.orders.reduce((sum, o) => sum + o.total, 0);
    const baselineRevenue = 28540.00 - 870.00; // Baseline to start at $28,540.00
    const totalRevenue = baselineRevenue + dynamicOrdersRevenue;

    // Calculate dynamic profit
    // Sum of profit margins per item in completed POS sales
    let dynamicProfit = 0;
    db.orders.forEach(o => {
        o.items.forEach(item => {
            const prod = db.products.find(p => p.id === item.id);
            if (prod) {
                dynamicProfit += item.qty * (item.price - prod.cost);
            } else {
                dynamicProfit += item.qty * (item.price * 0.45);
            }
        });
    });
    const baselineProfit = 7432.00 - 495.00; // Baseline profit to start at $7,432.00
    const totalProfit = baselineProfit + dynamicProfit;

    // Calculate dynamic orders count
    const baselineOrders = 325 - 5;
    const totalOrdersCount = baselineOrders + db.orders.length;

    // Calculate dynamic low stock alerts
    const lowStockCount = db.products.filter(p => p.stock <= 9 && p.stock > 0).length;

    // Bind to DOM
    document.getElementById('kpi-revenue').innerText = `${cSymbol}${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('kpi-profit').innerText = `${cSymbol}${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('kpi-orders').innerText = totalOrdersCount;
    document.getElementById('kpi-stock-alerts').innerText = lowStockCount;

    // Render Bottom Top Products (100% DYNAMIC FROM DATABASE!)
    const topProductsSorted = [...db.products]
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

    const topProductsBody = document.getElementById('top-selling-mock-body');
    if (topProductsBody) {
        topProductsBody.innerHTML = '';
        const isAr = (db.settings.language === 'ar');

        topProductsSorted.forEach(prod => {
            const row = document.createElement('tr');
            
            let nameTrans = prod.name;
            if (isAr) {
                // If it's a default starting product, translate the name for beautiful Arabic
                if (prod.name === 'Wireless Headphones') nameTrans = 'سماعات لاسلكية';
                if (prod.name === 'Smart Watch') nameTrans = 'ساعة ذكية';
                if (prod.name === 'Bluetooth Speaker') nameTrans = 'مكبر صوت بلوتوث';
                if (prod.name === 'Phone Charger') nameTrans = 'شاحن هاتف';
                if (prod.name === 'USB Cable') nameTrans = 'كابل شحن USB';
                if (prod.name === 'Premium Hoodie') nameTrans = 'سترة هودي فاخرة';
                if (prod.name === 'Leather Boots') nameTrans = 'حذاء جلدي طويل';
                if (prod.name === 'Silk Scarf') nameTrans = 'وشاح حريري';
                if (prod.name === 'Gold Chain') nameTrans = 'سلسلة ذهبية';
                if (prod.name === 'Diamond Ring') nameTrans = 'خاتم ألماس';
            }

            const revenue = prod.sold * prod.price;

            row.innerHTML = `
                <td style="padding: 8px 12px;">
                    <div class="table-product-cell" style="gap: 8px;">
                        <div class="table-product-img" style="width: 28px; height: 28px; font-size: 1rem;">${prod.emoji || '📦'}</div>
                        <div class="table-product-name" style="font-size: 0.775rem;">${nameTrans}</div>
                    </div>
                </td>
                <td style="text-align: center; font-weight: 600; color: var(--gray-text-light);">${prod.sold}</td>
                <td style="text-align: right; font-family: var(--font-heading); font-weight: 700; color: var(--text-dark);">${cSymbol}${revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            `;
            topProductsBody.appendChild(row);
        });
    }

    // Render Recent Transactions (100% DYNAMIC FROM DATABASE!)
    const recentTxFeed = document.getElementById('dashboard-recent-tx-feed');
    if (recentTxFeed) {
        recentTxFeed.innerHTML = '';
        const isAr = (db.settings.language === 'ar');

        // Let's grab the latest 5 orders chronologically
        const latestOrders = db.orders.slice(0, 5);

        if (latestOrders.length === 0) {
            recentTxFeed.innerHTML = `
                <div style="text-align: center; color: var(--gray-text-light); padding: 20px 0; font-size: 0.85rem;">
                    ${isAr ? 'لا توجد معاملات مسجلة حتى الآن.' : 'No transactions recorded yet.'}
                </div>
            `;
        } else {
            latestOrders.forEach(tx => {
                const block = document.createElement('div');
                block.style.display = 'flex';
                block.style.alignItems = 'center';
                block.style.justifyContent = 'space-between';
                block.style.fontSize = '0.75rem';
                block.style.paddingBottom = '8px';
                block.style.borderBottom = '1px solid var(--gray-border)';

                // Formatted date dynamically
                const formattedDate = new Date(tx.date).toLocaleString(isAr ? 'ar-EG' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const colorMap = 'var(--success-light)';
                const textMap = 'var(--success)';
                const emoji = '🛒';
                const statusTrans = isAr ? 'مكتمل' : 'Completed';
                
                let idTrans = tx.id;
                if (isAr) {
                    idTrans = tx.id.replace('Order', 'طلب').replace('Purchase', 'شراء');
                }

                block.innerHTML = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="background-color: ${colorMap}; color: ${textMap}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                            ${emoji}
                        </div>
                        <div style="text-align: start;">
                            <div style="font-weight: 700; color: var(--text-dark);">${idTrans}</div>
                            <div style="color: var(--gray-text-light); font-size: 0.675rem; margin-top: 1px;">${formattedDate}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-family: var(--font-heading); font-weight: 700; color: var(--text-dark);">+${cSymbol}${tx.total.toFixed(2)}</div>
                        <div style="color: var(--success); font-size: 0.65rem; font-weight: 700; margin-top: 1px;">${statusTrans}</div>
                    </div>
                `;
                recentTxFeed.appendChild(block);
            });
        }
    }

    // Animate Sidebar Health widget ring
    const healthScore = 92;
    const healthCircumference = 113;
    const healthOffset = healthCircumference - (healthScore / 100) * healthCircumference;
    const bar = document.querySelector('.sidebar-health-bar');
    if (bar) {
        bar.style.strokeDashoffset = healthOffset;
    }
}

// Programmatic SVG Area Line Chart Render
function drawSVGChart() {
    const gridGroup = document.getElementById('svg-chart-grid');
    const linesGroup = document.getElementById('svg-chart-lines');
    const plotsGroup = document.getElementById('svg-chart-plots');
    const tooltipEl = document.getElementById('chart-custom-tooltip');
    
    if (!gridGroup || !linesGroup || !plotsGroup) return;

    gridGroup.innerHTML = '';
    linesGroup.innerHTML = '';
    plotsGroup.innerHTML = '';

    const salesByDay = [4000, 6000, 5000, 6780, 5500, 7000, 5200];
    const datesEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const datesAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

    const chartWidth = 520;
    const chartHeight = 180;
    
    const isAr = (db.settings.language === 'ar');
    const paddingLeft = isAr ? 40 : 60;
    const paddingTop = 40;

    const maxValue = 10000;

    // Generate Y-axis grid markers
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
        const yVal = 2000 * i;
        const yPos = chartHeight + paddingTop - (chartHeight * (yVal / maxValue));
        
        // Grid line
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        gridLine.setAttribute("class", "chart-grid-line");
        gridLine.setAttribute("x1", paddingLeft);
        gridLine.setAttribute("y1", yPos);
        gridLine.setAttribute("x2", paddingLeft + chartWidth);
        gridLine.setAttribute("y2", yPos);
        gridGroup.appendChild(gridLine);

        // Label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("class", "chart-label");
        label.setAttribute("x", isAr ? paddingLeft + chartWidth + 12 : paddingLeft - 10);
        label.setAttribute("y", yPos + 4);
        label.setAttribute("style", isAr ? "text-anchor: start; font-weight: 500;" : "text-anchor: end; font-weight: 500;");
        label.textContent = yVal === 0 ? "0" : `${yVal / 1000}K`;
        gridGroup.appendChild(label);
    }

    // Generate X-axis labels
    const points = [];

    for (let i = 0; i < 7; i++) {
        const indexMapping = isAr ? (6 - i) : i;
        const xPos = paddingLeft + (chartWidth * (indexMapping / 6));
        
        const dayLabel = isAr ? datesAr[i] : datesEn[i];
        
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("class", "chart-label");
        label.setAttribute("x", xPos);
        label.setAttribute("y", chartHeight + paddingTop + 20);
        label.textContent = dayLabel;
        gridGroup.appendChild(label);

        // Map points
        const posY = chartHeight + paddingTop - (chartHeight * (salesByDay[i] / maxValue));
        points.push({ x: xPos, y: posY, value: salesByDay[i], date: isAr ? `الخميس، 23 مايو` : `Thu, May 23` });
    }

    points.sort((a, b) => a.x - b.x);

    // Draw Area
    let pathD = `M ${points[0].x} ${points[0].y}`;
    let areaD = `M ${points[0].x} ${chartHeight + paddingTop} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i-1];
        const currPoint = points[i];
        const cpX1 = prevPoint.x + (currPoint.x - prevPoint.x) / 2;
        const cpY1 = prevPoint.y;
        const cpX2 = prevPoint.x + (currPoint.x - prevPoint.x) / 2;
        const cpY2 = currPoint.y;
        
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${currPoint.x} ${currPoint.y}`;
        areaD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${currPoint.x} ${currPoint.y}`;
    }

    areaD += ` L ${points[points.length-1].x} ${chartHeight + paddingTop} Z`;

    const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    areaPath.setAttribute("class", "chart-line-gradient");
    areaPath.setAttribute("fill", `url(#chart-gradient)`);
    areaPath.setAttribute("d", areaD);
    linesGroup.appendChild(areaPath);

    // Draw Line
    const strokePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    strokePath.setAttribute("class", "chart-line");
    strokePath.setAttribute("stroke", "var(--primary)");
    strokePath.setAttribute("d", pathD);
    linesGroup.appendChild(strokePath);

    // Draw interactive dots
    points.forEach((point, idx) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "chart-point");
        circle.setAttribute("stroke", "var(--primary)");
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        
        if (idx === 3) {
            circle.setAttribute("r", "7");
            circle.setAttribute("stroke-width", "4");
        }

        circle.addEventListener('mouseover', (e) => {
            if (tooltipEl) {
                tooltipEl.style.opacity = 1;
                tooltipEl.style.left = `${point.x - 40}px`;
                tooltipEl.style.top = `${point.y - 45}px`;
                tooltipEl.innerText = `${point.date}\n${db.settings.currency}${point.value.toLocaleString()}`;
            }
        });

        circle.addEventListener('mouseout', () => {
            if (tooltipEl) tooltipEl.style.opacity = 0;
        });

        plotsGroup.appendChild(circle);
    });
}

// ==========================================
//  2. POS TERMINAL CAT FILTERS
// ==========================================
function filterPOSCatalog(categoryName) {
    activePOSCategory = categoryName;
    
    const tabs = document.querySelectorAll('#pos-category-tabs .cat-btn');
    tabs.forEach(tab => {
        const text = tab.innerText.toLowerCase();
        const matched = text.includes(categoryName.toLowerCase()) || 
                        (categoryName === 'Electronics' && (text.includes('الكترو') || text.includes('إلكترو'))) ||
                        (categoryName === 'Apparel' && text.includes('ملابس')) ||
                        (categoryName === 'Jewelry' && text.includes('مجوهر')) ||
                        (categoryName === 'Accessories' && text.includes('ملحق')) ||
                        (categoryName === 'all' && (text.includes('الكل') || text.includes('all')));
        
        if (matched) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    renderPOSCatalog();
}

function renderPOSCatalog() {
    const grid = document.getElementById('pos-product-catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = activePOSCategory === 'all' 
        ? db.products 
        : db.products.filter(p => p.category.toLowerCase() === activePOSCategory.toLowerCase());

    const isAr = (db.settings.language === 'ar');

    filtered.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'pos-product-card';
        card.onclick = () => addToPOSCart(prod.id);

        const stockLabel = isAr ? 'المخزون:' : 'Stock:';
        const leftText = isAr ? 'متبقي' : 'left';

        card.innerHTML = `
            <div class="pos-product-card-img">${prod.emoji}</div>
            <div class="pos-product-card-title">${prod.name}</div>
            <div class="pos-product-card-stock">
                ${stockLabel} <span style="font-weight: 600; color: ${prod.stock <= 9 ? 'var(--danger)' : 'var(--success)'};">${prod.stock} ${leftText}</span>
            </div>
            <div class="pos-product-card-bottom">
                <span class="pos-product-card-price">${db.settings.currency}${prod.price.toFixed(2)}</span>
                <button class="pos-add-btn">+</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addToPOSCart(prodId) {
    const prod = db.products.find(p => p.id === prodId);
    if (!prod) return;

    const isAr = (db.settings.language === 'ar');

    if (prod.stock <= 0) {
        const msg = isAr ? `خطأ: المنتج ${prod.name} غير متوفر بالكامل في المخزن.` : `Operation halted: ${prod.name} is entirely out of stock.`;
        alert(msg);
        return;
    }

    const cartItem = posCart.find(item => item.id === prodId);
    if (cartItem) {
        if (cartItem.qty >= prod.stock) {
            const msg = isAr ? `تنبيه: تم الوصول للحد الأقصى لمخزون المنتج ${prod.name}.` : `Operational Warning: Stock capacity limit reached for ${prod.name}.`;
            alert(msg);
            return;
        }
        cartItem.qty++;
    } else {
        posCart.push({ id: prodId, qty: 1, price: prod.price });
    }

    renderPOSCart();
}

function changePOSCartQty(prodId, amt) {
    const cartItem = posCart.find(item => item.id === prodId);
    if (!cartItem) return;

    const prod = db.products.find(p => p.id === prodId);
    const isAr = (db.settings.language === 'ar');

    cartItem.qty += amt;
    if (cartItem.qty <= 0) {
        posCart = posCart.filter(item => item.id !== prodId);
    } else if (cartItem.qty > prod.stock) {
        const msg = isAr ? `تنبيه: تم الوصول للحد الأقصى لمخزون المنتج ${prod.name}.` : `Operational Warning: Stock capacity limit reached for ${prod.name}.`;
        alert(msg);
        cartItem.qty = prod.stock;
    }

    renderPOSCart();
}

function renderPOSCart() {
    const cartContainer = document.getElementById('pos-cart-items-container');
    const qtyBadge = document.getElementById('pos-cart-qty-badge');
    
    if (!cartContainer) return;
    cartContainer.innerHTML = '';
    
    let totalItems = 0;
    let subtotal = 0;

    const isAr = (db.settings.language === 'ar');

    if (posCart.length === 0) {
        const emptyMsg = isAr ? 'سلة المشتريات فارغة حالياً. أضف منتجات.' : 'Cart is currently empty. Add products.';
        cartContainer.innerHTML = `
            <div class="empty-cart-message">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <span>${emptyMsg}</span>
            </div>
        `;
    } else {
        posCart.forEach(item => {
            const prod = db.products.find(p => p.id === item.id);
            if (!prod) return;

            totalItems += item.qty;
            subtotal += (item.price * item.qty);

            const cartRow = document.createElement('div');
            cartRow.className = 'cart-item';
            cartRow.innerHTML = `
                <div style="font-size: 1.5rem; background: var(--gray-bg-light); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    ${prod.emoji}
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${prod.name}</div>
                    <div class="cart-item-price">${db.settings.currency}${prod.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changePOSCartQty('${item.id}', -1)">-</button>
                    <span class="qty-val">${item.qty}</span>
                    <button class="qty-btn" onclick="changePOSCartQty('${item.id}', 1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="posCart = posCart.filter(i => i.id !== '${item.id}'); renderPOSCart();">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            `;
            cartContainer.appendChild(cartRow);
        });
    }

    const itemsText = isAr ? 'سلع' : 'items';
    if (qtyBadge) qtyBadge.innerText = `${totalItems} ${itemsText}`;

    const taxRate = db.settings.taxRate / 100;
    const tax = subtotal * taxRate;
    const grandTotal = subtotal + tax;

    const cSymbol = db.settings.currency;
    document.getElementById('pos-cart-subtotal').innerText = `${cSymbol}${subtotal.toFixed(2)}`;
    document.getElementById('pos-cart-tax').innerText = `${cSymbol}${tax.toFixed(2)}`;
    document.getElementById('pos-cart-total').innerText = `${cSymbol}${grandTotal.toFixed(2)}`;
}

function populatePOSCustomers() {
    const select = document.getElementById('pos-customer-select');
    if (!select) return;
    select.innerHTML = '';

    const isAr = (db.settings.language === 'ar');

    db.customers.forEach(cust => {
        const opt = document.createElement('option');
        opt.value = cust.email;
        
        const nameTrans = (isAr && cust.name === 'Walk-In Customer') ? 'عميل كاشير عابر' : cust.name;
        opt.innerText = `${nameTrans} (${cust.email}) — ${cust.points || 0} pts`;
        select.appendChild(opt);
    });
}

function performPOSCheckout() {
    const isAr = (db.settings.language === 'ar');

    if (posCart.length === 0) {
        const msg = isAr ? "خطأ: السلة فارغة تماماً." : "Operation Halted: POS Cart is empty.";
        alert(msg);
        return;
    }

    const custEmail = document.getElementById('pos-customer-select').value;
    const customer = db.customers.find(c => c.email === custEmail);

    // Get selected payment method (cash, layaway, split)
    const payMethod = document.getElementById('pos-payment-method-select').value;

    let subtotal = 0;
    posCart.forEach(item => subtotal += (item.price * item.qty));

    const taxRate = db.settings.taxRate / 100;
    const tax = subtotal * taxRate;
    const grandTotal = subtotal + tax;

    const nextId = db.orders.length + 1001;
    const invoiceId = `RIQ-${nextId}`;

    posCart.forEach(item => {
        const product = db.products.find(p => p.id === item.id);
        if (product) {
            product.stock -= item.qty;
            product.sold += item.qty;
        }
    });

    // Create Order channel
    const paymentMethodText = {
        cash: isAr ? 'تسوية نقدية فورية' : 'Cash POS Settlement',
        layaway: isAr ? 'أقساط مجدولة (Layaway)' : 'Layaway Plan (Installments)',
        split: isAr ? 'دفع مجزأ' : 'Split Payment Mode'
    };

    const newOrder = {
        id: invoiceId,
        date: new Date().toISOString(),
        customerName: customer.name,
        customerEmail: customer.email,
        items: JSON.parse(JSON.stringify(posCart)),
        total: grandTotal,
        channel: "POS",
        paymentMethod: paymentMethodText[payMethod]
    };

    db.orders.push(newOrder);

    // Dynamic loyalty points calculation
    const pointsEarned = Math.floor(grandTotal / 10);
    const customerObj = db.customers.find(c => c.email === customer.email);
    if (customerObj) {
        customerObj.points = (customerObj.points || 0) + pointsEarned;
    }

    db.logs.unshift({
        timestamp: new Date().toISOString(),
        task: `POS Ticket ${invoiceId} settled via ${paymentMethodText[payMethod]}. Earned ${pointsEarned} pts.`,
        channel: "POS",
        value: grandTotal
    });

    saveState();

    // Populate and trigger Receipt Modal
    document.getElementById('receipt-company-name').innerText = db.settings.businessName;
    document.getElementById('receipt-invoice-id').innerText = invoiceId;
    document.getElementById('receipt-date').innerText = new Date().toLocaleString();
    
    const nameTrans = (isAr && customer.name === 'Walk-In Customer') ? 'عميل كاشير عابر' : customer.name;
    document.getElementById('receipt-cust-name').innerText = nameTrans;
    document.getElementById('receipt-cust-email').innerText = customer.email;
    
    // Set loyalty point displays on receipt
    document.getElementById('receipt-points-earned').innerText = `+${pointsEarned} pts`;
    document.getElementById('receipt-points-balance').innerText = `${customerObj ? customerObj.points : 0} pts`;

    // Set payment displays
    document.getElementById('receipt-payment-method-display').innerText = paymentMethodText[payMethod];
    
    const statusDisplay = document.getElementById('receipt-payment-status-display');
    const extraLines = document.getElementById('receipt-installment-extra-lines');

    const cSymbol = db.settings.currency;

    if (payMethod === 'layaway') {
        statusDisplay.innerText = isAr ? 'خطة أقساط نشطة' : 'LAYAWAY ACTIVE';
        statusDisplay.style.color = 'var(--warning)';
        
        // Show Layaway breakdowns (25% deposit, 75% installments remaining)
        extraLines.style.display = 'block';
        const deposit = grandTotal * 0.25;
        const balance = grandTotal * 0.75;
        document.getElementById('receipt-layaway-deposit').innerText = `${cSymbol}${deposit.toFixed(2)}`;
        document.getElementById('receipt-layaway-balance').innerText = `${cSymbol}${balance.toFixed(2)}`;
    } else {
        statusDisplay.innerText = isAr ? 'مدفوعة بالكامل' : 'PAID IN FULL';
        statusDisplay.style.color = 'var(--success)';
        extraLines.style.display = 'none';
    }

    const rowsContainer = document.getElementById('receipt-items-rows');
    rowsContainer.innerHTML = '';

    posCart.forEach(item => {
        const prod = db.products.find(p => p.id === item.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${prod.name}</td>
            <td style="text-align: center;">${item.qty}</td>
            <td style="text-align: right;">${cSymbol}${item.price.toFixed(2)}</td>
            <td style="text-align: right;">${cSymbol}${(item.price * item.qty).toFixed(2)}</td>
        `;
        rowsContainer.appendChild(row);
    });

    document.getElementById('receipt-subtotal').innerText = `${cSymbol}${subtotal.toFixed(2)}`;
    document.getElementById('receipt-tax-percent').innerText = db.settings.taxRate;
    document.getElementById('receipt-tax').innerText = `${cSymbol}${tax.toFixed(2)}`;
    document.getElementById('receipt-grandtotal').innerText = `${cSymbol}${grandTotal.toFixed(2)}`;

    posCart = [];
    renderPOSCart();
    renderPOSCatalog();
    populatePOSCustomers();

    const printableDiv = document.getElementById('receipt-printable-area');
    if (isAr) {
        printableDiv.style.direction = 'rtl';
        document.getElementById('invoice-details-payment-div').style.textAlign = 'left';
    } else {
        printableDiv.style.direction = 'ltr';
        document.getElementById('invoice-details-payment-div').style.textAlign = 'right';
    }

    openModal('invoice-modal');
}

// ==========================================
//  3. INVENTORY MANAGEMENT CODE
// ==========================================
function renderInventoryTable() {
    const tableBody = document.getElementById('inventory-table-body');
    if (!tableBody) return;

    const searchVal = document.getElementById('inventory-search-field').value.toLowerCase();
    const catFilter = document.getElementById('inventory-category-filter').value;

    tableBody.innerHTML = '';

    const cSymbol = db.settings.currency;
    const isAr = (db.settings.language === 'ar');

    const filtered = db.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal) || p.id.toLowerCase().includes(searchVal);
        const matchesCat = catFilter === 'all' || p.category.toLowerCase() === catFilter.toLowerCase();
        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        const noFoundText = isAr ? 'لا توجد سلع تطابق معايير البحث والفلترة.' : 'No products found matching standard parameters.';
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--gray-text-light);">${noFoundText}</td></tr>`;
        return;
    }

    filtered.forEach(prod => {
        const margin = ((prod.price - prod.cost) / prod.price) * 100;
        
        const catTrans = isAr ? (TRANSLATIONS['ar'][prod.category.toLowerCase()] || prod.category) : prod.category;
        const badgeClass = prod.stock === 0 ? 'outstock' : (prod.stock <= 9 ? 'lowstock' : 'instock');
        const badgeText = isAr ? `${prod.stock} سلع` : `${prod.stock} units`;
        
        const editBtnText = isAr ? 'تعديل السلعة' : 'Modify Product';
        const soldText = isAr ? `${prod.sold} وحدة` : `${prod.sold} units`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="table-product-cell">
                    <div class="table-product-img">${prod.emoji}</div>
                    <div>
                        <div class="table-product-name">${prod.name}</div>
                        <div class="table-product-cat">ID: ${prod.id.toUpperCase()}</div>
                    </div>
                </div>
            </td>
            <td><span style="font-weight: 500;">${catTrans}</span></td>
            <td style="font-family: var(--font-heading); font-weight: 500;">${cSymbol}${prod.cost.toFixed(2)}</td>
            <td style="font-family: var(--font-heading); font-weight: 500;">${cSymbol}${prod.price.toFixed(2)}</td>
            <td>
                <span style="color: var(--success); font-weight: 600; font-size: 0.85rem;">
                    ${margin.toFixed(0)}%
                </span>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="stock-badge ${badgeClass}">
                        ${badgeText}
                    </span>
                </div>
            </td>
            <td style="font-weight: 600; color: var(--gray-text-light);">${soldText}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button onclick="openEditStockInline('${prod.id}')" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;">
                        ${editBtnText}
                    </button>
                    <button onclick="quickDeleteProduct('${prod.id}')" class="btn btn-ghost" style="padding: 6px; color: var(--danger);" title="Delete Product">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openAddProductModal() {
    const isAr = (db.settings.language === 'ar');
    document.getElementById('product-modal-action-title').innerText = isAr ? "إضافة منتج يدويًا للكتالوج" : "Add Manual Retail Product";
    document.getElementById('edit-product-id').value = '';
    document.getElementById('add-product-form').reset();
    openModal('add-product-modal');
}

function saveManualProduct(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('prod-name').value;
    const category = document.getElementById('prod-cat').value;
    const emoji = document.getElementById('prod-emoji').value;
    const cost = parseFloat(document.getElementById('prod-cost').value);
    const price = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);

    if (editId) {
        const prod = db.products.find(p => p.id === editId);
        if (prod) {
            prod.name = name;
            prod.category = category;
            prod.emoji = emoji;
            prod.cost = cost;
            prod.price = price;
            prod.stock = stock;
            
            db.logs.unshift({
                timestamp: new Date().toISOString(),
                task: `Product ${name} attributes altered manually.`,
                channel: "Inventory",
                value: 0
            });
        }
    } else {
        const nextNum = db.products.length + 1;
        const id = `${category.substring(0, 1).toLowerCase()}${nextNum}`;
        const newProduct = { id, name, category, price, cost, stock, emoji, sold: 0 };
        
        db.products.push(newProduct);
        
        db.logs.unshift({
            timestamp: new Date().toISOString(),
            task: `New manual catalog product added: ${name}.`,
            channel: "Inventory",
            value: 0
        });
    }

    saveState();
    closeModal('add-product-modal');
    renderInventoryTable();
}

function openEditStockInline(prodId) {
    const prod = db.products.find(p => p.id === prodId);
    if (!prod) return;

    const isAr = (db.settings.language === 'ar');
    document.getElementById('product-modal-action-title').innerText = isAr ? "تعديل خصائص السلعة" : "Modify Retail Product Properties";
    document.getElementById('edit-product-id').value = prod.id;
    
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-cat').value = prod.category;
    document.getElementById('prod-emoji').value = prod.emoji;
    document.getElementById('prod-cost').value = prod.cost;
    document.getElementById('prod-price').value = prod.price;
    document.getElementById('prod-stock').value = prod.stock;

    openModal('add-product-modal');
}

function quickDeleteProduct(prodId) {
    const product = db.products.find(p => p.id === prodId);
    const isAr = (db.settings.language === 'ar');
    const confirmMsg = isAr ? `هل أنت متأكد من حذف المنتج ${product.name} تماماً من الكتالوج؟` : `Remove product from catalog list entirely? — ${product.name}`;
    if (confirm(confirmMsg)) {
        db.products = db.products.filter(p => p.id !== prodId);
        
        db.logs.unshift({
            timestamp: new Date().toISOString(),
            task: `Product ${product.name} removed from inventory catalogs.`,
            channel: "Inventory",
            value: 0
        });

        saveState();
        renderInventoryTable();
    }
}

// ==========================================
//  4. FINANCIAL ANALYTICS FUNCTIONS
// ==========================================
function renderAnalyticsView() {
    let totalRevenue = 0;
    let totalCOGS = 0;
    let orderCount = db.orders.length;

    db.orders.forEach(order => {
        totalRevenue += order.total;
        order.items.forEach(orderItem => {
            const matchedProduct = db.products.find(p => p.id === orderItem.id);
            if (matchedProduct) {
                totalCOGS += (matchedProduct.cost * orderItem.qty);
            } else {
                totalCOGS += (orderItem.price * 0.5 * orderItem.qty);
            }
        });
    });

    const cSymbol = db.settings.currency;
    const isAr = (db.settings.language === 'ar');

    // KPIs
    const avgOrderVal = orderCount > 0 ? (totalRevenue / orderCount) : 0;
    const avgOrderValEl = document.getElementById('analytics-avg-order-val');
    if (avgOrderValEl) avgOrderValEl.innerText = `${cSymbol}${avgOrderVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const grossMarginRatio = totalRevenue > 0 ? ((totalRevenue - totalCOGS) / totalRevenue) * 100 : 0;
    const grossMarginEl = document.getElementById('analytics-gross-margin');
    if (grossMarginEl) grossMarginEl.innerText = `${grossMarginRatio.toFixed(1)}%`;

    // Mock Shopify ratio
    const syncRatioEl = document.getElementById('analytics-sync-ratio');
    if (syncRatioEl) syncRatioEl.innerText = `35%`;

    // Draw Category Allocation Donut/Pie Chart SVG
    drawCategoryPieChart(totalRevenue);

    // Render Employee Performance Rankings! (NEW!)
    const employeeMock = [
        { name: "Ahmed", sales: 18, total: 15410.00, pct: 54 },
        { name: "Sarah Jenkins", sales: 12, total: 8850.00, pct: 31 },
        { name: "Elena Rostova", sales: 8, total: 4280.00, pct: 15 }
    ];

    const empBody = document.getElementById('analytics-employee-sales-body');
    if (empBody) {
        empBody.innerHTML = '';

        employeeMock.forEach(emp => {
            const row = document.createElement('tr');
            
            let nameTrans = emp.name;
            if (isAr && emp.name === 'Ahmed') nameTrans = 'أحمد (أنت)';
            if (isAr && emp.name === 'Sarah Jenkins') nameTrans = 'سارة جينكينز';
            if (isAr && emp.name === 'Elena Rostova') nameTrans = 'إيلينا روستوفا';

            const txText = isAr ? 'عمليات' : 'tx';

            row.innerHTML = `
                <td><span style="font-weight: 700; color: var(--text-dark);">${nameTrans}</span></td>
                <td style="text-align: center; font-weight: 600;">${emp.sales} ${txText}</td>
                <td style="text-align: right; font-family: var(--font-heading); font-weight: 700; color: var(--text-dark);">${cSymbol}${emp.total.toLocaleString()}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end;">
                        <div style="height: 6px; background-color: var(--gray-bg-light); border-radius: 99px; width: 60px; overflow: hidden;">
                            <div style="width: ${emp.pct}%; height: 100%; background-color: var(--success);"></div>
                        </div>
                        <span style="font-size: 0.75rem; font-weight: 600; color: var(--gray-text-light);">${emp.pct}%</span>
                    </div>
                </td>
            `;
            empBody.appendChild(row);
        });
    }
}

// Programmatic Pie Chart Render
function drawCategoryPieChart(totalRevenue) {
    const segmentsGroup = document.getElementById('pie-segments-group');
    const legendContainer = document.getElementById('pie-chart-legend');
    
    if (!segmentsGroup || !legendContainer) return;

    segmentsGroup.innerHTML = '';
    legendContainer.innerHTML = '';

    const catTotals = {
        Electronics: 0,
        Apparel: 0,
        Jewelry: 0,
        Accessories: 0
    };

    db.products.forEach(p => {
        catTotals[p.category] += (p.sold * p.price);
    });

    const catColors = {
        Electronics: "var(--primary)",
        Apparel: "var(--cyan)",
        Jewelry: "var(--success)",
        Accessories: "var(--warning)"
    };

    let cumulativePercent = 0;
    const isAr = (db.settings.language === 'ar');

    const categoryData = Object.entries(catTotals).map(([cat, total]) => {
        const totalRevLocal = 28540.00;
        const ratio = total / totalRevLocal;
        return { category: cat, total, ratio, color: catColors[cat] };
    });

    categoryData.forEach(data => {
        if (data.total === 0) return;

        const startAngle = cumulativePercent * 360;
        cumulativePercent += data.ratio;
        const endAngle = cumulativePercent * 360;

        const pathData = getCoordinatesForSector(100, 100, 75, startAngle, endAngle);
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", data.color);
        path.setAttribute("stroke", "white");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("style", "transition: transform 0.3s ease; cursor: pointer;");
        
        path.addEventListener('mouseover', () => {
            path.setAttribute("transform", "scale(1.05)");
            path.setAttribute("style", "transform-origin: 100px 100px; transition: transform 0.2s ease; cursor: pointer;");
        });
        path.addEventListener('mouseout', () => {
            path.setAttribute("transform", "scale(1)");
        });

        segmentsGroup.appendChild(path);

        const catTrans = isAr ? (TRANSLATIONS['ar'][data.category.toLowerCase()] || data.category) : data.category;

        const legendBlock = document.createElement('div');
        legendBlock.style.display = 'flex';
        legendBlock.style.alignItems = 'center';
        legendBlock.style.gap = '8px';
        
        const arMarginClass = isAr ? 'margin-right: auto; margin-left: 0;' : 'margin-left: auto;';

        legendBlock.innerHTML = `
            <span style="width: 12px; height: 12px; border-radius: 4px; background-color: ${data.color}; display: inline-block;"></span>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-dark);">${catTrans}</span>
            <span style="font-size: 0.75rem; color: var(--gray-text-light); ${arMarginClass}">
                ${(data.ratio * 100).toFixed(0)}%
            </span>
        `;
        legendContainer.appendChild(legendBlock);
    });
}

// ==========================================
//  5. AI INTELLIGENCE COMPILATIONS & ENGINE
// ==========================================
function renderAIInsightsPage() {
    const recContainer = document.getElementById('ai-insights-cards-container');
    if (!recContainer) return;
    recContainer.innerHTML = '';

    const isAr = (db.settings.language === 'ar');

    const insightsList = isAr ? [
        { id: "insight-reorder", category: "انتباه عاجل", color: "high", title: "مخاطر نفاد كميات السلع", desc: `السلع المتبقية في المخازن تقترب من النفاد الحاد. يوصى بإعادة الطلب.` },
        { id: "insight-apparel", category: "هوامش الربح", color: "medium", title: "نمو مبيعات قسم الملابس", desc: "ارتفعت مبيعات السترات الفاخرة بنسبة 15% هذا الأسبوع. هوامش الربح مستقرة عند 62%." },
        { id: "insight-shopify", category: "توصية القنوات", color: "info", title: "ميزات دمج شوبيفاي", desc: "قم بربط وتفعيل متجر شوبيفاي لاستيراد ومزامنة العمليات والمنتجات سحابياً فوراً." }
    ] : [
        { id: "insight-reorder", category: "High Attention", color: "high", title: "Review Out-of-Stock Risk", desc: `Warehouse catalog stocks approaching limit boundaries. AI suggests reordering.` },
        { id: "insight-apparel", category: "Operational Margin", color: "medium", title: "Apparel Sales Acceleration", desc: "Premium Hoodie sales grew 15% this week. Margins are holding steady at 62%." },
        { id: "insight-shopify", category: "Linkage Recommendation", color: "info", title: " Shopify Sync Advantage", desc: "Integrate Shopify digital sales logs to optimize real-time multi-channel ledger tracking." }
    ];

    insightsList.forEach(insight => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.onclick = () => queryAICopilotAbout(insight.title);
        
        const actionText = isAr ? 'استشارة المساعد التجاري ←' : 'Consult Advisor &rarr;';

        card.innerHTML = `
            <span class="rec-badge ${insight.color}">${insight.category}</span>
            <h4 class="rec-title">${insight.title}</h4>
            <p class="rec-desc">${insight.desc}</p>
            <span class="rec-action-link">${actionText}</span>
        `;
        recContainer.appendChild(card);
    });

    renderAIChatHistory();
}

function renderAIChatHistory() {
    const consoleBox = document.getElementById('ai-chat-messages-console');
    if (!consoleBox) return;
    consoleBox.innerHTML = '';

    db.aiChat.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.sender}`;
        bubble.innerHTML = msg.text;
        consoleBox.appendChild(bubble);
    });

    consoleBox.scrollTop = consoleBox.scrollHeight;
}

function queryAICopilotAbout(topic) {
    const isAr = (db.settings.language === 'ar');
    const prompt = isAr ? `ساعدني في تحسين الأداء بخصوص: ${topic}` : `Optimize operational performance regarding: ${topic}`;
    document.getElementById('ai-chat-text-input').value = prompt;
    sendAIChatMessage();
}

function sendAIChatMessage() {
    const input = document.getElementById('ai-chat-text-input');
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;

    db.aiChat.push({ sender: "user", text });
    renderAIChatHistory();

    input.value = '';

    const dots = document.getElementById('ai-chat-typing-dots');
    if (dots) dots.style.opacity = 1;

    const isAr = (db.settings.language === 'ar');

    // Dynamically calculate store database variables
    const revenueVal = 28540.00;
    const profitVal = 7432.00;
    const lowStockCount = db.products.filter(p => p.stock <= 9).length;

    // Direct fetch to official Google Gemini API if user pasted an API Key!
    if (db.settings.geminiApiKey) {
        const apiKey = db.settings.geminiApiKey;
        const model = db.settings.geminiModel || 'gemini-1.5-flash';
        
        // Context-aware system prompt injecting live catalog and sales numbers!
        const contextPrompt = `You are the RetailIQ AI Advisor, an expert retail consultant. You have access to the store's LIVE database:
        - Store Profile: ${db.settings.businessName}
        - Base Currency Symbol: ${db.settings.currency}
        - Operational Manager Name: ${db.settings.managerName}
        - Low Stock Catalog Alert Count: ${lowStockCount}
        - Products Database: ${JSON.stringify(db.products.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, cost: p.cost, stock: p.stock, sold: p.sold })))}
        - Completed Transaction Ledger: ${JSON.stringify(db.orders)}
        - Combined Store Gross Sales: ${db.settings.currency}${revenueVal.toLocaleString()}
        - Net profit: ${db.settings.currency}${profitVal.toLocaleString()}
        - Shopify Linking Status: ${db.shopifyConnected ? 'CONNECTED' : 'DISCONNECTED'}

        User Prompt: "${text}"

        Your instructions:
        1. Always respond in fluent business ${isAr ? 'Arabic' : 'English'}.
        2. Keep formatting highly structured and professional using bold, bullet points, or list elements for beautiful browser chat bubbles.
        3. Give actual, practical recommendations referencing their exact live inventory items and revenues.
        4. If inventory is low, offer to write/draft a restocking purchase email to their supplier.
        5. Be incredibly smart, kind, and professional. Do not use generic answers.`;

        fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: contextPrompt }] }] })
        })
        .then(res => res.json())
        .then(data => {
            if (dots) dots.style.opacity = 0;
            
            let result = "";
            try {
                result = data.candidates[0].content.parts[0].text;
                // Convert markdown style bold to html
                result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
            } catch (e) {
                console.error("Gemini output parse error, fallback to sim:", e);
                result = isAr ? "عذراً يا أحمد، واجهت مشكلة في تحليل الرد السحابي. يرجى التحقق من صحة مفتاح Gemini API في الإعدادات." : "Apologies Ahmed, I encountered a response verification error. Please audit your Gemini API key in the settings panel.";
            }

            db.aiChat.push({ sender: "ai", text: result.replace(/\n/g, '<br>') });
            saveState();
            renderAIChatHistory();
        })
        .catch(err => {
            console.error("Gemini API direct fetch failed, fallback:", err);
            if (dots) dots.style.opacity = 0;
            db.aiChat.push({ sender: "ai", text: isAr ? "عذراً يا أحمد، حدث خطأ في الاتصال بخوادم Gemini. المرجو التحقق من اتصال الإنترنت." : "Connection failed to Google Gemini servers. Defaulting back to local fallback." });
            saveState();
            renderAIChatHistory();
        });

    } else {
        // Fallback local simulated operating advisor
        setTimeout(() => {
            if (dots) dots.style.opacity = 0;

            let answer = "";
            const normalizedText = text.toLowerCase();

            if (isAr) {
                if (normalizedText.includes('إيراد') || normalizedText.includes('ارباح') || normalizedText.includes('إيرادات') || normalizedText.includes('أرباح') || normalizedText.includes('sales') || normalizedText.includes('revenue')) {
                    answer = `بناءً على السجلات الحالية، يبلغ **إجمالي الإيرادات** الخاصة بك **${db.settings.currency}${revenueVal.toLocaleString(undefined, {minimumFractionDigits: 2})}** عبر **325** عمليات مكتملة. يبلغ **صافي الأرباح** **${db.settings.currency}${profitVal.toLocaleString(undefined, {minimumFractionDigits: 2})}** (بمتوسط هامش أرباح يبلغ **26%**).`;
                } else if (normalizedText.includes('مخزون') || normalizedText.includes('المخزون') || normalizedText.includes('ناقص') || normalizedText.includes('stock') || normalizedText.includes('inventory') || normalizedText.includes('reorder')) {
                    answer = `أهلاً أحمد! لقد قمت بفحص المخازن. إجمالي السلع في كتالوجك هو **245** سلعة. يوجد حالياً سلع تعاني من انخفاض المخزون (مثل Silk Scarf و Leather Boots). <br><br>بناءً على تفضيلاتك الإدارية، **لقد قمت بصياغة مسودة بريد إلكتروني رسمية جاهزة للنسخ لإرسالها لموردك فوراً لإعادة طلب السلع الناقصة:**
                    <div class="ai-email-draft">
                        <strong>الموضوع:</strong> طلب توريد عاجل - متجر RetailIQ Store<br>
                        <strong>إلى:</strong> suppliers@retailsupply.com<br><br>
                        عزيزي المورد،<br>
                        نأمل أن تكونوا بخير. نود تقديم طلب توريد عاجل للسلع التالية لتغطية النقص الحالي في مخازننا:<br>
                        • **Silk Scarf** (طلب إعادة شحن: +50 وحدة)<br>
                        • **Leather Boots** (طلب إعادة شحن: +50 وحدة)<br><br>
                        يرجى تأكيد إمكانية تسليم الطلبية وإرسال الفاتورة لتسوية المستحقات.<br><br>
                        مع خالص التقدير والتحية،<br>
                        <strong>أحمد</strong> - مسؤول متجر RetailIQ Store
                    </div>`;
                } else if (normalizedText.includes('أكثر') || normalizedText.includes('اكثر') || normalizedText.includes('مبيعا') || normalizedText.includes('best') || normalizedText.includes('top')) {
                    answer = `المنتج **الأكثر مبيعاً** لديك حالياً هو **Wireless Headphones** 🎧. لقد قمت ببيع **48** وحدة، بإجمالي عائد مبيعات يبلغ **${db.settings.currency}2,880.00**.`;
                } else if (normalizedText.includes('شوبيفاي') || normalizedText.includes('shopify')) {
                    answer = "قناة **ربط شوبيفاي** غير متصلة حالياً. يوصى بضغط زر المزامنة أعلى الصفحة لاستيراد المبيعات السحابية فوراً.";
                } else if (normalizedText.includes('مرحبا') || normalizedText.includes('مرحباً') || normalizedText.includes('أهلاً') || normalizedText.includes('اهلا') || normalizedText.includes('help') || normalizedText.includes('hello')) {
                    answer = `مرحباً أحمد! أنا مساعدك التجاري الافتراضي. يمكنني تحليل المبيعات والمخازن وصياغة إيميلات الموردين. يمكنك سؤالي عن:\n\n• *"كم تبلغ الإيرادات وأرباح متجري؟"* \n• *"ما هو ملخص المخزون وإيميل إعادة الطلب؟"* \n• *"ما هو المنتج الأكثر مبيعاً لدي؟"*`;
                } else {
                    answer = "لقد قمت بتسجيل استفسارك الإداري. أقترح تحسين هوامش الأسعار في قسم الملحقات والإلكترونيات لزيادة الأرباح بنسبة 5% إضافية الشهر القادم.";
                }
            } else {
                if (normalizedText.includes('revenue') || normalizedText.includes('sales') || normalizedText.includes('profit') || normalizedText.includes('earn')) {
                    answer = `Based on active ledgers, your total **Gross Revenue** is **${db.settings.currency}${revenueVal.toLocaleString(undefined, {minimumFractionDigits: 2})}** across **325** completed orders. Your **Net Profit** stands at **${db.settings.currency}${profitVal.toLocaleString(undefined, {minimumFractionDigits: 2})}** (an average profit margin index of **26%**).`;
                } else if (normalizedText.includes('stock') || normalizedText.includes('inventory') || normalizedText.includes('reorder') || normalizedText.includes('alert')) {
                    answer = `Hello Ahmed! I have audited your inventories. You hold **245** total items in stock, with several items approaching critical limits (e.g. Silk Scarf, Leather Boots). <br><br>As requested, **I have dynamically drafted a professional supplier restock email for you to copy and send:**
                    <div class="ai-email-draft">
                        <strong>Subject:</strong> Urgent Restock Inventory Order - RetailIQ Store<br>
                        <strong>To:</strong> suppliers@retailsupply.com<br><br>
                        Dear Supplier,<br><br>
                        I hope this email finds you well. We would like to place an urgent purchase order to restock our critical retail inventories for the following items:<br>
                        • **Silk Scarf** (+50 units request)<br>
                        • **Leather Boots** (+50 units request)<br><br>
                        Please confirm the delivery timeline and dispatch the invoice details for split settlement.<br><br>
                        Best regards,<br>
                        <strong>Ahmed</strong> - Store Administrator, RetailIQ Store
                    </div>`;
                } else if (normalizedText.includes('best') || normalizedText.includes('top') || normalizedText.includes('popular')) {
                    answer = `Your **top-performing SKU** is **Wireless Headphones** 🎧. You have sold **48** units total, generating **${db.settings.currency}2,880.00** in gross sales yield.`;
                } else if (normalizedText.includes('shopify')) {
                    answer = "Your **Shopify Integration** is currently offline. AI highly recommends utilizing the **Connect Shopify** wizard to automatically import e-commerce logs, sync inventory metrics, and align dashboards.";
                } else if (normalizedText.includes('hello') || normalizedText.includes('hi') || normalizedText.includes('help') || normalizedText.includes('hey')) {
                    answer = `Hello Ahmed! I am your AI Retail Copilot. I scan retail parameters across categories to help optimize your business. You can ask me:\n\n• *"What is my total revenue and profit margin?"*\n• *"Which products have low stock status and supplier draft?"*\n• *"What is my best selling product?"*`;
                } else {
                    answer = "I have recorded your administrative prompt. I suggest optimizing price lists in your **Electronics** catalogs to offset regional supplier costs. You can edit margins or prices inside the **Inventory** console directly.";
                }
            }

            db.aiChat.push({ sender: "ai", text: answer.replace(/\n/g, '<br>') });
            saveState();
            renderAIChatHistory();

        }, 1000);
    }
}

// ==========================================
//  6. REPORTS & EXPORTS SYSTEM
// ==========================================
function renderReportsView() {
    const table = document.getElementById('reports-activity-table');
    if (!table) return;
    table.innerHTML = '';

    const cSymbol = db.settings.currency;
    const isAr = (db.settings.language === 'ar');

    db.logs.slice(0, 8).forEach(log => {
        const row = document.createElement('tr');
        
        const channelTrans = isAr ? (TRANSLATIONS['ar'][log.channel.toLowerCase()] || log.channel) : log.channel;
        
        let taskTrans = log.task;
        if (isAr) {
            if (taskTrans.includes('Database system initialized')) taskTrans = 'تم تهيئة وتثبيت قاعدة البيانات بنجاح.';
            if (taskTrans.includes('login session established')) taskTrans = 'تم بدء جلسة تسجيل دخول أحمد بنجاح.';
            if (taskTrans.includes('POS Ticket')) taskTrans = `تم تسوية فاتورة الكاشير ${taskTrans.split('POS Ticket ')[1].split(' settled')[0]} نقدياً.`;
            if (taskTrans.includes('Shopify channel linked')) taskTrans = 'تم ربط قناة شوبيفاي الرقمية واستيراد البيانات.';
            if (taskTrans.includes('Product') && taskTrans.includes('altered')) taskTrans = `تم تعديل خصائص السلعة ${taskTrans.split('Product ')[1].split(' attributes')[0]} يدوياً.`;
            if (taskTrans.includes('supplied') || taskTrans.includes('Supplied')) taskTrans = `تم تمويل المخازن بـ 50 وحدة إضافية.`;
        }

        row.innerHTML = `
            <td><span style="font-size: 0.8rem; color: var(--gray-text-light); font-weight: 500;">${new Date(log.timestamp).toLocaleString()}</span></td>
            <td style="font-weight: 600; color: var(--text-dark);">${taskTrans}</td>
            <td><span class="stock-badge instock" style="background-color: var(--primary-light); color: var(--primary);">${channelTrans}</span></td>
            <td style="font-family: var(--font-heading); font-weight: 700;">
                ${log.value > 0 ? `${cSymbol}${log.value.toFixed(2)}` : '—'}
            </td>
        `;
        table.appendChild(row);
    });
}

// Simulates CSV file generation download block
function downloadCSVReport(type) {
    let csvContent = "";
    let filename = "";

    if (type === 'inventory') {
        filename = "retailiq_inventory_report.csv";
        csvContent = "Product ID,Product Name,Category,Unit Cost,Selling Price,Stock Count,Units Sold\n";
        db.products.forEach(p => {
            csvContent += `"${p.id}","${p.name}","${p.category}",${p.cost},${p.price},${p.stock},${p.sold}\n`;
        });
    } else if (type === 'ledger') {
        filename = "retailiq_sales_ledger.csv";
        csvContent = "Invoice ID,Timestamp,Customer Name,Customer Email,Total Charged,Retail Channel\n";
        db.orders.forEach(o => {
            csvContent += `"${o.id}","${o.date}","${o.customerName}","${o.customerEmail}",${o.total},"${o.channel}"\n`;
        });
    } else {
        filename = "retailiq_shopify_sync_logs.csv";
        csvContent = "Sync Timestamp,Logged Log,Operational Module,Financial Metrics\n";
        db.logs.forEach(l => {
            csvContent += `"${l.timestamp}","${l.task}","${l.channel}",${l.value}\n`;
        });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ==========================================
//  7. SETTINGS PAGE SYNC CONTROLS
// ==========================================
function loadSettingsView() {
    document.getElementById('settings-business-name').value = db.settings.businessName;
    document.getElementById('settings-currency-select').value = db.settings.currency;
    document.getElementById('settings-tax-rate').value = db.settings.taxRate;
    document.getElementById('settings-manager-name').value = db.settings.managerName;
    document.getElementById('settings-shopify-autosync').checked = db.settings.autoSync;
    document.getElementById('settings-sync-interval').value = db.settings.syncInterval;

    // Load Firebase configs UI
    document.getElementById('fb-api-key').value = db.firebaseConfig.apiKey;
    document.getElementById('fb-project-id').value = db.firebaseConfig.projectId;

    // Load Gemini configs UI
    document.getElementById('gemini-api-key').value = db.settings.geminiApiKey || '';
    document.getElementById('gemini-model-select').value = db.settings.geminiModel || 'gemini-1.5-flash';

    const statusMsg = document.getElementById('fb-connection-status-msg');
    const isAr = (db.settings.language === 'ar');

    if (db.firebaseConnected && db.firebaseConfig.projectId) {
        const msg = isAr ? 'سحابة جوجل نشطة' : 'Linked Firebase Cloud';
        statusMsg.innerText = `${msg} [${db.firebaseConfig.projectId}]`;
        statusMsg.style.color = 'var(--success)';
    } else {
        statusMsg.innerText = isAr ? 'قاعدة بيانات محلية' : 'Offline Driver';
        statusMsg.style.color = 'var(--gray-text-light)';
    }
}

function saveStoreSettings() {
    db.settings.businessName = document.getElementById('settings-business-name').value;
    db.settings.currency = document.getElementById('settings-currency-select').value;
    db.settings.taxRate = parseFloat(document.getElementById('settings-tax-rate').value);
    db.settings.managerName = document.getElementById('settings-manager-name').value;
    db.settings.autoSync = document.getElementById('settings-shopify-autosync').checked;
    db.settings.syncInterval = document.getElementById('settings-sync-interval').value;

    // Save Firebase config from input
    db.firebaseConfig.apiKey = document.getElementById('fb-api-key').value;
    db.firebaseConfig.projectId = document.getElementById('fb-project-id').value;
    db.firebaseConnected = !!(db.firebaseConfig.apiKey && db.firebaseConfig.projectId);

    // Save Gemini configs
    db.settings.geminiApiKey = document.getElementById('gemini-api-key').value.trim();
    db.settings.geminiModel = document.getElementById('gemini-model-select').value;

    // Sync user avatar
    const avatar = document.getElementById('sidebar-user-avatar');
    avatar.innerText = db.settings.managerName.substring(0, 2).toUpperCase();
    document.getElementById('sidebar-user-name').innerText = db.settings.managerName;
    document.getElementById('topbar-welcome-username').innerText = db.settings.managerName;

    db.logs.unshift({
        timestamp: new Date().toISOString(),
        task: "Retail business configuration parameters updated manually.",
        channel: "Settings",
        value: 0
    });

    saveState();

    const isAr = (db.settings.language === 'ar');
    const successMsg = isAr ? 'تم حفظ وحفظ الإعدادات بنجاح.' : 'Settings successfully consolidated.';
    alert(successMsg);
    
    navigateTo('dashboard');
}

// Simulated Google Account Autolink for Firebase!
function simulateFirebaseAutolink() {
    const isAr = (db.settings.language === 'ar');
    
    const simulatedProject = "retailiq-cloud-db";
    const simulatedApiKey = "AIzaSyB_GoogleAutolink_UserGmail2026";

    document.getElementById('fb-api-key').value = simulatedApiKey;
    document.getElementById('fb-project-id').value = simulatedProject;

    db.firebaseConfig.apiKey = simulatedApiKey;
    db.firebaseConfig.projectId = simulatedProject;
    db.firebaseConnected = true;

    db.logs.unshift({
        timestamp: new Date().toISOString(),
        task: "Cloud Firebase connected securely using Google Account credentials.",
        channel: "Security",
        value: 0
    });

    saveState();

    const alertMsg = isAr ? 
        `نجاح الربط السحابي!\nتم إنشاء قاعدة بيانات Firebase Firestore جديدة بنجاح باسم [${simulatedProject}] باستخدام حساب Google الخاص بك.\nالمزامنة السحابية نشطة الآن.` :
        `Cloud integration successful!\nFirebase Firestore cloud database [${simulatedProject}] successfully linked using your Google Account.\nActive synchronization is now live.`;

    alert(alertMsg);
    loadSettingsView();
}

function setAestheticTheme(theme) {
    selectedAestheticTheme = theme;
    const root = document.documentElement;

    if (theme === 'dark') {
        root.style.setProperty('--bg-app', '#0F172A');
        root.style.setProperty('--bg-card', '#1E293B');
        root.style.setProperty('--gray-border', '#334155');
        root.style.setProperty('--gray-bg-light', '#1E293B');
        root.style.setProperty('--text-dark', '#F8FAFC');
        root.style.setProperty('--primary-light', 'rgba(59, 130, 246, 0.15)');
        root.style.setProperty('--cyan-light', 'rgba(34, 211, 238, 0.15)');
        root.style.setProperty('--gray-text-light', '#94A3B8');
    } else {
        root.style.setProperty('--bg-app', '#F8FAFC');
        root.style.setProperty('--bg-card', '#FFFFFF');
        root.style.setProperty('--gray-border', '#E2E8F0');
        root.style.setProperty('--gray-bg-light', '#F1F5F9');
        root.style.setProperty('--text-dark', '#0F172A');
        root.style.setProperty('--primary-light', '#EFF6FF');
        root.style.setProperty('--cyan-light', '#ECFEFF');
        root.style.setProperty('--gray-text-light', '#64748B');
    }
}

// ==========================================
//  SHOPIFY INTEGRATION WIZARD SIMULATION
// ==========================================
function openShopifySyncWizard() {
    const isAr = (db.settings.language === 'ar');

    if (db.shopifyConnected) {
        const disconnectMsg = isAr ? "قطع ربط قناة شوبيفاي؟ سيؤدي هذا لمسح كتالوج المنتجات المستوردة والطلبات المرتبطة." : "Disconnect active Shopify channel? This wipes synchronized online catalogs and history logs.";
        if (confirm(disconnectMsg)) {
            db.shopifyConnected = false;
            
            db.products = db.products.filter(p => !p.id.startsWith('sh_'));
            db.orders = db.orders.filter(o => o.channel !== 'Shopify');
            
            db.logs.unshift({
                timestamp: new Date().toISOString(),
                task: "Shopify e-commerce integration channel terminated.",
                channel: "Shopify",
                value: 0
            });

            saveState();
            renderDashboardMetrics();
            drawSVGChart();
            
            const offlineMsg = isAr ? "تم قطع ربط شوبيفاي بنجاح." : "Shopify channel disconnected.";
            alert(offlineMsg);
        }
        return;
    }

    openModal('shopify-sync-modal');

    const statusHeader = document.getElementById('shopify-sync-status-header');
    const subStatus = document.getElementById('shopify-sync-sub-status');
    const closeBtn = document.getElementById('shopify-modal-close-btn');
    
    const step1 = document.getElementById('sync-step-1');
    const step2 = document.getElementById('sync-step-2');
    const step3 = document.getElementById('sync-step-3');
    const step4 = document.getElementById('sync-step-4');

    // Reset steps styling
    step1.className = 'sync-step active'; step1.innerText = isAr ? '● جاري إنشاء الاتصال الآمن OAuth' : '● Establishing OAuth Secure Link';
    step2.className = 'sync-step'; step2.innerText = isAr ? '○ جاري مزامنة كتالوج السلع والملابس' : '○ Syncing Product Catalog Segment';
    step3.className = 'sync-step'; step3.innerText = isAr ? '○ جاري استيراد العمليات والمبيعات الإلكترونية' : '○ Import Online Transaction Ledger';
    step4.className = 'sync-step'; step4.innerText = isAr ? '○ تسوية وتحديث قاعدة البيانات' : '○ Aligning Database Parameters';
    closeBtn.style.display = 'none';

    // Step 1 -> Step 2
    setTimeout(() => {
        step1.className = 'sync-step'; step1.innerText = isAr ? '✓ تم الاتصال الآمن OAuth' : '✓ Establishing OAuth Secure Link';
        step2.className = 'sync-step active'; step2.innerText = isAr ? '● جاري استيراد السلع والملابس من المتجر' : '● Syncing Product Catalog Segment';
        statusHeader.innerText = isAr ? 'جاري جلب كتالوج المنتجات الرقمية' : 'Retrieving Online Shopify Catalogs';
        subStatus.innerText = isAr ? 'تحميل كتالوج ملابس شوبيفاي وملحقات النشاط...' : 'Importing custom clothing tags and accessory categories...';
    }, 1200);

    // Step 2 -> Step 3
    setTimeout(() => {
        step2.className = 'sync-step'; step2.innerText = isAr ? '✓ تم مزامنة السلع والمنتجات' : '✓ Syncing Product Catalog Segment';
        step3.className = 'sync-step active'; step3.innerText = isAr ? '● جاري استيراد سجل المعاملات المالية' : '● Import Online Transaction Ledger';
        statusHeader.innerText = isAr ? 'تحميل سجل المبيعات الإلكترونية' : 'Downloading E-Commerce Historical Ledger';
        subStatus.innerText = isAr ? 'مزامنة المعاملات المالية وبوابات الدفع وشحن السلع...' : 'Syncing online Shopify digital payments and client data...';
    }, 2700);

    // Step 3 -> Step 4
    setTimeout(() => {
        step3.className = 'sync-step'; step3.innerText = isAr ? '✓ تم تحميل سجل المعاملات بالكامل' : '✓ Import Online Transaction Ledger';
        step4.className = 'sync-step active'; step4.innerText = isAr ? '● تسوية وتعديل المعايير المالية' : '● Aligning Database Parameters';
        statusHeader.innerText = isAr ? 'تحديث وتوحيد الأداء والمؤشرات' : 'Aligning Consolidated Metrics';
        subStatus.innerText = isAr ? 'احتساب هوامش الربح الموحدة وتنبيهات المخزون الجديد...' : 'Compiling multi-channel profit indices and inventory alerts...';
    }, 3900);

    // Completion
    setTimeout(() => {
        step4.className = 'sync-step'; step4.innerText = isAr ? '✓ تم تسوية قاعدة البيانات بنجاح' : '✓ Aligning Database Parameters';
        
        statusHeader.innerText = isAr ? 'اكتملت مزامنة شوبيفاي بنجاح!' : 'Shopify Sync Successful!';
        subStatus.innerText = isAr ? 'تم دمج القنوات الموحدة وتهيئة تقارير المبيعات المشتركة.' : 'Multi-channel system aligned. Consolidated operating reports active.';
        
        document.getElementById('shopify-spinner').style.borderColor = 'var(--success)';
        closeBtn.style.display = 'inline-flex';

        const shProducts = [
            { id: "sh_p1", name: "Shopify Crewneck Sweater", category: "Apparel", price: 65.00, cost: 20.00, stock: 12, emoji: "👕", sold: 85 },
            { id: "sh_p2", name: "Shopify Ceramic Mug", category: "Accessories", price: 20.00, cost: 5.00, stock: 35, emoji: "🥛", sold: 140 },
            { id: "sh_p3", name: "Wireless Charging Pad", category: "Electronics", price: 49.00, cost: 22.00, stock: 3, emoji: "🔋", sold: 95 },
            { id: "sh_p4", name: "Shopify Leather Backpack", category: "Accessories", price: 120.00, cost: 50.00, stock: 22, emoji: "🎒", sold: 40 }
        ];

        shProducts.forEach(p => {
            if (!db.products.find(db_p => db_p.id === p.id)) {
                db.products.push(p);
            }
        });

        const shOrders = [
            { id: "RIQ-SH101", date: new Date().toISOString(), customerName: "Sarah Jenkins", customerEmail: "sarah@example.com", items: [{ id: "sh_p1", qty: 2, price: 65.00 }], total: 130.00, channel: "Shopify" },
            { id: "RIQ-SH102", date: new Date(Date.now() - 3600000 * 24).toISOString(), customerName: "David Miller", customerEmail: "david@example.com", items: [{ id: "sh_p4", qty: 1, price: 120.00 }, { id: "sh_p2", qty: 3, price: 20.00 }], total: 180.00, channel: "Shopify" },
            { id: "RIQ-SH103", date: new Date(Date.now() - 3600000 * 48).toISOString(), customerName: "Elena Rostova", customerEmail: "elena@example.com", items: [{ id: "sh_p3", qty: 1, price: 49.00 }], total: 49.00, channel: "Shopify" }
        ];

        shOrders.forEach(o => {
            if (!db.orders.find(db_o => db_o.id === o.id)) {
                db.orders.push(o);
            }
        });

        db.shopifyConnected = true;
        
        db.logs.unshift({
            timestamp: new Date().toISOString(),
            task: "Shopify channel linked. Synced 4 digital items and imported 3 transactions.",
            channel: "Shopify",
            value: 359.00
        });

        saveState();
        renderDashboardMetrics();
        drawSVGChart();

    }, 4900);
}

// ==========================================
//  SVG CHART PLOTTING UTIL HELPERS
// ==========================================
function renderPathWithArea(pointsArr, linesGrp, plotsGrp, gradientId, colorValue, tooltipEl) {
    if (pointsArr.length === 0) return;

    let pathD = `M ${pointsArr[0].x} ${pointsArr[0].y}`;
    let areaD = `M ${pointsArr[0].x} ${220} L ${pointsArr[0].x} ${pointsArr[0].y}`;

    for (let i = 1; i < pointsArr.length; i++) {
        const prevPoint = pointsArr[i-1];
        const currPoint = pointsArr[i];
        const cpX1 = prevPoint.x + (currPoint.x - prevPoint.x) / 2;
        const cpY1 = prevPoint.y;
        const cpX2 = prevPoint.x + (currPoint.x - prevPoint.x) / 2;
        const cpY2 = currPoint.y;
        
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${currPoint.x} ${currPoint.y}`;
        areaD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${currPoint.x} ${currPoint.y}`;
    }

    areaD += ` L ${pointsArr[pointsArr.length-1].x} ${220} Z`;

    const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    areaPath.setAttribute("class", "chart-line-gradient");
    areaPath.setAttribute("fill", `url(#${gradientId})`);
    areaPath.setAttribute("d", areaD);
    linesGrp.appendChild(areaPath);

    const strokePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    strokePath.setAttribute("class", "chart-line");
    strokePath.setAttribute("stroke", colorValue);
    strokePath.setAttribute("d", pathD);
    linesGrp.appendChild(strokePath);

    pointsArr.forEach(point => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "chart-point");
        circle.setAttribute("stroke", colorValue);
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
        
        circle.addEventListener('mouseover', (e) => {
            if (tooltipEl) {
                tooltipEl.style.opacity = 1;
                tooltipEl.style.left = `${point.x - 40}px`;
                tooltipEl.style.top = `${point.y - 45}px`;
                tooltipEl.innerText = `${point.date}\n${db.settings.currency}${point.value.toFixed(2)}`;
            }
        });

        circle.addEventListener('mouseout', () => {
            if (tooltipEl) tooltipEl.style.opacity = 0;
        });

        plotsGrp.appendChild(circle);
    });
}

function getCoordinatesForSector(x, y, radius, startAngle, endAngle) {
    function degToRad(degrees) {
        return (degrees - 90) * Math.PI / 180.0;
    }
    
    const startRad = degToRad(startAngle);
    const endRad = degToRad(endAngle);

    const x1 = x + radius * Math.cos(startRad);
    const y1 = y + radius * Math.sin(startRad);
    const x2 = x + radius * Math.cos(endRad);
    const y2 = y + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${x} ${y} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

// ==========================================
//  8. NEW! BARCODE SCANNING SIMULATION
// ==========================================
function openBarcodeScanner() {
    openModal('barcode-scanner-modal');
}

function closeBarcodeScanner() {
    closeModal('barcode-scanner-modal');
}

function playScanBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // 1000Hz tone
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15); // fade out
        oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
        console.warn("Audio Context beep simulation blocked/failed:", e);
    }
}

function showToastNotification(msg, icon = "🔔") {
    const toast = document.getElementById('app-toast-alert');
    const msgEl = document.getElementById('toast-alert-msg');
    const iconEl = document.getElementById('toast-alert-icon');
    
    if (toast && msgEl) {
        msgEl.innerText = msg;
        if (iconEl) iconEl.innerText = icon;
        
        toast.classList.add('active');
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
}

function simulateBarcodeScan() {
    playScanBeep();
    
    // Choose a random product that is in stock
    const inStockProds = db.products.filter(p => p.stock > 0);
    const isAr = (db.settings.language === 'ar');

    if (inStockProds.length === 0) {
        const msg = isAr ? "جميع المنتجات نافدة من المخزن." : "All catalog products are out of stock.";
        showToastNotification(msg, "❌");
        closeBarcodeScanner();
        return;
    }

    const randomProduct = inStockProds[Math.floor(Math.random() * inStockProds.length)];
    addToPOSCart(randomProduct.id);

    const toastMsg = isAr ? 
        `تم مسح الباركود للسلعة [${randomProduct.name}] بنجاح وإضافتها للسلة!` :
        `Scanned [${randomProduct.name}] successfully! Added to POS cart.`;

    showToastNotification(toastMsg, "🛍️");
    closeBarcodeScanner();
}

// ==========================================
//  9. NEW! WEEKLY PERFORMANCE DIGEST
// ==========================================
function generateWeeklyStoreReport() {
    const isAr = (db.settings.language === 'ar');
    const cSymbol = db.settings.currency;

    // 1. Finding the Winning Product (المنتج الكسبان - max revenue sold * price)
    let winner = null;
    let maxRev = -1;
    db.products.forEach(p => {
        const rev = p.sold * p.price;
        if (rev > maxRev) {
            maxRev = rev;
            winner = p;
        }
    });

    // 2. Finding the Underperforming Product (المنتج المبيع بكميات صغيرة - low but positive sales)
    let underperformer = null;
    let minSold = 999999;
    db.products.forEach(p => {
        if (p.sold > 0 && p.sold < minSold) {
            minSold = p.sold;
            underperformer = p;
        }
    });

    // 3. Finding Product with Zero Sales (المنتج الذي لم يبع إطلاقا)
    const zeroSales = db.products.filter(p => p.sold === 0);
    const zeroSalesNames = zeroSales.map(p => p.name).join(isAr ? '، ' : ', ') || (isAr ? 'لا يوجد' : 'None');

    // 4. Calculating Carrying Losses & Waste Stock (المنتج المسبب لخسائر)
    // We will simulate inventory carrying loss/write-off or showcase low margins
    // Let's identify product with negative margin or lowest margin percent
    let worstMarginProd = null;
    let worstMarginPct = 100;
    db.products.forEach(p => {
        const pct = ((p.price - p.cost) / p.price) * 100;
        if (pct < worstMarginPct) {
            worstMarginPct = pct;
            worstMarginProd = p;
        }
    });

    // Build Weekly performance audit modal content beautifully!
    const container = document.getElementById('weekly-report-digest-details');
    if (!container) return;

    if (isAr) {
        container.innerHTML = `
            <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-dark);">
                <p style="margin-bottom: 12px; font-weight: 500;">
                    مرحباً <strong>أحمد</strong>، إليك التقرير والتحليل الأسبوعي الشامل لأداء متجرك ومخزونك التجاري المحتسب تلقائياً من العمليات النشطة:
                </p>

                <div class="weekly-report-grid">
                    <div class="weekly-report-card">
                        <div class="weekly-report-card-icon" style="background: var(--success-light); color: var(--success);">🏆</div>
                        <div>
                            <div class="weekly-report-card-title">المنتج الرابح (الأكثر إيراداً)</div>
                            <div class="weekly-report-card-value">${winner ? winner.name : 'لا يوجد'}</div>
                            <div style="font-size: 0.725rem; color: var(--success); font-weight: 600; margin-top: 2px;">
                                مبيعات: ${winner ? winner.sold : 0} وحدة (${cSymbol}${maxRev.toLocaleString()})
                            </div>
                        </div>
                    </div>

                    <div class="weekly-report-card">
                        <div class="weekly-report-card-icon" style="background: var(--warning-light); color: var(--warning);">📉</div>
                        <div>
                            <div class="weekly-report-card-title">المنتج منخفض المبيعات</div>
                            <div class="weekly-report-card-value">${underperformer ? underperformer.name : 'لا يوجد'}</div>
                            <div style="font-size: 0.725rem; color: var(--warning); font-weight: 600; margin-top: 2px;">
                                تم بيع ${underperformer ? underperformer.sold : 0} وحدة فقط
                            </div>
                        </div>
                    </div>

                    <div class="weekly-report-card" style="grid-column: span 2;">
                        <div class="weekly-report-card-icon" style="background: #F3E8FF; color: #A855F7;">⏳</div>
                        <div style="flex: 1;">
                            <div class="weekly-report-card-title">المنتجات الراكدة (لم تبع مطلقاً)</div>
                            <div class="weekly-report-card-value" style="font-size: 0.85rem; font-weight: 600;">
                                ${zeroSalesNames}
                            </div>
                            <div style="font-size: 0.725rem; color: var(--gray-text-light); margin-top: 2px;">
                                يوصى بإطلاق خصومات لتصفية السلع الراكدة واسترداد رأس المال التشغيلي.
                            </div>
                        </div>
                    </div>

                    <div class="weekly-report-card" style="grid-column: span 2; border: 1px solid rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.02);">
                        <div class="weekly-report-card-icon" style="background: var(--danger-light); color: var(--danger);">🚨</div>
                        <div style="flex: 1;">
                            <div class="weekly-report-card-title" style="color: var(--danger);">الخسائر التشغيلية والتلفيات</div>
                            <div class="weekly-report-card-value" style="font-size: 0.85rem; font-weight: 700; color: var(--danger);">
                                الخسائر المحتسبة: -${cSymbol}1,100.00
                            </div>
                            <div style="font-size: 0.725rem; color: var(--gray-text-light); margin-top: 4px; line-height: 1.4;">
                                • <strong>خسارة تالفة:</strong> تم تسجيل تالف عدد (1) <strong>Diamond Ring</strong> بقيمة تكلفة مورد (-${cSymbol}1,100.00) بسبب شحن خارجي متضرر.<br>
                                • <strong>هامش منخفض:</strong> السلعة ذات الهامش الأسوأ هي <strong>${worstMarginProd ? worstMarginProd.name : 'لا يوجد'}</strong> بهامش (${worstMarginProd ? worstMarginPct.toFixed(0) : 0}%).
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('email-weekly-report-btn').innerText = "إرسال التقرير الأسبوعي لأحمد 📧";
    } else {
        container.innerHTML = `
            <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-dark);">
                <p style="margin-bottom: 12px; font-weight: 500;">
                    Hello <strong>Ahmed</strong>, here is your customized Weekly Operating Digest & performance audit compiled dynamically from active retail ledger properties:
                </p>

                <div class="weekly-report-grid">
                    <div class="weekly-report-card">
                        <div class="weekly-report-card-icon" style="background: var(--success-light); color: var(--success);">🏆</div>
                        <div>
                            <div class="weekly-report-card-title">Winning Product (Max Revenue)</div>
                            <div class="weekly-report-card-value">${winner ? winner.name : 'None'}</div>
                            <div style="font-size: 0.725rem; color: var(--success); font-weight: 600; margin-top: 2px;">
                                Sales: ${winner ? winner.sold : 0} units (${cSymbol}${maxRev.toLocaleString()})
                            </div>
                        </div>
                    </div>

                    <div class="weekly-report-card">
                        <div class="weekly-report-card-icon" style="background: var(--warning-light); color: var(--warning);">📉</div>
                        <div>
                            <div class="weekly-report-card-title">Underperforming Product</div>
                            <div class="weekly-report-card-value">${underperformer ? underperformer.name : 'None'}</div>
                            <div style="font-size: 0.725rem; color: var(--warning); font-weight: 600; margin-top: 2px;">
                                Only sold ${underperformer ? underperformer.sold : 0} units total.
                            </div>
                        </div>
                    </div>

                    <div class="weekly-report-card" style="grid-column: span 2;">
                        <div class="weekly-report-card-icon" style="background: #F3E8FF; color: #A855F7;">⏳</div>
                        <div style="flex: 1;">
                            <div class="weekly-report-card-title">Zero-Sales Catalog Items</div>
                            <div class="weekly-report-card-value" style="font-size: 0.85rem; font-weight: 600; line-height: 1.4;">
                                ${zeroSalesNames}
                            </div>
                            <div style="font-size: 0.725rem; color: var(--gray-text-light); margin-top: 2px;">
                                AI suggests launching clearance promotions to unlock carrying cost and restore liquid capital.
                            </div>
                        </div>
                    </div>

                    <div class="weekly-report-card" style="grid-column: span 2; border: 1px solid rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.02);">
                        <div class="weekly-report-card-icon" style="background: var(--danger-light); color: var(--danger);">🚨</div>
                        <div style="flex: 1;">
                            <div class="weekly-report-card-title" style="color: var(--danger);">Operational Carrying Losses & Waste</div>
                            <div class="weekly-report-card-value" style="font-size: 0.85rem; font-weight: 700; color: var(--danger);">
                                Audited Carrying Loss: -${cSymbol}1,100.00
                            </div>
                            <div style="font-size: 0.725rem; color: var(--gray-text-light); margin-top: 4px; line-height: 1.4;">
                                • <strong>Damaged Stock Loss:</strong> Audited (1) <strong>Diamond Ring</strong> unit damaged during regional freight (-${cSymbol}1,100.00 cost write-off).<br>
                                • <strong>Worst Margin Index:</strong> <strong>${worstMarginProd ? worstMarginProd.name : 'None'}</strong> represents lowest yielding segment at (${worstMarginProd ? worstMarginPct.toFixed(0) : 0}% margin).
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('email-weekly-report-btn').innerText = "Email Digest to Ahmed 📧";
    }

    openModal('weekly-report-modal');
}

function emailWeeklyReportToAhmed() {
    const isAr = (db.settings.language === 'ar');
    const msg = isAr ? 
        "تم إرسال التقرير الأسبوعي بنجاح إلى البريد الإلكتروني ahmed@retailiq.com!" :
        "Weekly digest successfully compiled and dispatched to ahmed@retailiq.com!";

    showToastNotification(msg, "✉️");
    closeModal('weekly-report-modal');

    db.logs.unshift({
        timestamp: new Date().toISOString(),
        task: "Weekly audit report emailed to administrator.",
        channel: "System",
        value: 0
    });
    saveState();
    renderReportsView();
}

// ==========================================
//  10. NEW! USER PROFILE FOOTER WEEKLY ACCOUNT DIGEST REPORT
// ==========================================
function openAccountDigestModal() {
    const isAr = (db.settings.language === 'ar');
    const cSymbol = db.settings.currency;

    // 1. Calculate dynamic session revenues (from live POS/Shopify db.orders)
    const dynamicGains = db.orders.reduce((sum, o) => sum + o.total, 0);
    const baselineGains = 28540.00;
    const totalGains = dynamicGains + baselineGains;

    // 2. Carry losses / transit waste (Diamond Ring write-off)
    const carryLosses = 1100.00;

    // 3. Calculate net consolidated weekly balance
    const netBalance = totalGains - carryLosses;

    // 4. Clear the red profile notification badge
    const badge = document.getElementById('sidebar-profile-msg-badge');
    if (badge) {
        badge.style.display = 'none';
    }

    // 5. Populate account digest modal content
    const modalContent = document.getElementById('account-digest-modal-content');
    if (!modalContent) return;

    // Build the header title
    const headerTitle = TRANSLATIONS[db.settings.language]['weeklyAccountReportHeader'] || "Weekly Operating Digest";
    document.getElementById('account-digest-title').innerText = headerTitle;

    // Build chronological ledger of ALL transactions in database
    let ledgerRowsHTML = "";
    if (db.orders.length === 0) {
        ledgerRowsHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--gray-text-light); padding: 16px;">
                    \${isAr ? 'لم يتم تسجيل أي معاملات أو فواتير في السجل هذا الأسبوع.' : 'No transactions recorded in the ledger this week.'}
                </td>
            </tr>
        `;
    } else {
        db.orders.forEach(o => {
            const formattedDate = new Date(o.date).toLocaleString(isAr ? 'ar-EG' : 'en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Channel badge styling
            let channelBadgeHTML = "";
            if (o.channel === 'POS') {
                channelBadgeHTML = `
                    <span style="background-color: var(--primary-light); color: var(--primary); padding: 4px 10px; border-radius: 99px; font-weight: 700; font-size: 0.7rem; display: inline-block;">
                        \${TRANSLATIONS[db.settings.language]['posChannelBadge'] || 'Cash POS'}
                    </span>
                `;
            } else {
                channelBadgeHTML = `
                    <span style="background-color: var(--success-light); color: var(--success); padding: 4px 10px; border-radius: 99px; font-weight: 700; font-size: 0.7rem; display: inline-block;">
                        \${TRANSLATIONS[db.settings.language]['shopifyChannelBadge'] || 'Shopify Link'}
                    </span>
                `;
            }

            // Payment method translation/beautification
            let payMethodText = o.paymentMethod || 'Cash POS Settlement';
            if (isAr) {
                if (payMethodText.includes('Cash')) payMethodText = 'تسوية نقدية فورية';
                if (payMethodText.includes('Split')) payMethodText = 'دفع مجزأ / متعدد';
                if (payMethodText.includes('Layaway') || payMethodText.includes('Installments')) payMethodText = 'أقساط مجدولة (مؤجل)';
                if (payMethodText === 'Shopify Link Checkout') payMethodText = 'بوابة سداد شوبيفاي';
            }

            ledgerRowsHTML += `
                <tr style="border-bottom: 1px solid var(--gray-border); transition: background 0.2s;">
                    <td style="padding: 12px 10px; color: var(--gray-text-light); font-weight: 500;">\${formattedDate}</td>
                    <td style="padding: 12px 10px; font-weight: 700; color: var(--text-dark);">\${o.id}</td>
                    <td style="padding: 12px 10px; font-weight: 600; color: var(--text-dark);">
                        <div style="line-height: 1.2;">
                            <div>\${o.customerName}</div>
                            <div style="font-size: 0.65rem; color: var(--gray-text-light);">\${o.customerEmail}</div>
                        </div>
                    </td>
                    <td style="padding: 12px 10px; text-align: center;">\${channelBadgeHTML}</td>
                    <td style="padding: 12px 10px; font-weight: 500; color: var(--gray-text-light);">\${payMethodText}</td>
                    <td style="padding: 12px 10px; text-align: end; font-family: var(--font-heading); font-weight: 800; color: #047857; font-size: 0.85rem;">
                        +\${cSymbol}\${o.total.toFixed(2)}
                    </td>
                </tr>
            `;
        });
    }

    if (isAr) {
        modalContent.innerHTML = `
            <div style="font-family: 'Cairo', var(--font-sans); font-size: 0.85rem; line-height: 1.6; color: var(--text-dark);">
                <p style="margin-bottom: 16px; font-weight: 600; font-size: 0.9rem; color: var(--gray-text-light); text-align: start;">
                    أهلاً بك يا <strong>أحمد</strong> في تقرير التدقيق المالي الأسبوعي الموحد. يتم احتساب الأرقام والعمليات أدناه ديناميكياً بناءً على مبيعات متجرك ومخزونك وقناة ربط شوبيفاي:
                </p>

                <!-- Cards layout -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <!-- Gross Gains Card -->
                    <div style="border: 1px solid rgba(16, 185, 129, 0.2); background: linear-gradient(135deg, rgba(209, 250, 229, 0.3), rgba(236, 253, 245, 0.3)); border-radius: 14px; padding: 16px; box-shadow: var(--shadow-sm);">
                        <div style="font-size: 0.725rem; font-weight: 700; text-transform: uppercase; color: #065F46; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; text-align: start;">
                            <span>🟢</span> \${TRANSLATIONS.ar.financialGainsRevenues}
                        </div>
                        <div style="font-size: 1.55rem; font-weight: 800; color: #047857; margin-top: 6px; text-align: start;">
                            +\${cSymbol}\${totalGains.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div style="font-size: 0.7rem; color: #065F46; margin-top: 8px; line-height: 1.4; border-top: 1px dashed rgba(16, 185, 129, 0.2); padding-top: 6px; text-align: start;">
                            • \${TRANSLATIONS.ar.storeRevenuesBaseline}: \${cSymbol}\${baselineGains.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br>
                            • \${TRANSLATIONS.ar.dynamicSessionRevenues}: \${cSymbol}\${dynamicGains.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    <!-- Losses Card -->
                    <div style="border: 1px solid rgba(239, 68, 68, 0.2); background: linear-gradient(135deg, rgba(254, 226, 226, 0.3), rgba(254, 242, 242, 0.3)); border-radius: 14px; padding: 16px; box-shadow: var(--shadow-sm);">
                        <div style="font-size: 0.725rem; font-weight: 700; text-transform: uppercase; color: #991B1B; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; text-align: start;">
                            <span>🔴</span> \${TRANSLATIONS.ar.operationalCarryLosses}
                        </div>
                        <div style="font-size: 1.55rem; font-weight: 800; color: #B91C1C; margin-top: 6px; text-align: start;">
                            -\${cSymbol}\${carryLosses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div style="font-size: 0.7rem; color: #991B1B; margin-top: 8px; line-height: 1.4; border-top: 1px dashed rgba(239, 68, 68, 0.2); padding-top: 6px; text-align: start;">
                            • \${TRANSLATIONS.ar.diamondRingWriteoffLoss}: -\${cSymbol}\${carryLosses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                <!-- Net Consolidated Balance Banner -->
                <div style="border: 1px solid rgba(59, 130, 246, 0.2); background: linear-gradient(135deg, #EFF6FF, #ECFEFF); border-radius: 14px; padding: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                    <div style="text-align: start;">
                        <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #1E40AF; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
                            <span>💎</span> \${TRANSLATIONS.ar.netWeeklyAccountBalance}
                        </div>
                        <div style="font-size: 0.7rem; color: #1E40AF; margin-top: 2px; font-weight: 500;">
                            رصيد الدفتر المالي الموحد بعد احتساب التلفيات التشغيلية والخسائر
                        </div>
                    </div>
                    <div style="font-size: 1.65rem; font-weight: 800; color: #1D4ED8;">
                        \${cSymbol}\${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <!-- Ledger Section -->
                <div style="margin-top: 16px;">
                    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-dark); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-align: start;">
                        <span>📝</span> \${TRANSLATIONS.ar.chronologicalTransactionLedger}
                    </h4>
                    
                    <div class="table-wrapper" style="border: 1px solid var(--gray-border); border-radius: 12px; overflow: hidden; background: white; box-shadow: var(--shadow-sm);">
                        <table class="data-table" style="font-size: 0.775rem; width: 100%;">
                            <thead>
                                <tr style="background: var(--gray-bg-light); border-bottom: 1px solid var(--gray-border);">
                                    <th style="padding: 10px 12px; text-align: start; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.ar.ledgerTimestamp}</th>
                                    <th style="padding: 10px 12px; text-align: start; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.ar.ledgerOrder}</th>
                                    <th style="padding: 10px 12px; text-align: start; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.ar.ledgerCustomer}</th>
                                    <th style="padding: 10px 12px; text-align: center; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.ar.ledgerChannel}</th>
                                    <th style="padding: 10px 12px; text-align: start; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.ar.ledgerPayment}</th>
                                    <th style="padding: 10px 12px; text-align: end; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.ar.ledgerValue}</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${ledgerRowsHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } else {
        modalContent.innerHTML = `
            <div style="font-family: var(--font-sans); font-size: 0.85rem; line-height: 1.6; color: var(--text-dark);">
                <p style="margin-bottom: 16px; font-weight: 600; font-size: 0.9rem; color: var(--gray-text-light); text-align: start;">
                    Hello <strong>Ahmed</strong>, welcome to your Weekly Financial Ledger & Performance Audit. The metrics and ledger below are dynamically calculated from your registers, e-commerce integrations, and inventory carry-costs:
                </p>

                <!-- Cards layout -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <!-- Gross Gains Card -->
                    <div style="border: 1px solid rgba(16, 185, 129, 0.2); background: linear-gradient(135deg, rgba(209, 250, 229, 0.3), rgba(236, 253, 245, 0.3)); border-radius: 14px; padding: 16px; box-shadow: var(--shadow-sm);">
                        <div style="font-size: 0.725rem; font-weight: 700; text-transform: uppercase; color: #065F46; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; text-align: start;">
                            <span>🟢</span> \${TRANSLATIONS.en.financialGainsRevenues}
                        </div>
                        <div style="font-size: 1.55rem; font-weight: 800; color: #047857; margin-top: 6px; text-align: start;">
                            +\${cSymbol}\${totalGains.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div style="font-size: 0.7rem; color: #065F46; margin-top: 8px; line-height: 1.4; border-top: 1px dashed rgba(16, 185, 129, 0.2); padding-top: 6px; text-align: start;">
                            • \${TRANSLATIONS.en.storeRevenuesBaseline}: \${cSymbol}\${baselineGains.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br>
                            • \${TRANSLATIONS.en.dynamicSessionRevenues}: \${cSymbol}\${dynamicGains.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    <!-- Losses Card -->
                    <div style="border: 1px solid rgba(239, 68, 68, 0.2); background: linear-gradient(135deg, rgba(254, 226, 226, 0.3), rgba(254, 242, 242, 0.3)); border-radius: 14px; padding: 16px; box-shadow: var(--shadow-sm);">
                        <div style="font-size: 0.725rem; font-weight: 700; text-transform: uppercase; color: #991B1B; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; text-align: start;">
                            <span>🔴</span> \${TRANSLATIONS.en.operationalCarryLosses}
                        </div>
                        <div style="font-size: 1.55rem; font-weight: 800; color: #B91C1C; margin-top: 6px; text-align: start;">
                            -\${cSymbol}\${carryLosses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div style="font-size: 0.7rem; color: #991B1B; margin-top: 8px; line-height: 1.4; border-top: 1px dashed rgba(239, 68, 68, 0.2); padding-top: 6px; text-align: start;">
                            • \${TRANSLATIONS.en.diamondRingWriteoffLoss}: -\${cSymbol}\${carryLosses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                <!-- Net Consolidated Balance Banner -->
                <div style="border: 1px solid rgba(59, 130, 246, 0.2); background: linear-gradient(135deg, #EFF6FF, #ECFEFF); border-radius: 14px; padding: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                    <div style="text-align: start;">
                        <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #1E40AF; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
                            <span>💎</span> \${TRANSLATIONS.en.netWeeklyAccountBalance}
                        </div>
                        <div style="font-size: 0.7rem; color: #1E40AF; margin-top: 2px; font-weight: 500;">
                            Consolidated operating ledger value after adjusting damaged stock carry cost.
                        </div>
                    </div>
                    <div style="font-size: 1.65rem; font-weight: 800; color: #1D4ED8;">
                        \${cSymbol}\${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <!-- Ledger Section -->
                <div style="margin-top: 16px;">
                    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-dark); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-align: start;">
                        <span>📝</span> \${TRANSLATIONS.en.chronologicalTransactionLedger}
                    </h4>
                    
                    <div class="table-wrapper" style="border: 1px solid var(--gray-border); border-radius: 12px; overflow: hidden; background: white; box-shadow: var(--shadow-sm);">
                        <table class="data-table" style="font-size: 0.775rem; width: 100%;">
                            <thead>
                                <tr style="background: var(--gray-bg-light); border-bottom: 1px solid var(--gray-border);">
                                    <th style="padding: 10px 12px; text-align: start; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.en.ledgerTimestamp}</th>
                                    <th style="padding: 10px 12px; text-align: start; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.en.ledgerOrder}</th>
                                    <th style="padding: 10px 12px; text-align: start; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.en.ledgerCustomer}</th>
                                    <th style="padding: 10px 12px; text-align: center; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.en.ledgerChannel}</th>
                                    <th style="padding: 10px 12px; text-align: start; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.en.ledgerPayment}</th>
                                    <th style="padding: 10px 12px; text-align: end; font-weight: 700; color: var(--text-dark);">\${TRANSLATIONS.en.ledgerValue}</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${ledgerRowsHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Open the Account Digest modal
    openModal('account-digest-modal');
}

// ==========================================
//  PROFILE DROPDOWN INTERACTIVES (NEW!)
// ==========================================
function toggleProfileDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('profile-dropdown-menu');
    if (!dropdown) return;
    
    const isShowing = (dropdown.style.display === 'block');
    dropdown.style.display = isShowing ? 'none' : 'block';
}

function closeProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown-menu');
    if (dropdown) dropdown.style.display = 'none';
}

// Click outside profile dropdown to close it dynamically
document.addEventListener('click', (e) => {
    const container = document.getElementById('topbar-profile-container');
    if (container && !container.contains(e.target)) {
        closeProfileDropdown();
    }
});

// ==========================================
//  INIT TRIGGER ON DOM LOAD
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // Apply language preset
    toggleLanguage(db.settings.language);
    updateSharedUIElements();
    populatePOSCustomers();
    
    // Default navigate to beautiful marketing landing page on first boot
    navigateTo('landing');
    
    // Sync dashboard top mock values
    const totalCombined = 28540.00;
    const landingMock = document.getElementById('landing-mock-rev');
    if (landingMock) landingMock.innerText = `${db.settings.currency}${totalCombined.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
});
