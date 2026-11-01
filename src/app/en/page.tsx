import type { Metadata } from "next";
import { HomeView } from "@/views/HomeView";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "yatpaketi | Yacht and Boat Charter in Türkiye" },
  description: "Discover Türkiye's most beautiful bays on a gulet, motor yacht, catamaran or sailing yacht. Send your blue voyage reservation request.",
  alternates: { canonical: "/en", languages: { tr: "/", en: "/en" } },
  openGraph: { type: "website", siteName: "yatpaketi", locale: "en_GB" },
};

export default function HomeEn() {
  return <HomeView lang="en" />;
}
