import type { Metadata } from "next";
import { DestinationsView } from "@/views/DestinationsView";

export const metadata: Metadata = {
  title: "Порты",
  description: "Аренда яхт из портов Бодрум, Гёджек, Фетхие, Мармарис, Датча и Каш.",
  alternates: { canonical: "/ru/limanlar", languages: { tr: "/limanlar", en: "/en/limanlar", ru: "/ru/limanlar" } },
};

export const revalidate = 60;

export default function DestinationsPageRu() {
  return <DestinationsView lang="ru" />;
}
