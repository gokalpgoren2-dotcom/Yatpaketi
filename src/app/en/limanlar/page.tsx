import type { Metadata } from "next";
import { DestinationsView } from "@/views/DestinationsView";

export const metadata: Metadata = {
  title: "Ports",
  description: "Boat charter routes from the ports of Bodrum, Göcek, Fethiye, Marmaris, Datça and Kaş.",
  alternates: { canonical: "/en/limanlar", languages: { tr: "/limanlar", en: "/en/limanlar", ru: "/ru/limanlar" } },
};

export const revalidate = 60;

export default function DestinationsPageEn() {
  return <DestinationsView lang="en" />;
}
