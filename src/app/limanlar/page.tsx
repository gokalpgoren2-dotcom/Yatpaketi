import type { Metadata } from "next";
import { DestinationsView } from "@/views/DestinationsView";

export const metadata: Metadata = {
  title: "Limanlar",
  description: "Bodrum, Göcek, Fethiye, Marmaris, Datça ve Kaş limanlarından yat kiralama rotaları.",
  alternates: { canonical: "/limanlar", languages: { tr: "/limanlar", en: "/en/limanlar", ru: "/ru/limanlar" } },
};

export const revalidate = 60;

export default function DestinationsPage() {
  return <DestinationsView lang="tr" />;
}
