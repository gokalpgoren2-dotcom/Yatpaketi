import type { Metadata } from "next";
import { DestinationsView } from "@/views/DestinationsView";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Boat charter routes departing from Göcek, Bodrum, Fethiye, Marmaris and Antalya.",
  alternates: { canonical: "/en/destinasyonlar", languages: { tr: "/destinasyonlar", en: "/en/destinasyonlar" } },
};

export const revalidate = 60;

export default function DestinationsPageEn() {
  return <DestinationsView lang="en" />;
}
