import type { Metadata } from "next";
import { HomeView } from "@/views/HomeView";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "yatpaketi | Аренда яхт в Турции" },
  description: "Откройте красивейшие бухты Турции на гулете, моторной яхте, катамаране или парусной яхте. Отправьте запрос на голубой круиз.",
  alternates: { canonical: "/ru", languages: { tr: "/", en: "/en", ru: "/ru" } },
  openGraph: { type: "website", siteName: "yatpaketi", locale: "ru_RU" },
};

export default function HomeRu() {
  return <HomeView lang="ru" />;
}
