import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yatpaketi AI Office",
  description: "Yatpaketi ajan ofisi: görev verin, durumu izleyin, raporları okuyun.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#041a35", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
