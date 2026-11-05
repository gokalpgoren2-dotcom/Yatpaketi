import type { Metadata } from "next";
import { BoatsListView, type SP } from "@/views/BoatsListView";

// Rezervasyon talep formu hazır olana kadar arama motorlarına kapalı.
export const metadata: Metadata = {
  title: "Kiralık Yatlar",
  description: "Gulet, motoryat, katamaran ve yelkenli seçeneklerini filtreleyin.",
  alternates: { canonical: "/tekneler", languages: { tr: "/tekneler", en: "/en/tekneler", ru: "/ru/tekneler" } },
  robots: { index: false, follow: true },
};

export const revalidate = 60;

export default async function BoatsPage({ searchParams }: { searchParams: Promise<SP> }) {
  return <BoatsListView lang="tr" sp={await searchParams} />;
}
