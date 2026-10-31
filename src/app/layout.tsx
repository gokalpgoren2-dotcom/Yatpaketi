import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { MobileBar } from "@/components/MobileBar";
import { RouteTransition } from "@/components/RouteTransition";

const display = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces" });
const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yatpaketi.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "yatpaketi | Yat ve Tekne Kiralama", template: "%s | yatpaketi" },
  description:
    "Türkiye'nin en özel koylarını gulet, motoryat, katamaran ve yelkenli seçenekleriyle keşfedin. Mavi yolculuk için rezervasyon talebi oluşturun.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "yatpaketi", locale: "tr_TR" },
};

export const viewport: Viewport = { themeColor: "#06264b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${sans.variable}`}>
      <body className="pb-16 lg:pb-0">
        {children}
        <MobileBar />
        <RouteTransition />
      </body>
    </html>
  );
}
