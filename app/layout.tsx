import type { Metadata } from "next";
import { DM_Serif_Display, Outfit } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { ChatWidget } from "@/components/ChatWidget";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "ShopBot — Curated by AI",
  description:
    "Discover handpicked products with AI-powered recommendations. Premium shopping, intelligently curated.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${dmSerif.variable} ${outfit.className} grain`}>
        {/* Toaster wraps everything so useToast() works anywhere */}
        <Toaster>
          <Navbar />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          <Footer />
          <CartDrawer />
          <ChatWidget />
        </Toaster>
      </body>
    </html>
  );
}
