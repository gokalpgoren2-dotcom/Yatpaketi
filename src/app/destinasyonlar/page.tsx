import type { Metadata } from "next";
import { DestinationsView } from "@/views/DestinationsView";

export const metadata: Metadata = {
  title: "Destinasyonlar",
  description: "Bodrum, Göcek, Fethiye, Marmaris, Datça ve Kaş çıkışlı tekne kiralama rotaları.",
  alternates: { canonical: "/destinasyonlar", languages: { tr: "/destinasyonlar", en: "/en/destinasyonlar" } },
};

export const revalidate = 60;

export default function DestinationsPage() {
  return <DestinationsView lang="tr" />;
}
