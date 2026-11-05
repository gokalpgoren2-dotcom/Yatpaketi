import type { Metadata } from "next";
import { HomeView } from "@/views/HomeView";

// Panelden yapılan değişiklikler en geç bir dakika içinde görünür.
export const revalidate = 60;

export const metadata: Metadata = { alternates: { canonical: "/", languages: { tr: "/", en: "/en", ru: "/ru" } } };

export default function Home() {
  return <HomeView lang="tr" />;
}
