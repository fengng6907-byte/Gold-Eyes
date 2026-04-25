import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CurrencyCalculatorModal from "@/components/calculator/CurrencyCalculatorModal";

export const metadata: Metadata = {
  title: {
    default: "GOLD Eyes — Real-Time Gold Price Analytics",
    template: "%s | GOLD Eyes",
  },
  description:
    "Real-time global gold price insights with Malaysia & Singapore focus. Track XAU/USD spot prices, estimate jewelry costs, and convert currencies instantly.",
  keywords: [
    "gold price",
    "XAU/USD",
    "Malaysia gold",
    "916 gold",
    "999 gold",
    "gold price Malaysia",
    "gold price MYR",
    "gold calculator",
    "jewelry price estimator",
  ],
  openGraph: {
    title: "GOLD Eyes — Real-Time Gold Price Analytics",
    description:
      "Track live gold prices, Malaysia 916/999 benchmarks, and estimate retail jewelry pricing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* Floating currency calculator — accessible from any page */}
        <CurrencyCalculatorModal />
      </body>
    </html>
  );
}
