import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import { TranslationProvider } from "@/hooks/useI18n";
import { DatabaseProvider } from "@/context/DatabaseContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "RetailIQ — AI-Powered Retail Operating System",
  description: "RetailIQ combines POS register channels, inventory tracking, financial analytics, accounting, and Shopify automation into one premium SaaS operating console.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50/50 text-slate-900 flex flex-col font-sans transition-colors duration-200">
        <DatabaseProvider>
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </DatabaseProvider>
      </body>
    </html>
  );
}
